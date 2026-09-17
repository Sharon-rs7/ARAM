package com.aram.legalaid.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "jobs", uniqueConstraints = {
    @UniqueConstraint(name = "uq_job_idempotency", columnNames = {"file_reference", "task_type"})
})
public class Job {
    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "complaint_id")
    private Long complaintId;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "task_type", nullable = false, length = 50)
    private String taskType;

    @Column(nullable = false, length = 20)
    private String status = "QUEUED"; // QUEUED, PROCESSING, COMPLETED, FAILED, RETRYING

    @Column(name = "file_reference", length = 512)
    private String fileReference;

    @Column(name = "retry_count")
    private int retryCount = 0;

    @Column(name = "error_reason", length = 1024)
    private String errorReason;

    @Column(name = "result_data", columnDefinition = "TEXT")
    private String resultData;

    @Column(name = "request_metadata", columnDefinition = "TEXT")
    private String requestMetadata;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Job() {}

    public Job(String id, Long complaintId, Long userId, String taskType, String fileReference, String requestMetadata) {
        this.id = id;
        this.complaintId = complaintId;
        this.userId = userId;
        this.taskType = taskType;
        this.fileReference = fileReference;
        this.requestMetadata = requestMetadata;
        this.status = "QUEUED";
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public Long getComplaintId() { return complaintId; }
    public void setComplaintId(Long complaintId) { this.complaintId = complaintId; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getTaskType() { return taskType; }
    public void setTaskType(String taskType) { this.taskType = taskType; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getFileReference() { return fileReference; }
    public void setFileReference(String fileReference) { this.fileReference = fileReference; }

    public int getRetryCount() { return retryCount; }
    public void setRetryCount(int retryCount) { this.retryCount = retryCount; }

    public String getErrorReason() { return errorReason; }
    public void setErrorReason(String errorReason) { this.errorReason = errorReason; }

    public String getResultData() { return resultData; }
    public void setResultData(String resultData) { this.resultData = resultData; }

    public String getRequestMetadata() { return requestMetadata; }
    public void setRequestMetadata(String requestMetadata) { this.requestMetadata = requestMetadata; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
