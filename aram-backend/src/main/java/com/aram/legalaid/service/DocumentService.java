package com.aram.legalaid.service;

import com.aram.legalaid.dto.DocumentResponse;
import com.aram.legalaid.dto.DocumentVerificationRequest;
import com.aram.legalaid.dto.AiDocumentVerifyResponse;
import com.aram.legalaid.enums.NotificationType;
import com.aram.legalaid.enums.Role;
import com.aram.legalaid.enums.VerificationStatus;
import com.aram.legalaid.exception.BadRequestException;
import com.aram.legalaid.exception.ForbiddenException;
import com.aram.legalaid.exception.ResourceNotFoundException;
import com.aram.legalaid.model.Complaint;
import com.aram.legalaid.model.UploadedDocument;
import com.aram.legalaid.model.DocumentVerificationResult;
import com.aram.legalaid.model.User;
import com.aram.legalaid.repository.UploadedDocumentRepository;
import com.aram.legalaid.repository.DocumentVerificationResultRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import com.aram.legalaid.util.FileUploadValidator;
import com.aram.legalaid.util.UploadCategory;

@Service
public class DocumentService {
    private static final Set<String> ALLOWED_TYPES = Set.of("application/pdf", "image/jpeg", "image/png", "image/jpg");

    private final UploadedDocumentRepository documentRepository;
    private final DocumentVerificationResultRepository documentVerificationResultRepository;
    private final ComplaintService complaintService;
    private final UserService userService;
    private final MapperService mapperService;
    private final NotificationService notificationService;
    private final MongoLogService mongoLogService;
    private final AIClientService aiClientService;
    private final ObjectMapper objectMapper;
    private final FileUploadValidator fileUploadValidator;

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    @Value("${app.upload.max-size-mb:10}")
    private long maxSizeMb;

    private final LegalGuideLevelService levelService;
    private final JobService jobService;

    public DocumentService(
            UploadedDocumentRepository documentRepository,
            DocumentVerificationResultRepository documentVerificationResultRepository,
            ComplaintService complaintService,
            UserService userService,
            MapperService mapperService,
            NotificationService notificationService,
            MongoLogService mongoLogService,
            AIClientService aiClientService,
            LegalGuideLevelService levelService,
            JobService jobService,
            FileUploadValidator fileUploadValidator
    ) {
        this.documentRepository = documentRepository;
        this.documentVerificationResultRepository = documentVerificationResultRepository;
        this.complaintService = complaintService;
        this.userService = userService;
        this.mapperService = mapperService;
        this.notificationService = notificationService;
        this.mongoLogService = mongoLogService;
        this.aiClientService = aiClientService;
        this.levelService = levelService;
        this.jobService = jobService;
        this.fileUploadValidator = fileUploadValidator;
        this.objectMapper = new ObjectMapper();
    }

    @Transactional
    public DocumentResponse upload(Long complaintId, MultipartFile file) {
        String safeName = fileUploadValidator.validateAndGenerateSafeName(file, UploadCategory.DOCUMENT);
        String contentType = file.getContentType();
        Complaint complaint = complaintService.findComplaint(complaintId);
        User user = userService.currentUser();
        if (user.getRole() != Role.ADMIN && !complaint.getUser().getId().equals(user.getId())) {
            throw new ForbiddenException("You cannot upload document for this complaint");
        }

        try {
            Path target = fileUploadValidator.getSafeUploadPath(safeName, null);
            Files.createDirectories(target.getParent());
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

            UploadedDocument document = new UploadedDocument();
            document.setComplaint(complaint);
            document.setFileName(file.getOriginalFilename());
            document.setFileType(contentType);
            document.setFilePath(target.toString());
            document.setVerificationStatus(VerificationStatus.UPLOADED);
            
            UploadedDocument saved = documentRepository.save(document);
            notificationService.create(complaint.getUser(), "Document uploaded for complaint ID " + complaint.getId() + ". Status: UPLOADED.", NotificationType.IN_APP);
            return mapperService.toDocumentResponse(saved);
        } catch (IOException ex) {
            throw new BadRequestException("Unable to store file: " + ex.getMessage());
        }
    }

    @Transactional
    public DocumentResponse ocrVerify(Long documentId) {
        UploadedDocument document = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found"));
        
        document.setVerificationStatus(VerificationStatus.OCR_PROCESSING);
        UploadedDocument savedDoc = documentRepository.save(document);

        String expectedType = determineExpectedType(savedDoc);
        String categoryStr = savedDoc.getComplaint().getCategory() != null ? savedDoc.getComplaint().getCategory().name() : "GENERAL_LEGAL_AID";
        
        User user = userService.currentUser();
        Long userId = user != null ? user.getId() : null;

        // Serialize requestMetadata JSON
        Map<String, Object> metadata = Map.of(
            "documentId", documentId,
            "expectedDocumentType", expectedType,
            "complaintCategory", categoryStr
        );
        String metadataJson = "";
        try {
            metadataJson = objectMapper.writeValueAsString(metadata);
        } catch (Exception ignored) {}

        // Create job asynchronously
        jobService.createJob(savedDoc.getComplaint().getId(), userId, "OCR", savedDoc.getFilePath(), metadataJson);

        notificationService.create(savedDoc.getComplaint().getUser(), "Document OCR verification enqueued.", NotificationType.IN_APP);
        return mapperService.toDocumentResponse(savedDoc);
    }

    @Transactional
    public void completeOcrJob(Long documentId, Map<String, Object> verifyRes) {
        UploadedDocument document = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found"));

        String predType = (String) verifyRes.getOrDefault("documentType", "General Supporting Document");
        Double score = 0.0;
        if (verifyRes.containsKey("verificationScore")) {
            score = ((Number) verifyRes.get("verificationScore")).doubleValue();
        }
        String statusStr = (String) verifyRes.get("status");
        VerificationStatus status = mapStatus(statusStr);

        document.setPredictedDocumentType(predType);
        document.setVerificationScore(score);
        document.setVerificationStatus(status);
        UploadedDocument saved = documentRepository.save(document);

        DocumentVerificationResult result = documentVerificationResultRepository.findByDocumentId(document.getId())
                .orElse(new DocumentVerificationResult());

        result.setDocumentId(document.getId());
        result.setComplaintId(document.getComplaint().getId());
        String ocrMasked = (String) verifyRes.getOrDefault("ocrTextMasked", "");
        result.setOcrText(ocrMasked);
        result.setMaskedOcrText(ocrMasked);
        
        double ocrConf = 0.0;
        if (verifyRes.containsKey("ocrConfidence")) {
            ocrConf = ((Number) verifyRes.get("ocrConfidence")).doubleValue();
        }
        result.setOcrConfidence(ocrConf);
        
        double quality = 0.0;
        if (verifyRes.containsKey("imageQualityScore")) {
            quality = ((Number) verifyRes.get("imageQualityScore")).doubleValue();
        }
        result.setImageQualityScore(quality);
        result.setDocumentType(predType);
        result.setDocumentTypeConfidence(ocrConf);

        try {
            result.setExtractedFieldsJson(objectMapper.writeValueAsString(verifyRes.get("extractedFields")));
            result.setReasonsJson(objectMapper.writeValueAsString(verifyRes.get("reasons")));
            result.setErrorsJson(objectMapper.writeValueAsString(verifyRes.get("errors")));
        } catch (Exception ignored) {}

        result.setVerificationScore(score);
        result.setStatus(statusStr);
        result.setEngine((String) verifyRes.getOrDefault("engine", "easyocr"));
        result.setModelVersion((String) verifyRes.getOrDefault("modelVersion", "1.0"));

        documentVerificationResultRepository.save(result);

        // Award credit if status is VERIFIED
        if (VerificationStatus.VERIFIED == status && saved.getComplaint().getAssignedHelper() != null) {
            levelService.addCredit(
                saved.getComplaint().getAssignedHelper().getId(),
                saved.getComplaint().getId(),
                "DOCUMENT_VERIFIED",
                5,
                "Verified citizen document",
                1L, // System / Admin ID
                "SYSTEM",
                "SYSTEM"
            );
        }

        notificationService.create(saved.getComplaint().getUser(), "Document OCR verification finished with status: " + status, NotificationType.IN_APP);
        mongoLogService.log("document_verification_logs", java.util.Map.of(
                "documentId", saved.getId(),
                "complaintId", saved.getComplaint().getId(),
                "status", saved.getVerificationStatus().name(),
                "predictedType", String.valueOf(saved.getPredictedDocumentType()),
                "score", String.valueOf(saved.getVerificationScore())
        ));
    }

    @Transactional
    public void failOcrJob(Long documentId) {
        UploadedDocument document = documentRepository.findById(documentId).orElse(null);
        if (document != null) {
            document.setVerificationStatus(VerificationStatus.REUPLOAD_REQUIRED);
            documentRepository.save(document);
        }
    }

    private String determineExpectedType(UploadedDocument doc) {
        String filename = doc.getFileName().toLowerCase();
        if (filename.contains("salary") || filename.contains("payslip")) return "Salary Slip";
        if (filename.contains("bank") || filename.contains("statement")) return "Bank Statement";
        if (filename.contains("rent") || filename.contains("agreement")) return "Rent Agreement";
        if (filename.contains("medical")) return "Medical Report";
        if (filename.contains("fir") || filename.contains("police")) return "Police Complaint / FIR Copy";
        if (filename.contains("aadhaar") || filename.contains("id")) return "Aadhaar / ID Proof";
        if (filename.contains("invoice") || filename.contains("bill")) return "Consumer Bill / Invoice";
        if (filename.contains("property")) return "Property Document";
        
        if (doc.getComplaint().getCategory() != null) {
            return switch (doc.getComplaint().getCategory()) {
                case LABOUR_DISPUTE -> "Salary Slip";
                case CONSUMER_COMPLAINT -> "Consumer Bill / Invoice";
                case CYBER_CRIME -> "Bank Statement";
                case PROPERTY_CIVIL_DISPUTE -> "Property Document";
                case WOMEN_SAFETY_DOMESTIC_VIOLENCE -> "Police Complaint / FIR Copy";
                case CRIMINAL_COMPLAINT -> "Police Complaint / FIR Copy";
                default -> "General Supporting Document";
            };
        }
        return "General Supporting Document";
    }

    private VerificationStatus mapStatus(String status) {
        if (status == null) return VerificationStatus.PENDING;
        return switch (status.toUpperCase()) {
            case "VERIFIED" -> VerificationStatus.VERIFIED;
            case "REJECTED" -> VerificationStatus.REJECTED;
            case "REUPLOAD_REQUIRED" -> VerificationStatus.REUPLOAD_REQUIRED;
            case "MANUAL_REVIEW_REQUIRED" -> VerificationStatus.MANUAL_REVIEW_REQUIRED;
            default -> VerificationStatus.PENDING;
        };
    }

    public List<DocumentResponse> byComplaint(Long complaintId) {
        Complaint complaint = complaintService.findComplaint(complaintId);
        User user = userService.currentUser();
        if (user.getRole() != Role.ADMIN 
                && !complaint.getUser().getId().equals(user.getId())
                && (user.getRole() != Role.HELPER || complaint.getAssignedHelper() == null || !complaint.getAssignedHelper().getId().equals(user.getId()))) {
            throw new ForbiddenException("You cannot view documents for this complaint");
        }
        return documentRepository.findByComplaint(complaint).stream().map(mapperService::toDocumentResponse).toList();
    }

    @Transactional
    public DocumentResponse updateVerification(Long documentId, DocumentVerificationRequest request) {
        UploadedDocument document = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found"));
        User user = userService.currentUser();
        if (user.getRole() != Role.ADMIN && user.getRole() != Role.HELPER) {
            throw new ForbiddenException("Only admin/helper can update document verification");
        }
        document.setVerificationStatus(request.verificationStatus());
        document.setPredictedDocumentType(request.predictedDocumentType());
        document.setVerificationScore(request.verificationScore());
        UploadedDocument saved = documentRepository.save(document);
        
        // Award credit if status is VERIFIED
        if (VerificationStatus.VERIFIED == request.verificationStatus() && saved.getComplaint().getAssignedHelper() != null) {
            levelService.addCredit(saved.getComplaint().getAssignedHelper().getId(), saved.getComplaint().getId(), "DOCUMENT_VERIFIED", 5, "Verified citizen document", user.getId(), user.getRole().name(), "SYSTEM");
        }
        
        notificationService.create(saved.getComplaint().getUser(), "Document verification updated to: " + saved.getVerificationStatus(), NotificationType.IN_APP);
        mongoLogService.log("document_verification_logs", java.util.Map.of(
                "documentId", saved.getId(),
                "complaintId", saved.getComplaint().getId(),
                "status", saved.getVerificationStatus().name(),
                "predictedType", String.valueOf(saved.getPredictedDocumentType()),
                "score", String.valueOf(saved.getVerificationScore())
        ));
        return mapperService.toDocumentResponse(saved);
    }

    public DocumentVerificationResult getVerificationResult(Long documentId) {
        return documentVerificationResultRepository.findByDocumentId(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Verification result not found for document ID: " + documentId));
    }

    public Path getSecureDocumentPath(Long documentId) {
        UploadedDocument document = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found"));
        
        Complaint complaint = document.getComplaint();
        User user = userService.currentUser();
        
        if (user.getRole() == Role.ADMIN) {
            // Admin can access all
        } else if (user.getRole() == Role.HELPER) {
            if (complaint.getAssignedHelper() == null || !complaint.getAssignedHelper().getId().equals(user.getId())) {
                throw new ForbiddenException("You are not the assigned helper for this complaint");
            }
        } else {
            if (!complaint.getUser().getId().equals(user.getId())) {
                throw new ForbiddenException("You do not own this complaint");
            }
        }
        
        Path path = Path.of(document.getFilePath());
        if (!Files.exists(path)) {
            throw new ResourceNotFoundException("Document file not found on disk");
        }
        return path;
    }

    private static class DiskMultipartFile implements org.springframework.web.multipart.MultipartFile {
        private final byte[] content;
        private final String name;
        private final String originalFilename;
        private final String contentType;

        public DiskMultipartFile(byte[] content, String name, String originalFilename, String contentType) {
            this.content = content;
            this.name = name;
            this.originalFilename = originalFilename;
            this.contentType = contentType;
        }

        @Override
        public String getName() { return name; }

        @Override
        public String getOriginalFilename() { return originalFilename; }

        @Override
        public String getContentType() { return contentType; }

        @Override
        public boolean isEmpty() { return content == null || content.length == 0; }

        @Override
        public long getSize() { return content.length; }

        @Override
        public byte[] getBytes() throws IOException { return content; }

        @Override
        public java.io.InputStream getInputStream() throws IOException {
            return new java.io.ByteArrayInputStream(content);
        }

        @Override
        public void transferTo(java.io.File dest) throws IOException, IllegalStateException {
            java.nio.file.Files.write(dest.toPath(), content);
        }
    }
}
