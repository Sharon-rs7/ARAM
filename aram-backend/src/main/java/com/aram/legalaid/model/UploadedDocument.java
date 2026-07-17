package com.aram.legalaid.model;

import com.aram.legalaid.enums.VerificationStatus;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "documents", indexes = {
        @Index(name = "idx_documents_complaint", columnList = "complaint_id")
})
public class UploadedDocument {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "complaint_id", nullable = false)
    private Complaint complaint;

    @Column(nullable = false, length = 180)
    private String fileName;

    @Column(nullable = false, length = 80)
    private String fileType;

    @Column(nullable = false, length = 500)
    private String filePath;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private VerificationStatus verificationStatus = VerificationStatus.PENDING;

    @Column(length = 100)
    private String predictedDocumentType;

    private Double verificationScore;

    private LocalDateTime uploadedAt;

    @PrePersist
    void onCreate() { uploadedAt = LocalDateTime.now(); }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Complaint getComplaint() { return complaint; }
    public void setComplaint(Complaint complaint) { this.complaint = complaint; }
    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }
    public String getFileType() { return fileType; }
    public void setFileType(String fileType) { this.fileType = fileType; }
    public String getFilePath() { return filePath; }
    public void setFilePath(String filePath) { this.filePath = filePath; }
    public VerificationStatus getVerificationStatus() { return verificationStatus; }
    public void setVerificationStatus(VerificationStatus verificationStatus) { this.verificationStatus = verificationStatus; }
    public String getPredictedDocumentType() { return predictedDocumentType; }
    public void setPredictedDocumentType(String predictedDocumentType) { this.predictedDocumentType = predictedDocumentType; }
    public Double getVerificationScore() { return verificationScore; }
    public void setVerificationScore(Double verificationScore) { this.verificationScore = verificationScore; }
    public LocalDateTime getUploadedAt() { return uploadedAt; }
    public void setUploadedAt(LocalDateTime uploadedAt) { this.uploadedAt = uploadedAt; }
}
