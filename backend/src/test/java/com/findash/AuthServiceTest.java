package com.findash;

import com.findash.dto.AuthResponse;
import com.findash.dto.LoginRequest;
import com.findash.dto.RegisterRequest;
import com.findash.model.User;
import com.findash.repository.UserRepository;
import com.findash.security.JwtTokenProvider;
import com.findash.service.AuthService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthService Unit Tests")
class AuthServiceTest {

    @Mock
    private UserRepository userRepo;
    @Mock
    private PasswordEncoder encoder;
    @Mock
    private JwtTokenProvider jwt;
    @Mock
    private AuthenticationManager authManager;

    @InjectMocks
    private AuthService authService;

    @Test
    @DisplayName("register should succeed with valid new user")
    void register_ValidUser_ReturnsAuthResponse() {
        RegisterRequest req = new RegisterRequest(
                "jane.smith", "jane@findash.io", "Password@99", User.Role.ANALYST);

        when(userRepo.existsByUsername("jane.smith")).thenReturn(false);
        when(userRepo.existsByEmail("jane@findash.io")).thenReturn(false);
        when(encoder.encode(anyString())).thenReturn("hashed-password");
        when(userRepo.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));
        when(jwt.generateFromUsername(anyString(), anyString())).thenReturn("mock-token");
        when(jwt.getExpirationMs()).thenReturn(86400000L);

        AuthResponse response = authService.register(req);

        assertThat(response.token()).isEqualTo("mock-token");
        assertThat(response.username()).isEqualTo("jane.smith");
        assertThat(response.role()).isEqualTo("ANALYST");
    }

    @Test
    @DisplayName("register should throw when username already exists")
    void register_DuplicateUsername_ThrowsException() {
        RegisterRequest req = new RegisterRequest(
                "admin", "other@findash.io", "Password@99", null);

        when(userRepo.existsByUsername("admin")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(req))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Username already taken");
    }

    @Test
    @DisplayName("register should throw when email already registered")
    void register_DuplicateEmail_ThrowsException() {
        RegisterRequest req = new RegisterRequest(
                "newuser", "admin@findash.io", "Password@99", null);

        when(userRepo.existsByUsername("newuser")).thenReturn(false);
        when(userRepo.existsByEmail("admin@findash.io")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(req))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Email already registered");
    }

    @Test
    @DisplayName("register should default to VIEWER role when role not specified")
    void register_NullRole_DefaultsToViewer() {
        RegisterRequest req = new RegisterRequest(
                "newviewer", "viewer2@findash.io", "Password@99", null);

        when(userRepo.existsByUsername(anyString())).thenReturn(false);
        when(userRepo.existsByEmail(anyString())).thenReturn(false);
        when(encoder.encode(anyString())).thenReturn("hashed");
        when(userRepo.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));
        when(jwt.generateFromUsername(anyString(), anyString())).thenReturn("token");
        when(jwt.getExpirationMs()).thenReturn(86400000L);

        AuthResponse response = authService.register(req);

        assertThat(response.role()).isEqualTo("VIEWER");
    }

    @Test
    @DisplayName("login should return token on valid credentials")
    void login_ValidCredentials_ReturnsToken() {
        LoginRequest req = new LoginRequest("admin", "Admin@123");

        User user = User.builder()
                .username("admin")
                .email("admin@findash.io")
                .password("hashed")
                .role(User.Role.ADMIN)
                .build();

        when(authManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(mock(org.springframework.security.core.Authentication.class));
        when(userRepo.findByUsername("admin")).thenReturn(Optional.of(user));
        when(jwt.generate(any())).thenReturn("access-token");
        when(jwt.getExpirationMs()).thenReturn(86400000L);

        AuthResponse response = authService.login(req);

        assertThat(response.token()).isEqualTo("access-token");
        assertThat(response.role()).isEqualTo("ADMIN");
    }

    @Test
    @DisplayName("login should throw on bad credentials")
    void login_BadCredentials_ThrowsException() {
        LoginRequest req = new LoginRequest("admin", "wrong-password");

        when(authManager.authenticate(any()))
                .thenThrow(new BadCredentialsException("Bad credentials"));

        assertThatThrownBy(() -> authService.login(req))
                .isInstanceOf(BadCredentialsException.class);
    }
}