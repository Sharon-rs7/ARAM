package com.aram.legalaid.model;

import com.aram.legalaid.util.EncryptedStringConverter;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "document_verification_results", indexes = {
        @Index(name = "idx_doc_verif_doc", columnList = "documentId"),
        @Index(name = "idx_doc_verif_complaint", columnList = "complaintId")
})
public class DocumentVerificationResult {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long documentId;

    @Column(nullable = false)
    private Long complaintId;

    @Column(columnDefinition = "TEXT")
    @Convert(converter = EncryptedStringConverter.class)
    private String ocrText;

    @Column(columnDefinition = "TEXT")
    private String maskedOcrText;

    private Double ocrConfidence;
    private Double imageQualityScore;

    @Column(length = 100)
    private String documentType;

    private Double documentTypeConfidence;

    @Column(columnDefinition = "TEXT")
    @Convert(converter = EncryptedStringConverter.class)
    private String extractedFieldsJson;

    private Double verificationScore;

    @Column(nullable = false, length = 40)
    private String status;

    @Column(columnDefinition = "TEXT")
    private String reasonsJson;

    @Column(columnDefinition = "TEXT")
    private String errorsJson;

    @Column(length = 50)
    private String engine;

    @Column(length = 50)
    private String modelVersion;

    private Long verifiedByUserId;
    private LocalDateTime verifiedAt;
    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getDocumentId() { return documentId; }
    public void setDocumentId(Long documentId) { this.documentId = documentId; }
    public Long getComplaintId() { return complaintId; }
    public void setComplaintId(Long complaintId) { this.complaintId = complaintId; }
    public String getOcrText() { return ocrText; }
    public void setOcrText(String ocrText) { this.ocrText = ocrText; }
    public String getMaskedOcrText() { return maskedOcrText; }
    public void setMaskedOcrText(String maskedOcrText) { this.maskedOcrText = maskedOcrText; }
    public Double getOcrConfidence() { return ocrConfidence; }
    public void setOcrConfidence(Double ocrConfidence) { this.ocrConfidence = ocrConfidence; }
    public Double getImageQualityScore() { return imageQualityScore; }
    public void setImageQualityScore(Double imageQualityScore) { this.imageQualityScore = imageQualityScore; }
    public String getDocumentType() { return documentType; }
    public void setDocumentType(String documentType) { this.documentType = documentType; }
    public Double getDocumentTypeConfidence() { return documentTypeConfidence; }
    public void setDocumentTypeConfidence(Double documentTypeConfidence) { this.documentTypeConfidence = documentTypeConfidence; }
    public String getExtractedFieldsJson() { return extractedFieldsJson; }
    public void setExtractedFieldsJson(String extractedFieldsJson) { this.extractedFieldsJson = extractedFieldsJson; }
    public Double getVerificationScore() { return verificationScore; }
    public void setVerificationScore(Double verificationScore) { this.verificationScore = verificationScore; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getReasonsJson() { return reasonsJson; }
    public void setReasonsJson(String reasonsJson) { this.reasonsJson = reasonsJson; }
    public String getErrorsJson() { return errorsJson; }
    public void setErrorsJson(String errorsJson) { this.errorsJson = errorsJson; }
    public String getEngine() { return engine; }
    public void setEngine(String engine) { this.engine = engine; }
    public String getModelVersion() { return modelVersion; }
    public void setModelVersion(String modelVersion) { this.modelVersion = modelVersion; }
    public Long getVerifiedByUserId() { return verifiedByUserId; }
    public void setVerifiedByUserId(Long verifiedByUserId) { this.verifiedByUserId = verifiedByUserId; }
    public LocalDateTime getVerifiedAt() { return verifiedAt; }
    public void setVerifiedAt(LocalDateTime verifiedAt) { this.verifiedAt = verifiedAt; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
