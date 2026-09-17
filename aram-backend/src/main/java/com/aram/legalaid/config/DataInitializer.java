package com.aram.legalaid.config;

import com.aram.legalaid.enums.ComplaintCategory;
import com.aram.legalaid.enums.Role;
import com.aram.legalaid.enums.UserStatus;
import com.aram.legalaid.model.Authority;
import com.aram.legalaid.model.User;
import com.aram.legalaid.model.LegalCategory;
import com.aram.legalaid.model.LegalProblemTemplate;
import com.aram.legalaid.model.Complaint;
import com.aram.legalaid.enums.ComplaintStatus;
import com.aram.legalaid.enums.PriorityLevel;
import com.aram.legalaid.repository.ComplaintRepository;
import com.aram.legalaid.repository.AuthorityRepository;
import com.aram.legalaid.repository.UserRepository;
import com.aram.legalaid.repository.LegalCategoryRepository;
import com.aram.legalaid.repository.LegalProblemTemplateRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.io.InputStream;
import java.util.List;
import java.util.Map;

import com.aram.legalaid.repository.RegionRepository;
import com.aram.legalaid.model.Region;

@Configuration
public class DataInitializer {
    @org.springframework.beans.factory.annotation.Value("${app.jwt.secret}")
    private String jwtSecret;

    @org.springframework.beans.factory.annotation.Value("${spring.profiles.active:}")
    private String activeProfile;

    @Bean
    CommandLineRunner seed(
            UserRepository userRepository, 
            AuthorityRepository authorityRepository, 
            LegalCategoryRepository legalCategoryRepository,
            LegalProblemTemplateRepository legalProblemTemplateRepository,
            ComplaintRepository complaintRepository,
            com.aram.legalaid.repository.VolunteerActivityRepository volunteerActivityRepository,
            PasswordEncoder passwordEncoder,
            com.aram.legalaid.service.BlockchainService blockchainService,
            com.aram.legalaid.repository.AuthorityOfficeRepository authorityOfficeRepository,
            com.aram.legalaid.repository.CostEstimateRuleRepository costEstimateRuleRepository,
            RegionRepository regionRepository,
            com.aram.legalaid.repository.LegalGuideProfileRepository guideProfileRepository,
            com.aram.legalaid.repository.LegalGuidePerformanceProfileRepository performanceProfileRepository,
            com.aram.legalaid.service.LegalGuideLevelService levelService,
            org.springframework.jdbc.core.JdbcTemplate jdbcTemplate) {
        return args -> {
            // Enforce configuration safety and fail-fast check in non-development profiles
            boolean isJUnitTest = java.util.Arrays.stream(Thread.currentThread().getStackTrace())
                    .anyMatch(element -> element.getClassName().startsWith("org.junit.") || element.getClassName().startsWith("org.springframework.test."));

            if (!isJUnitTest && ("mysql".equalsIgnoreCase(activeProfile) || "prod".equalsIgnoreCase(activeProfile))) {
                if ("ARAMLegalAidJwtSecretKeyForDevelopmentOnly2026".equals(jwtSecret)) {
                    System.err.println("WARNING: Running with default development JWT secret in MySQL mode.");
                }
            }

            try {
                jdbcTemplate.execute("ALTER SEQUENCE complaint_seq RESTART WITH 15");
            } catch (Exception e) {
                System.out.println("Could not alter sequence: " + e.getMessage());
            }

            // Seed Admin User
            if (!userRepository.existsByEmail("admin@gmail.com")) {
                User admin = new User();
                admin.setName("ARAM Admin");
                admin.setEmail("admin@gmail.com");
                admin.setMobile("9876543210");
                admin.setPasswordHash(passwordEncoder.encode("Admin@123"));
                admin.setRole(Role.ADMIN);
                admin.setStatus(UserStatus.ACTIVE);
                saveUserSafely(userRepository, admin);
            }
            
            // Seed Authority mappings
            if (authorityRepository.count() == 0) {
                addAuthority(authorityRepository, "Labour Office", ComplaintCategory.LABOUR_DISPUTE, "Handles salary, wages, employment termination and workplace disputes.");
                addAuthority(authorityRepository, "Consumer Disputes Redressal Commission", ComplaintCategory.CONSUMER_COMPLAINT, "Handles product, refund, warranty and service deficiency complaints.");
                addAuthority(authorityRepository, "Cyber Crime Cell", ComplaintCategory.CYBER_CRIME, "Handles online fraud, UPI fraud, hacked account and cyber complaints.");
                addAuthority(authorityRepository, "Civil Court / Revenue Office", ComplaintCategory.PROPERTY_CIVIL_DISPUTE, "Handles land, property boundary and ownership disputes.");
                addAuthority(authorityRepository, "Police Station / Women Help Cell", ComplaintCategory.WOMEN_SAFETY_DOMESTIC_VIOLENCE, "Handles safety, domestic violence, harassment and threat complaints.");
                addAuthority(authorityRepository, "Police Station", ComplaintCategory.CRIMINAL_COMPLAINT, "Handles theft, assault, threat and criminal incidents.");
                addAuthority(authorityRepository, "District Legal Services Authority", ComplaintCategory.GENERAL_LEGAL_AID, "Provides general legal aid and guidance support.");
            }

            // Seed AuthorityOffice list if table is empty
            if (authorityOfficeRepository.count() == 0) {
                authorityOfficeRepository.save(new com.aram.legalaid.model.AuthorityOffice(
                        "Coimbatore Labour Department Office", "Labour Department", "LABOUR_DISPUTE", "Coimbatore", "Coimbatore Town",
                        "Labour Commissioner Office, Chinthamani, Coimbatore - 641045", "0422-2245678", "labour.cbe@tn.gov.in", "https://labour.tn.gov.in",
                        "10:00 AM - 05:45 PM", 11.0168, 76.9558, "https://www.google.com/maps/search/?api=1&query=Labour+Department+Office+Coimbatore",
                        "https://labour.tn.gov.in/online-portal"
                ));

                authorityOfficeRepository.save(new com.aram.legalaid.model.AuthorityOffice(
                        "Chennai Cyber Crime Cell Headquarters", "Cyber Crime Cell", "CYBER_CRIME", "Chennai", "Egmore",
                        "Commissionerate of Police, Vepery High Road, Egmore, Chennai - 600008", "044-25615086", "cybercell.chn@tn.gov.in", "https://eservices.tnpolice.gov.in",
                        "24 Hours Open", 13.0837, 80.2593, "https://www.google.com/maps/search/?api=1&query=Cyber+Crime+Cell+Headquarters+Chennai",
                        "https://cybercrime.gov.in"
                ));

                authorityOfficeRepository.save(new com.aram.legalaid.model.AuthorityOffice(
                        "District Consumer Disputes Redressal Commission Chennai", "Consumer Forum", "CONSUMER_COMPLAINT", "Chennai", "Broadway",
                        "High Court Buildings Compound, Broadway, George Town, Chennai - 600104", "044-25341258", "cdrcchennai@tn.gov.in", "https://scdrc.tn.gov.in",
                        "10:30 AM - 05:00 PM", 13.0898, 80.2871, "https://www.google.com/maps/search/?api=1&query=Consumer+Disputes+Redressal+Commission+Chennai",
                        "https://ncdrc.nic.in"
                ));

                authorityOfficeRepository.save(new com.aram.legalaid.model.AuthorityOffice(
                        "Coimbatore Revenue Divisional Office", "Revenue Department", "PROPERTY_CIVIL_DISPUTE", "Coimbatore", "District Collectorate",
                        "RDO Office Compound, Collectorate, Coimbatore - 641018", "0422-2300124", "rdo.cbe@tn.gov.in", "https://coimbatore.nic.in",
                        "10:00 AM - 05:45 PM", 10.9968, 76.9602, "https://www.google.com/maps/search/?api=1&query=Collectorate+Office+Coimbatore",
                        "https://patta.chitta.tn.gov.in"
                ));

                authorityOfficeRepository.save(new com.aram.legalaid.model.AuthorityOffice(
                        "Chennai Women Helpline Centre (One Stop Centre)", "Women Helpline", "WOMEN_SAFETY_DOMESTIC_VIOLENCE", "Chennai", "Royapettah",
                        "Government Kasturba Gandhi Hospital for Women and Children, Triplicane, Chennai - 600005", "181", "osc.chennai@tn.gov.in", "https://socialwelfare.tn.gov.in",
                        "24 Hours Open", 13.0617, 80.2741, "https://www.google.com/maps/search/?api=1&query=Kasturba+Gandhi+Hospital+Chennai",
                        "https://socialwelfare.tn.gov.in/one-stop-centre"
                ));

                authorityOfficeRepository.save(new com.aram.legalaid.model.AuthorityOffice(
                        "Chennai Central Police Station (B1)", "Police Station", "CRIMINAL_COMPLAINT", "Chennai", "Triplicane",
                        "Wallajah Road, Triplicane, Chennai - 600002", "044-28530366", "b1station.chn@tnpolice.gov.in", "https://eservices.tnpolice.gov.in",
                        "24 Hours Open", 13.0645, 80.2718, "https://www.google.com/maps/search/?api=1&query=B1+Police+Station+Wallajah+Road+Chennai",
                        null
                ));

                authorityOfficeRepository.save(new com.aram.legalaid.model.AuthorityOffice(
                        "District Legal Services Authority (DLSA) Coimbatore", "District Legal Services Authority", "GENERAL_LEGAL_AID", "Coimbatore", "Combined Court Compound",
                        "District Court Buildings Compound, Arts College Road, Coimbatore - 641018", "0422-2244432", "dlsa.cbe@gmail.com", "http://coimbatore.dcourts.gov.in/dlsa",
                        "10:00 AM - 05:45 PM", 10.9996, 76.9712, "https://www.google.com/maps/search/?api=1&query=Combined+Court+Complex+Coimbatore",
                        "https://nalsa.gov.in"
                ));

                authorityOfficeRepository.save(new com.aram.legalaid.model.AuthorityOffice(
                        "District Legal Services Authority (DLSA) Chennai", "District Legal Services Authority", "GENERAL_LEGAL_AID", "Chennai", "High Court Compound",
                        "City Civil Court Compound, High Court Buildings, Chennai - 600104", "044-25342442", "dlsachennai@gmail.com", "http://chennai.dcourts.gov.in/dlsa",
                        "10:00 AM - 05:45 PM", 13.0898, 80.2871, "https://www.google.com/maps/search/?api=1&query=High+Court+Buildings+Chennai",
                        "https://nalsa.gov.in"
                ));
                System.out.println("Seeded database with regional authority offices.");
            }

            if (costEstimateRuleRepository.count() == 0) {
                costEstimateRuleRepository.save(new com.aram.legalaid.model.CostEstimateRule(
                        "LABOUR_DISPUTE", "Labour Office", 0, 300, "INR", true,
                        "Print/photocopy/travel estimate", "Professional legal fees",
                        "Demo estimates. Replace with verified official fee data before production."
                ));
                costEstimateRuleRepository.save(new com.aram.legalaid.model.CostEstimateRule(
                        "CONSUMER_COMPLAINT", "Consumer Forum", 0, 500, "INR", true,
                        "Court fee/Filing fee/Photocopies", "Private lawyer fees",
                        "Demo estimates. Replace with verified official fee data before production."
                ));
                costEstimateRuleRepository.save(new com.aram.legalaid.model.CostEstimateRule(
                        "CYBER_CRIME", "Cyber Crime Portal", 0, 500, "INR", true,
                        "Filing proof/travel", "Professional service charges",
                        "Demo estimates. Replace with verified official fee data before production."
                ));
                costEstimateRuleRepository.save(new com.aram.legalaid.model.CostEstimateRule(
                        "PROPERTY_CIVIL_DISPUTE", "Police Station", 50, 2000, "INR", false,
                        "Stamp duty/Certified deed copy", "Lawyer court fees",
                        "Demo estimates. Replace with verified official fee data before production."
                ));
                costEstimateRuleRepository.save(new com.aram.legalaid.model.CostEstimateRule(
                        "WOMEN_SAFETY_DOMESTIC_VIOLENCE", "Women Helpline", 0, 200, "INR", true,
                        "Incident document printing", "Legal fees",
                        "Demo estimates. Replace with verified official fee data before production."
                ));
                costEstimateRuleRepository.save(new com.aram.legalaid.model.CostEstimateRule(
                        "CRIMINAL_COMPLAINT", "Police Station", 0, 200, "INR", true,
                        "FIR copy print/travel", "Bail/Private lawyer charges",
                        "Demo estimates. Replace with verified official fee data before production."
                ));
                costEstimateRuleRepository.save(new com.aram.legalaid.model.CostEstimateRule(
                        "GENERAL_LEGAL_AID", "District Legal Services Authority", 0, 100, "INR", true,
                        "Application printing/travel", "Advocate counseling fees",
                        "Demo estimates. Replace with verified official fee data before production."
                ));
                System.out.println("Seeded database with master cost estimate rules.");
            }

            // Seed LegalCategory & LegalProblemTemplates from packaged JSON
            if (legalProblemTemplateRepository.count() == 0) {
                try {
                    ObjectMapper mapper = new ObjectMapper();
                    InputStream inputStream = getClass().getResourceAsStream("/legal_problem_templates.json");
                    if (inputStream != null) {
                        List<Map<String, Object>> templatesList = mapper.readValue(inputStream, new TypeReference<List<Map<String, Object>>>() {});
                        for (Map<String, Object> t : templatesList) {
                            String catCode = (String) t.get("category");
                            String catName = catCode.replace("_", " ");
                            
                            if (!legalCategoryRepository.existsByCode(catCode)) {
                                LegalCategory cat = new LegalCategory();
                                cat.setCode(catCode);
                                cat.setName(catName);
                                cat.setDescription("AI triage category for " + catName);
                                legalCategoryRepository.save(cat);
                            }
                            
                            LegalProblemTemplate temp = new LegalProblemTemplate();
                            temp.setProblemId((String) t.get("problemId"));
                            temp.setCategory(catCode);
                            temp.setSubcategory((String) t.get("subcategory"));
                            temp.setPriorityCode((String) t.get("priorityCode"));
                            temp.setPriorityName((String) t.get("priorityName"));
                            
                            List<String> docsList = (List<String>) t.get("requiredDocuments");
                            temp.setRequiredDocuments(String.join(",", docsList));
                            
                            temp.setRecommendedAuthority((String) t.get("recommendedAuthority"));
                            
                            List<String> stepsList = (List<String>) t.get("nextSteps");
                            temp.setNextSteps(String.join(";", stepsList));
                            
                            temp.setWomenSensitive((boolean) t.get("womenSensitive"));
                            temp.setPreferredVolunteerGenderRule((String) t.get("preferredVolunteerGenderRule"));
                            temp.setDisclaimer((String) t.get("disclaimer"));
                            
                            legalProblemTemplateRepository.save(temp);
                        }
                        System.out.println("Seeded database with " + legalProblemTemplateRepository.count() + " legal problem templates from JSON.");
                    } else {
                        System.err.println("Classpath resource legal_problem_templates.json not found!");
                    }
                } catch (Exception e) {
                    System.err.println("Error seeding legal templates: " + e.getMessage());
                    e.printStackTrace();
                }
            }

            // Seed Advocate and Authority accounts
            if (!userRepository.existsByEmail("advocate@gmail.com")) {
                User advocate = new User();
                advocate.setName("ARAM Advocate");
                advocate.setEmail("advocate@gmail.com");
                advocate.setMobile("9876543211");
                advocate.setPasswordHash(passwordEncoder.encode("Advocate@123"));
                advocate.setRole(Role.ADVOCATE);
                advocate.setStatus(UserStatus.ACTIVE);
                saveUserSafely(userRepository, advocate);
            }
            if (!userRepository.existsByEmail("officer@gmail.com")) {
                User officer = new User();
                officer.setName("ARAM Authority Officer");
                officer.setEmail("officer@gmail.com");
                officer.setMobile("9876543212");
                officer.setPasswordHash(passwordEncoder.encode("Officer@123"));
                officer.setRole(Role.AUTHORITY);
                officer.setStatus(UserStatus.ACTIVE);
                
                Authority labourOffice = authorityRepository.findAll().stream()
                        .filter(a -> a.getName().equals("Labour Office"))
                        .findFirst()
                        .orElse(null);
                officer.setAssociatedAuthority(labourOffice);
                saveUserSafely(userRepository, officer);
            }

            // Seed Citizen User
            User citizen = userRepository.findByEmail("citizen@gmail.com").orElse(null);
            if (citizen == null) {
                citizen = new User();
                citizen.setName("ARAM Citizen");
                citizen.setEmail("citizen@gmail.com");
                citizen.setMobile("9876543213");
                citizen.setPasswordHash(passwordEncoder.encode("Citizen@123"));
                citizen.setRole(Role.CITIZEN);
                citizen.setStatus(UserStatus.ACTIVE);
                citizen.setProfileCompleted(true);
                citizen = saveUserSafely(userRepository, citizen);
            } else {
                citizen.setProfileCompleted(true);
                citizen = saveUserSafely(userRepository, citizen);
            }

            // Seed Volunteer User
            User volunteer = userRepository.findByEmail("volunteer@gmail.com").orElse(null);
            if (volunteer == null) {
                volunteer = new User();
                volunteer.setName("Sharon Mary");
                volunteer.setEmail("volunteer@gmail.com");
                volunteer.setMobile("9876543214");
                volunteer.setPasswordHash(passwordEncoder.encode("Helper@123"));
                volunteer.setRole(Role.HELPER);
                volunteer.setStatus(UserStatus.ACTIVE);
                volunteer.setGender("FEMALE");
                volunteer.setWomenSupportTrained(true);
                volunteer.setCanHandleSensitiveCases(true);
                volunteer.setSpecialization("Labour Rights,Consumer Protection,Women Safety");
                volunteer.setLanguagesKnown("English,Tamil");
                volunteer.setDistrict("Chennai");
                volunteer.setMaxActiveCases(8);
                volunteer.setProfileCompleted(true);
                volunteer = saveUserSafely(userRepository, volunteer);
            } else {
                volunteer.setName("Sharon Mary");
                volunteer.setSpecialization("Labour Rights,Consumer Protection,Women Safety");
                volunteer.setLanguagesKnown("English,Tamil");
                volunteer.setCanHandleSensitiveCases(true);
                volunteer.setWomenSupportTrained(true);
                volunteer.setProfileCompleted(true);
                volunteer = saveUserSafely(userRepository, volunteer);
            }

            // Seed complaints for Sharon Mary
            if (complaintRepository.count() == 0 || complaintRepository.findByAssignedHelperOrderByCreatedAtDesc(volunteer).isEmpty()) {
                // Complaint 1 (Under Review, Labour)
                Complaint c1 = new Complaint();
                c1.setUser(citizen);
                c1.setComplaintCustomId("ARAM-26-TN-CHE-000001");
                c1.setTitle("Unpaid wages from textile supervisor");
                c1.setDescription("I worked at the textile mill for 3 months but the supervisor has refused to pay my monthly wages of 15,000 INR.");
                c1.setLanguage("Tamil");
                c1.setDistrict("Chennai");
                c1.setCategory(ComplaintCategory.LABOUR_DISPUTE);
                c1.setPriority(PriorityLevel.HIGH);
                c1.setPriorityScore(75);
                c1.setStatus(ComplaintStatus.HELPER_ASSIGNED);
                c1.setAssignedHelper(volunteer);
                c1.setSensitive(false);
                c1.setWomenSensitive(false);
                complaintRepository.save(c1);
                blockchainService.mineBlock(c1);

                // Complaint 2 (In Progress, Women Safety - sensitive)
                Complaint c2 = new Complaint();
                c2.setUser(citizen);
                c2.setComplaintCustomId("ARAM-26-TN-CHE-000002");
                c2.setTitle("Domestic violence harassment threat");
                c2.setDescription("Harassment and physical abuse from family members at home. Seeking legal mediation.");
                c2.setLanguage("English");
                c2.setDistrict("Chennai");
                c2.setCategory(ComplaintCategory.WOMEN_SAFETY_DOMESTIC_VIOLENCE);
                c2.setPriority(PriorityLevel.CRITICAL);
                c2.setPriorityScore(95);
                c2.setStatus(ComplaintStatus.IN_PROGRESS);
                c2.setAssignedHelper(volunteer);
                c2.setSensitive(true);
                c2.setWomenSensitive(true);
                c2.setIdentityVisibility(com.aram.legalaid.enums.IdentityVisibility.HIDDEN);
                complaintRepository.save(c2);
                blockchainService.mineBlock(c2);

                // Complaint 3 (Resolved, Consumer)
                Complaint c3 = new Complaint();
                c3.setUser(citizen);
                c3.setComplaintCustomId("ARAM-26-TN-CBE-000003");
                c3.setTitle("Faulty electronic product refund");
                c3.setDescription("Bought a washing machine that was defective on arrival. Retailer refused refund.");
                c3.setLanguage("English");
                c3.setDistrict("Coimbatore");
                c3.setCategory(ComplaintCategory.CONSUMER_COMPLAINT);
                c3.setPriority(PriorityLevel.LOW);
                c3.setPriorityScore(35);
                c3.setStatus(ComplaintStatus.RESOLVED);
                c3.setAssignedHelper(volunteer);
                c3.setLegalOpinion("Mediation complete. Retailer agreed to replace the product.");
                c3.setSensitive(false);
                c3.setWomenSensitive(false);
                complaintRepository.save(c3);
                blockchainService.mineBlock(c3);

                // Complaint 4 (In Progress, Cyber Crime)
                Complaint c4 = new Complaint();
                c4.setUser(citizen);
                c4.setComplaintCustomId("ARAM-26-TN-MDU-000004");
                c4.setTitle("UPI online transaction fraud");
                c4.setDescription("Received a phishing link and lost 5,000 INR from bank account via UPI.");
                c4.setLanguage("Tamil");
                c4.setDistrict("Madurai");
                c4.setCategory(ComplaintCategory.CYBER_CRIME);
                c4.setPriority(PriorityLevel.MEDIUM);
                c4.setPriorityScore(55);
                c4.setStatus(ComplaintStatus.IN_PROGRESS);
                c4.setAssignedHelper(volunteer);
                c4.setSensitive(false);
                c4.setWomenSensitive(false);
                complaintRepository.save(c4);
                blockchainService.mineBlock(c4);

                // Complaint 5 (Under Review, Property)
                Complaint c5 = new Complaint();
                c5.setUser(citizen);
                c5.setComplaintCustomId("ARAM-26-TN-CHE-000005");
                c5.setTitle("Arbitrary rent increase without notice");
                c5.setDescription("Landlord demanded a 40% rent increase within 3 months of contract start.");
                c5.setLanguage("English");
                c5.setDistrict("Chennai");
                c5.setCategory(ComplaintCategory.PROPERTY_CIVIL_DISPUTE);
                c5.setPriority(PriorityLevel.LOW);
                c5.setPriorityScore(25);
                c5.setStatus(ComplaintStatus.HELPER_ASSIGNED);
                c5.setAssignedHelper(volunteer);
                c5.setSensitive(false);
                c5.setWomenSensitive(false);
                complaintRepository.save(c5);
                blockchainService.mineBlock(c5);

                // Complaint 6 (In Progress, Women Safety - sensitive)
                Complaint c6 = new Complaint();
                c6.setUser(citizen);
                c6.setComplaintCustomId("ARAM-26-TN-TRZ-000006");
                c6.setTitle("Workplace sexual harassment case");
                c6.setDescription("Facing safety concerns and sexual harassment from senior colleagues in office.");
                c6.setLanguage("Tamil");
                c6.setDistrict("Trichy");
                c6.setCategory(ComplaintCategory.WOMEN_SAFETY_DOMESTIC_VIOLENCE);
                c6.setPriority(PriorityLevel.HIGH);
                c6.setPriorityScore(85);
                c6.setStatus(ComplaintStatus.IN_PROGRESS);
                c6.setAssignedHelper(volunteer);
                c6.setSensitive(true);
                c6.setWomenSensitive(true);
                c6.setIdentityVisibility(com.aram.legalaid.enums.IdentityVisibility.PARTIAL);
                complaintRepository.save(c6);
                blockchainService.mineBlock(c6);

                // Complaint 7 (Resolved, Consumer)
                Complaint c7 = new Complaint();
                c7.setUser(citizen);
                c7.setComplaintCustomId("ARAM-26-TN-CHE-000007");
                c7.setTitle("Defective refrigerator replacement delay");
                c7.setDescription("Delivered defective double door refrigerator. Service center delaying resolution.");
                c7.setLanguage("Hindi");
                c7.setDistrict("Chennai");
                c7.setCategory(ComplaintCategory.CONSUMER_COMPLAINT);
                c7.setPriority(PriorityLevel.LOW);
                c7.setPriorityScore(30);
                c7.setStatus(ComplaintStatus.RESOLVED);
                c7.setAssignedHelper(volunteer);
                c7.setLegalOpinion("Mediation succeeded. Replacement scheduled.");
                c7.setSensitive(false);
                c7.setWomenSensitive(false);
                complaintRepository.save(c7);
                blockchainService.mineBlock(c7);

                // Complaint 8 (Resolved, Labour)
                Complaint c8 = new Complaint();
                c8.setUser(citizen);
                c8.setComplaintCustomId("ARAM-26-TN-SLM-000008");
                c8.setTitle("Illegal termination from logistics company");
                c8.setDescription("Terminated without prior notice or compensation package after 2 years of service.");
                c8.setLanguage("English");
                c8.setDistrict("Salem");
                c8.setCategory(ComplaintCategory.LABOUR_DISPUTE);
                c8.setPriority(PriorityLevel.HIGH);
                c8.setPriorityScore(80);
                c8.setStatus(ComplaintStatus.RESOLVED);
                c8.setAssignedHelper(volunteer);
                c8.setLegalOpinion("Provided legal advisory options for termination dispute resolution.");
                c8.setSensitive(false);
                c8.setWomenSensitive(false);
                complaintRepository.save(c8);
                blockchainService.mineBlock(c8);
            }

            // Seed activity logs for the past 30 days
            if (volunteerActivityRepository.findByVolunteerIdOrderByCreatedAtDesc(volunteer.getId()).isEmpty()) {
                java.util.Random rand = new java.util.Random();
                String[] actions = {"PAGE_VIEW", "NOTE_ADDED", "STATUS_UPDATED", "HEARTBEAT"};
                String[] labels = {"Viewed Dashboard", "Added Case Recommendation", "Updated Complaint Status", "Session Heartbeat"};
                for (int i = 0; i < 30; i++) {
                    int numActions = rand.nextInt(3) + 1;
                    for (int j = 0; j < numActions; j++) {
                        com.aram.legalaid.model.VolunteerActivityLog log = new com.aram.legalaid.model.VolunteerActivityLog();
                        log.setVolunteerId(volunteer.getId());
                        int actionIdx = rand.nextInt(actions.length);
                        log.setActionType(actions[actionIdx]);
                        log.setActionLabel(labels[actionIdx]);
                        log.setCreatedAt(java.time.LocalDateTime.now().minusDays(i).minusHours(rand.nextInt(12)));
                        volunteerActivityRepository.save(log);
                    }
                }
            }

            // Seed the 10 target regions in regions table and create regional admin users
            String[] seededDistricts = {"Chennai", "Coimbatore", "Madurai", "Trichy", "Salem", "Tirunelveli", "Erode", "Vellore", "Kanyakumari", "Thanjavur"};
            for (String dist : seededDistricts) {
                String regId = dist.toLowerCase();
                String adminEmail = regId + ".admin@gmail.com";
                if (!regionRepository.existsByRegionId(regId)) {
                    Region region = new Region(regId, dist, adminEmail);
                    regionRepository.save(region);
                }
                if (!userRepository.existsByEmail(adminEmail)) {
                    User regAdmin = new User();
                    regAdmin.setName(dist + " Admin");
                    regAdmin.setEmail(adminEmail);
                    regAdmin.setMobile("9876543" + String.format("%03d", Math.abs(adminEmail.hashCode()) % 1000));
                    regAdmin.setPasswordHash(passwordEncoder.encode("Admin@123"));
                    regAdmin.setRole(Role.ADMIN);
                    regAdmin.setStatus(UserStatus.ACTIVE);
                    regAdmin.setDistrict(dist);
                    saveUserSafely(userRepository, regAdmin);
                }
            }

            // Seed Super Admin User
            if (!userRepository.existsByEmail("superadmin@gmail.com")) {
                User sa = new User();
                sa.setName("Super Admin");
                sa.setEmail("superadmin@gmail.com");
                sa.setMobile("9999999998");
                sa.setPasswordHash(passwordEncoder.encode("Admin@supersecure"));
                sa.setRole(Role.SUPER_ADMIN);
                sa.setStatus(UserStatus.ACTIVE);
                sa.setDistrict("GLOBAL");
                sa.setProfileCompleted(true);
                saveUserSafely(userRepository, sa);
            }

            // Seed Common Admin User
            if (!userRepository.existsByEmail("superion@gmail.com")) {
                User ca = new User();
                ca.setName("Superion Admin");
                ca.setEmail("superion@gmail.com");
                ca.setMobile("9999999900");
                ca.setPasswordHash(passwordEncoder.encode("Admin@123"));
                ca.setRole(Role.ADMIN);
                ca.setStatus(UserStatus.ACTIVE);
                ca.setDistrict("GLOBAL");
                ca.setProfileCompleted(true);
                saveUserSafely(userRepository, ca);
            }

            // Seed exactly 3 verified operational Guides per region (total 30)
            for (int rIdx = 0; rIdx < seededDistricts.length; rIdx++) {
                String dist = seededDistricts[rIdx];
                for (int gIdx = 1; gIdx <= 3; gIdx++) {
                    String guideEmail = dist.toLowerCase() + ".guide" + gIdx + "@gmail.com";
                    if (!userRepository.existsByEmail(guideEmail)) {
                        User guide = new User();
                        guide.setName(dist + " Seeded Guide " + gIdx);
                        guide.setEmail(guideEmail);
                        guide.setMobile(String.format("9%02d%02d%05d", rIdx, gIdx, rIdx * 10 + gIdx));
                        guide.setPasswordHash(passwordEncoder.encode("Helper@123"));
                        guide.setRole(Role.HELPER);
                        guide.setStatus(UserStatus.ACTIVE);
                        guide.setProfileCompleted(true);
                        guide.setHelperVerified(true);
                        
                        // Alternate genders, specializations, and languages to cover all bases
                        if (gIdx == 1) {
                            guide.setGender("MALE");
                            guide.setLanguagesKnown("Tamil,English");
                            guide.setSpecializationCategories("LABOUR_DISPUTE,CONSUMER_COMPLAINT,GENERAL_LEGAL_AID");
                            guide.setWomenSupportTrained(false);
                            guide.setCanHandleSensitiveCases(false);
                        } else if (gIdx == 2) {
                            guide.setGender("FEMALE");
                            guide.setLanguagesKnown("Tamil,English,Hindi");
                            guide.setSpecializationCategories("WOMEN_SAFETY_DOMESTIC_VIOLENCE,CRIMINAL_COMPLAINT");
                            guide.setWomenSupportTrained(true);
                            guide.setCanHandleSensitiveCases(true);
                        } else {
                            guide.setGender("MALE");
                            guide.setLanguagesKnown("Tamil");
                            guide.setSpecializationCategories("PROPERTY_CIVIL_DISPUTE,CYBER_CRIME");
                            guide.setWomenSupportTrained(false);
                            guide.setCanHandleSensitiveCases(true);
                        }
                        guide.setDistrict(dist);
                        guide.setMaxActiveCases(5);
                        guide.setAvailabilityStatus("AVAILABLE");
                        guide.setCurrentActiveCases(0);
                        User saved = saveUserSafely(userRepository, guide);

                        // Corresponding LegalGuideProfile
                        com.aram.legalaid.model.LegalGuideProfile gp = new com.aram.legalaid.model.LegalGuideProfile();
                        gp.setUserId(saved.getId());
                        gp.setFullName(saved.getName());
                        gp.setEmail(saved.getEmail());
                        gp.setPhone(saved.getMobile());
                        gp.setGender(saved.getGender());
                        gp.setDistrict(saved.getDistrict());
                        gp.setLanguagesKnown(saved.getLanguagesKnown());
                        gp.setExpertiseCategories(saved.getSpecializationCategories());
                        gp.setAvailable(true);
                        gp.setExperienceYears(3 + gIdx);
                        gp.setMaxCaseCapacity(5);
                        gp.setCurrentWorkload(0);
                        gp.setWomenSupportTrained(saved.isWomenSupportTrained());
                        gp.setVerificationStatus("VERIFIED");
                        guideProfileRepository.save(gp);

                        // Corresponding LegalGuidePerformanceProfile
                        com.aram.legalaid.model.LegalGuidePerformanceProfile pp = levelService.getOrCreatePerformanceProfile(saved.getId());
                        pp.setCurrentLevelNumber(2);
                        pp.setCurrentLevelName("Verified Legal Guide");
                        pp.setCreditScore(50);
                        performanceProfileRepository.save(pp);
                    }
                }
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

    private User saveUserSafely(UserRepository userRepository, User user) {
        try {
            return userRepository.save(user);
        } catch (Exception e) {
            System.out.println("[SEED WARNING] Failed to seed user " + user.getEmail() + ": " + e.getMessage());
            return userRepository.findByEmail(user.getEmail()).orElse(user);
        }
    }
}
