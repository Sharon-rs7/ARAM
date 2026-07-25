package com.aram.legalaid.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "legal_guide_case_notes", indexes = {
        @Index(name = "idx_notes_complaint", columnList = "complaint_id")
})
public class LegalGuideCaseNote {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "complaint_id", nullable = false)
    private Long complaintId;

    @Column(name = "legal_guide_id", nullable = false)
    private Long legalGuideId;

    @Column(name = "note_text", nullable = false, columnDefinition = "TEXT")
    @Convert(converter = com.aram.legalaid.util.EncryptedStringConverter.class)
    private String noteText;

    @Column(nullable = false, length = 20)
    private String visibility = "PRIVATE"; // PRIVATE, ADMIN_VISIBLE, USER_VISIBLE

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getComplaintId() { return complaintId; }
    public void setComplaintId(Long complaintId) { this.complaintId = complaintId; }

    public Long getLegalGuideId() { return legalGuideId; }
    public void setLegalGuideId(Long legalGuideId) { this.legalGuideId = legalGuideId; }

    public String getNoteText() { return noteText; }
    public void setNoteText(String noteText) { this.noteText = noteText; }

    public String getVisibility() { return visibility; }
    public void setVisibility(String visibility) { this.visibility = visibility; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
