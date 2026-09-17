package com.aram.legalaid;

import com.aram.legalaid.enums.Role;
import com.aram.legalaid.enums.UserStatus;
import com.aram.legalaid.model.User;
import com.aram.legalaid.repository.UserRepository;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableAsync
@EnableScheduling
public class LegalAidApplication {
    public static void main(String[] args) {
        SpringApplication.run(LegalAidApplication.class, args);
    }

    @Bean
    public CommandLineRunner demoUserSeeder(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            if (userRepository.count() == 0) {
                // Seed Admin
                User admin = new User();
                admin.setName("Admin User");
                admin.setEmail("admin@gmail.com");
                admin.setMobile("9876543210");
                admin.setPasswordHash(passwordEncoder.encode("Admin@123"));
                admin.setRole(Role.ADMIN);
                admin.setStatus(UserStatus.ACTIVE);
                userRepository.save(admin);

                // Seed Helper/Volunteer
                User helper = new User();
                helper.setName("Sharon ");
                helper.setEmail("volunteer@gmail.com");
                helper.setMobile("8876543210");
                helper.setPasswordHash(passwordEncoder.encode("Helper@123"));
                helper.setRole(Role.HELPER);
                helper.setStatus(UserStatus.ACTIVE);
                userRepository.save(helper);

                // Seed Citizen
                User citizen = new User();
                citizen.setName("Rajesh Kumar");
                citizen.setEmail("citizen@gmail.com");
                citizen.setMobile("7876543210");
                citizen.setPasswordHash(passwordEncoder.encode("Citizen@123"));
                citizen.setRole(Role.CITIZEN);
                citizen.setStatus(UserStatus.ACTIVE);
                userRepository.save(citizen);

                System.out.println(">>> Demo users seeded successfully in H2 Database!");
            }
        };
    }
}
