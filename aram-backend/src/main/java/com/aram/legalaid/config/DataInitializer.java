package com.aram.legalaid.config;

import com.aram.legalaid.enums.ComplaintCategory;
import com.aram.legalaid.enums.Role;
import com.aram.legalaid.enums.UserStatus;
import com.aram.legalaid.model.Authority;
import com.aram.legalaid.model.User;
import com.aram.legalaid.repository.AuthorityRepository;
import com.aram.legalaid.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {
    @Bean
    CommandLineRunner seed(UserRepository userRepository, AuthorityRepository authorityRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            if (!userRepository.existsByEmail("admin@aram.ai")) {
                User admin = new User();
                admin.setName("ARAM Admin");
                admin.setEmail("admin@aram.ai");
                admin.setMobile("9876543210");
                admin.setPasswordHash(passwordEncoder.encode("Admin@123"));
                admin.setRole(Role.ADMIN);
                admin.setStatus(UserStatus.ACTIVE);
                userRepository.save(admin);
            }
            if (authorityRepository.count() == 0) {
                addAuthority(authorityRepository, "Labour Office", ComplaintCategory.LABOUR_DISPUTE, "Handles salary, wages, employment termination and workplace disputes.");
                addAuthority(authorityRepository, "Consumer Disputes Redressal Commission", ComplaintCategory.CONSUMER_COMPLAINT, "Handles product, refund, warranty and service deficiency complaints.");
                addAuthority(authorityRepository, "Cyber Crime Cell", ComplaintCategory.CYBER_CRIME, "Handles online fraud, UPI fraud, hacked account and cyber complaints.");
                addAuthority(authorityRepository, "Civil Court / Revenue Office", ComplaintCategory.PROPERTY_CIVIL_DISPUTE, "Handles land, property boundary and ownership disputes.");
                addAuthority(authorityRepository, "Police Station / Women Help Cell", ComplaintCategory.WOMEN_SAFETY_DOMESTIC_VIOLENCE, "Handles safety, domestic violence, harassment and threat complaints.");
                addAuthority(authorityRepository, "Police Station", ComplaintCategory.CRIMINAL_COMPLAINT, "Handles theft, assault, threat and criminal incidents.");
                addAuthority(authorityRepository, "District Legal Services Authority", ComplaintCategory.GENERAL_LEGAL_AID, "Provides general legal aid and guidance support.");
            }
            if (!userRepository.existsByEmail("advocate@aram.ai")) {
                User advocate = new User();
                advocate.setName("ARAM Advocate");
                advocate.setEmail("advocate@aram.ai");
                advocate.setMobile("9876543211");
                advocate.setPasswordHash(passwordEncoder.encode("Advocate@123"));
                advocate.setRole(Role.ADVOCATE);
                advocate.setStatus(UserStatus.ACTIVE);
                userRepository.save(advocate);
            }
            if (!userRepository.existsByEmail("officer@aram.ai")) {
                User officer = new User();
                officer.setName("ARAM Authority Officer");
                officer.setEmail("officer@aram.ai");
                officer.setMobile("9876543212");
                officer.setPasswordHash(passwordEncoder.encode("Officer@123"));
                officer.setRole(Role.AUTHORITY);
                officer.setStatus(UserStatus.ACTIVE);
                
                // Find and associate Labour Office authority
                Authority labourOffice = authorityRepository.findAll().stream()
                        .filter(a -> a.getName().equals("Labour Office"))
                        .findFirst()
                        .orElse(null);
                officer.setAssociatedAuthority(labourOffice);
                userRepository.save(officer);
            }
        };
    }

    private void addAuthority(AuthorityRepository repository, String name, ComplaintCategory category, String description) {
        Authority authority = new Authority();
        authority.setName(name);
        authority.setCategory(category);
        authority.setDistrict("Default District");
        authority.setPhone("Not Available");
        authority.setAddress("Update with local office address");
        authority.setDescription(description);
        repository.save(authority);
    }
}
