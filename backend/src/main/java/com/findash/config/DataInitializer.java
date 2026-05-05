package com.findash.config;

import com.findash.model.Transaction;
import com.findash.model.User;
import com.findash.repository.TransactionRepository;
import com.findash.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepo;
    private final TransactionRepository txnRepo;
    private final PasswordEncoder encoder;

    private static final String DEFAULT_PASSWORD = "Admin@123";

    @Override
    public void run(String... args) {
        seedUsers();
        seedTransactions();
    }

    private void seedUsers() {
        if (userRepo.existsByUsername("admin")) {
            log.info("Seed data already present — skipping");
            return;
        }

        userRepo.save(User.builder()
                .username("admin")
                .email("admin@findash.io")
                .password(encoder.encode(DEFAULT_PASSWORD))
                .role(User.Role.ADMIN)
                .build());

        userRepo.save(User.builder()
                .username("analyst")
                .email("analyst@findash.io")
                .password(encoder.encode(DEFAULT_PASSWORD))
                .role(User.Role.ANALYST)
                .build());

        userRepo.save(User.builder()
                .username("viewer")
                .email("viewer@findash.io")
                .password(encoder.encode(DEFAULT_PASSWORD))
                .role(User.Role.VIEWER)
                .build());

        log.info("Seeded 3 users — admin / analyst / viewer — password: {}", DEFAULT_PASSWORD);
    }

    private void seedTransactions() {
        if (txnRepo.count() > 0)
            return;

        Object[][] seeds = {
                { "DEPOSIT", "COMPLETED", "4823.50", false, null },
                { "TRANSFER", "COMPLETED", "1200.00", false, null },
                { "PAYMENT", "COMPLETED", "389.75", false, null },
                { "DEPOSIT", "COMPLETED", "15420.00", true, "LARGE_AMOUNT" },
                { "WITHDRAWAL", "FAILED", "800.00", false, null },
                { "DEPOSIT", "COMPLETED", "3175.25", false, null },
                { "TRANSFER", "COMPLETED", "920.00", false, null },
                { "PAYMENT", "FLAGGED", "12500.00", true, "LARGE_AMOUNT" },
                { "DEPOSIT", "COMPLETED", "6340.80", false, null },
                { "WITHDRAWAL", "COMPLETED", "475.00", false, null },
        };

        for (Object[] seed : seeds) {
            txnRepo.save(Transaction.builder()
                    .referenceId("FD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                    .type(Transaction.TransactionType.valueOf((String) seed[0]))
                    .status(Transaction.TransactionStatus.valueOf((String) seed[1]))
                    .amount(new BigDecimal((String) seed[2]))
                    .currency("USD")
                    .flagged((Boolean) seed[3])
                    .flagReason((String) seed[4])
                    .description("Seeded transaction")
                    .build());
        }
        log.info("Seeded 10 demo transactions");
    }
}