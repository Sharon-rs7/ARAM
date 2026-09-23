package com.aram.legalaid.security;

import com.aram.legalaid.enums.ComplaintCategory;
import com.aram.legalaid.enums.ComplaintStatus;
import com.aram.legalaid.enums.PriorityLevel;
import com.aram.legalaid.enums.Role;
import com.aram.legalaid.enums.UserStatus;
import com.aram.legalaid.model.Complaint;
import com.aram.legalaid.model.User;
import com.aram.legalaid.repository.ComplaintRepository;
import com.aram.legalaid.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class SecurityAccessControlRegressionTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ComplaintRepository complaintRepository;

    @Test
    public void unauthenticatedChatAskMustBeUnauthorized() throws Exception {
        mockMvc.perform(post("/api/chat/ask")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"message\":\"hello\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    public void unauthenticatedAiAnalyzeComplaintMustBeUnauthorized() throws Exception {
        mockMvc.perform(post("/api/ai/analyze-complaint")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"description\":\"wage issue\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    public void unauthenticatedSpeechTranscribeMustBeUnauthorized() throws Exception {
        mockMvc.perform(post("/api/speech/transcribe")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"audioBase64\":\"\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    public void unauthenticatedH2ConsoleMustBeUnauthorizedOrForbidden() throws Exception {
        mockMvc.perform(get("/h2-console"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    public void jobCallbackWithoutInternalTokenMustBeForbidden() throws Exception {
        mockMvc.perform(post("/api/jobs/callback")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"jobId\":\"test-job-1\",\"status\":\"COMPLETED\"}"))
                .andExpect(status().isForbidden());
    }

    @Test
    public void jobCallbackWithInvalidInternalTokenMustBeForbidden() throws Exception {
        mockMvc.perform(post("/api/jobs/callback")
                .header("X-Internal-Token", "invalid-token-12345")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"jobId\":\"test-job-1\",\"status\":\"COMPLETED\"}"))
                .andExpect(status().isForbidden());
    }

    @Autowired
    private com.aram.legalaid.repository.JobRepository jobRepository;

    @Test
    public void jobCallbackWithValidInternalTokenMustSucceed() throws Exception {
        com.aram.legalaid.model.Job job = new com.aram.legalaid.model.Job();
        job.setId("job-test-cb-1");
        job.setStatus("PROCESSING");
        job.setTaskType("TRIAGE");
        jobRepository.save(job);

        mockMvc.perform(post("/api/jobs/callback")
                .header("X-Internal-Token", "test-internal-token-32-chars-long-secure!")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"jobId\":\"job-test-cb-1\",\"status\":\"COMPLETED\"}"))
                .andExpect(status().isOk());
    }

    @Test
    public void regionalAdminCrossDistrictAccessMustBeForbidden() throws Exception {
        // Create regional admin in Chennai
        User chennaiAdmin = userRepository.findByEmail("admin_chennai@aram.org").orElseGet(() -> {
            User u = new User();
            u.setName("Chennai Admin");
            u.setEmail("admin_chennai@aram.org");
            u.setMobile("9888877771");
            u.setPasswordHash("dummyhash");
            u.setRole(Role.ADMIN);
            u.setStatus(UserStatus.ACTIVE);
            u.setDistrict("Chennai");
            return userRepository.save(u);
        });

        // Create complaint in Coimbatore
        Complaint coimbatoreComplaint = new Complaint();
        coimbatoreComplaint.setTitle("Coimbatore Wage Dispute");
        coimbatoreComplaint.setDescription("Unpaid wages in factory");
        coimbatoreComplaint.setCategory(ComplaintCategory.LABOUR_DISPUTE);
        coimbatoreComplaint.setPriority(PriorityLevel.HIGH);
        coimbatoreComplaint.setStatus(ComplaintStatus.SUBMITTED);
        coimbatoreComplaint.setDistrict("Coimbatore");
        coimbatoreComplaint = complaintRepository.save(coimbatoreComplaint);

        // Chennai Admin attempting to recommend volunteers for Coimbatore complaint -> 403 Forbidden
        mockMvc.perform(get("/api/admin/complaints/" + coimbatoreComplaint.getId() + "/recommend-volunteers")
                .with(user("admin_chennai@aram.org").roles("ADMIN")))
                .andExpect(status().isForbidden());

        // Chennai Admin attempting to assign volunteer to Coimbatore complaint -> 403 Forbidden
        mockMvc.perform(patch("/api/admin/complaints/" + coimbatoreComplaint.getId() + "/assign-volunteer")
                .with(user("admin_chennai@aram.org").roles("ADMIN"))
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"volunteerId\": 1}"))
                .andExpect(status().isForbidden());
    }
}
