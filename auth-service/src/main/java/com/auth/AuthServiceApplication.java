package com.auth;

import com.auth.entity.AppUser;
import com.auth.entity.Role;
import com.auth.entity.UserStatus;
import com.auth.repository.AppUserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class AuthServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(AuthServiceApplication.class, args);
    }

    @Bean
    public CommandLineRunner demoUserSeeder(AppUserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            if (userRepository.count() == 0) {
                // Seed Admin
                AppUser admin = new AppUser();
                admin.setName("Admin User");
                admin.setEmail("admin@aram.ai");
                admin.setMobile("9876543210");
                admin.setPasswordHash(passwordEncoder.encode("Admin@123"));
                admin.setRole(Role.ADMIN);
                admin.setStatus(UserStatus.ACTIVE);
                userRepository.save(admin);

                // Seed Helper/Volunteer
                AppUser helper = new AppUser();
                helper.setName("Sharon ");
                helper.setEmail("volunteer@aram.ai");
                helper.setMobile("8876543210");
                helper.setPasswordHash(passwordEncoder.encode("Helper@123"));
                helper.setRole(Role.HELPER);
                helper.setStatus(UserStatus.ACTIVE);
                userRepository.save(helper);

                // Seed Citizen
                AppUser citizen = new AppUser();
                citizen.setName("Rajesh Kumar");
                citizen.setEmail("citizen@aram.ai");
                citizen.setMobile("7876543210");
                citizen.setPasswordHash(passwordEncoder.encode("Citizen@123"));
                citizen.setRole(Role.CITIZEN);
                citizen.setStatus(UserStatus.ACTIVE);
                userRepository.save(citizen);

                System.out.println(">>> Demo users seeded successfully in Database!");
            }
        };
    }
}
