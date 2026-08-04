package com.aram.legalaid.service;

import com.aram.legalaid.model.VolunteerMatchingTrainingSample;
import com.aram.legalaid.repository.VolunteerMatchingTrainingSampleRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;

@Service
public class DatasetImportService {

    @Autowired
    private VolunteerMatchingTrainingSampleRepository trainingSampleRepository;

    @PostConstruct
    public void init() {
        try {
            importVolunteerMatchingDataset();
        } catch (Exception e) {
            System.err.println("Error importing volunteer matching dataset: " + e.getMessage());
        }
    }

    public void importVolunteerMatchingDataset() throws Exception {
        // Path relative to the running spring-boot process in aram-backend
        File csvFile = new File("../ai-service/datasets/volunteer_matching_training.csv");
        if (!csvFile.exists()) {
            System.out.println("volunteer_matching_training.csv not found at: " + csvFile.getAbsolutePath() + ". Skipping import.");
            return;
        }

        System.out.println("Starting import of volunteer_matching_training.csv...");
        try (BufferedReader br = new BufferedReader(new FileReader(csvFile, StandardCharsets.UTF_8))) {
            String line;
            boolean isHeader = true;
            int importedCount = 0;

            while ((line = br.readLine()) != null) {
                if (isHeader) {
                    isHeader = false;
                    continue;
                }

                if (line.trim().isEmpty()) {
                    continue;
                }

                // Simple CSV splitting
                String[] parts = line.split(",(?=([^\"]*\"[^\"]*\")*[^\"]*$)");
                if (parts.length >= 4) {
                    String category = parts[0].replace("\"", "").trim();
                    String languagesKnown = parts[1].replace("\"", "").trim();
                    String genderRule = parts[2].replace("\"", "").trim();
                    String recommendedAuthority = parts[3].replace("\"", "").trim();

                    // Generate a checksum hash of this row
                    String rawRow = category + "|" + languagesKnown + "|" + genderRule + "|" + recommendedAuthority;
                    String rowHash = calculateHash(rawRow);

                    if (!trainingSampleRepository.existsByRowHash(rowHash)) {
                        VolunteerMatchingTrainingSample sample = new VolunteerMatchingTrainingSample();
                        sample.setProblemId("CSV_SEED_" + rowHash.substring(0, 8));
                        sample.setComplaintText("Sample training complaint for " + category);
                        sample.setLanguageCode(languagesKnown.contains("Tamil") ? "ta" : "en");
                        sample.setCategory(category);
                        sample.setPriority("MEDIUM");
                        sample.setSensitiveFlag(genderRule.equals("FEMALE_PREFERRED"));
                        sample.setRequiredDocuments("ID_Proof,Complaint_Copy");
                        sample.setRecommendedAuthority(recommendedAuthority);
                        
                        sample.setCandidateLanguageMatch(true);
                        sample.setCandidateCategoryMatch(true);
                        sample.setCandidateWorkload(1);
                        sample.setCandidateExperienceYears(5);
                        sample.setCandidateCreditScore(300);
                        sample.setCandidateLevel(3);
                        sample.setCandidateWomenSupportTrained(genderRule.equals("FEMALE_PREFERRED"));
                        sample.setMatchQualityScore(0.95);

                        sample.setSourceFileName("volunteer_matching_training.csv");
                        sample.setRowHash(rowHash);
                        sample.setImportedAt(LocalDateTime.now());

                        trainingSampleRepository.save(sample);
                        importedCount++;
                    }
                }
            }
            System.out.println("Imported " + importedCount + " new volunteer training samples.");
        }
    }

    private String calculateHash(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception ex) {
            return String.valueOf(input.hashCode());
        }
    }
}
