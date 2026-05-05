package com.findash.service;

import com.findash.dto.AuthResponse;
import com.findash.dto.LoginRequest;
import com.findash.dto.RegisterRequest;
import com.findash.model.User;
import com.findash.repository.UserRepository;
import com.findash.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepo;
    private final PasswordEncoder encoder;
    private final JwtTokenProvider jwt;
    private final AuthenticationManager authManager;

    public AuthResponse login(LoginRequest req) {
        Authentication auth = authManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.username(), req.password()));
        String token = jwt.generate(auth);
        User user = userRepo.findByUsername(req.username()).orElseThrow();
        log.info("Login successful: {}", req.username());
        return new AuthResponse(token, user.getUsername(), user.getEmail(),
                user.getRole().name(), jwt.getExpirationMs());
    }

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        if (userRepo.existsByUsername(req.username()))
            throw new IllegalArgumentException("Username already taken: " + req.username());
        if (userRepo.existsByEmail(req.email()))
            throw new IllegalArgumentException("Email already registered: " + req.email());

        User.Role role = req.role() != null ? req.role() : User.Role.VIEWER;
        User user = User.builder()
                .username(req.username())
                .email(req.email())
                .password(encoder.encode(req.password()))
                .role(role)
                .build();
        userRepo.save(user);

        String token = jwt.generateFromUsername(user.getUsername(), role.name());
        log.info("Registered new user: {} ({})", req.username(), role);
        return new AuthResponse(token, user.getUsername(), user.getEmail(),
                role.name(), jwt.getExpirationMs());
    }
}