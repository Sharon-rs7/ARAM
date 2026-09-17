package com.aram.legalaid.service;

import com.aram.legalaid.model.Job;
import com.aram.legalaid.repository.JobRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class JobService {
    private final JobRepository jobRepository;
    private final RedisQueueService redisQueueService;

    public JobService(JobRepository jobRepository, RedisQueueService redisQueueService) {
        this.jobRepository = jobRepository;
        this.redisQueueService = redisQueueService;
    }

    @Transactional
    public Job createJob(Long complaintId, Long userId, String taskType, String fileReference, String requestMetadata) {
        // Idempotency check before save (Java level check)
        Optional<Job> existingOpt = jobRepository.findByFileReferenceAndTaskType(fileReference, taskType);
        if (existingOpt.isPresent()) {
            System.out.println("[JOB SERVICE] Idempotency match: returning existing job " + existingOpt.get().getId());
            return existingOpt.get();
        }

        String jobId = UUID.randomUUID().toString();
        Job job = new Job(jobId, complaintId, userId, taskType, fileReference, requestMetadata);
        
        try {
            Job saved = jobRepository.saveAndFlush(job);
            
            // Push message to Redis
            redisQueueService.enqueueJob(jobId, complaintId, userId, taskType, fileReference, requestMetadata);
            return saved;
        } catch (DataIntegrityViolationException dive) {
            // DB-level unique constraint violation catch (race conditions)
            System.out.println("[JOB SERVICE] DB Unique constraint violation, fetching existing job...");
            return jobRepository.findByFileReferenceAndTaskType(fileReference, taskType)
                    .orElseThrow(() -> new RuntimeException("DB collision on unique constraint, but existing job not found", dive));
        }
    }

    @Transactional
    public Job updateJobStatus(String jobId, String status, String errorReason, String resultData) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found: " + jobId));
        
        String oldStatus = job.getStatus().toUpperCase();
        String newStatus = status.toUpperCase();

        // Validate state transitions
        boolean valid = false;
        if (oldStatus.equals(newStatus)) {
            valid = true; // allow identity transitions
        } else {
            switch (oldStatus) {
                case "QUEUED":
                    if (newStatus.equals("PROCESSING")) valid = true;
                    break;
                case "PROCESSING":
                    if (newStatus.equals("COMPLETED") || newStatus.equals("RETRYING") || newStatus.equals("FAILED")) valid = true;
                    break;
                case "RETRYING":
                    if (newStatus.equals("PROCESSING") || newStatus.equals("FAILED")) valid = true;
                    break;
                case "COMPLETED":
                case "FAILED":
                default:
                    // Completed or Failed states are terminal, no transitions allowed
                    valid = false;
                    break;
            }
        }

        if (!valid) {
            throw new IllegalStateException("Invalid job state transition from " + oldStatus + " to " + newStatus);
        }

        job.setStatus(newStatus);
        if (errorReason != null) {
            job.setErrorReason(errorReason);
        }
        if (resultData != null) {
            job.setResultData(resultData);
        }
        
        // Handle retry count increments
        if (newStatus.equals("RETRYING")) {
            job.setRetryCount(job.getRetryCount() + 1);
        }

        return jobRepository.save(job);
    }

    @Transactional
    public Job updateJobStatus(String jobId, String status, String errorReason) {
        return updateJobStatus(jobId, status, errorReason, null);
    }

    public Optional<Job> getJob(String jobId) {
        return jobRepository.findById(jobId);
    }

    public List<Job> getAllJobs() {
        return jobRepository.findAll();
    }
}
