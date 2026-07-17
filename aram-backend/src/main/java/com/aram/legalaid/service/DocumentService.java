package com.aram.legalaid.service;

import com.aram.legalaid.dto.DocumentResponse;
import com.aram.legalaid.dto.DocumentVerificationRequest;
import com.aram.legalaid.enums.NotificationType;
import com.aram.legalaid.enums.Role;
import com.aram.legalaid.enums.VerificationStatus;
import com.aram.legalaid.exception.BadRequestException;
import com.aram.legalaid.exception.ForbiddenException;
import com.aram.legalaid.exception.ResourceNotFoundException;
import com.aram.legalaid.model.Complaint;
import com.aram.legalaid.model.UploadedDocument;
import com.aram.legalaid.model.User;
import com.aram.legalaid.repository.UploadedDocumentRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
public class DocumentService {
    private static final Set<String> ALLOWED_TYPES = Set.of("application/pdf", "image/jpeg", "image/png", "image/jpg");

    private final UploadedDocumentRepository documentRepository;
    private final ComplaintService complaintService;
    private final UserService userService;
    private final MapperService mapperService;
    private final NotificationService notificationService;
    private final MongoLogService mongoLogService;

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    @Value("${app.upload.max-size-mb:10}")
    private long maxSizeMb;

    public DocumentService(UploadedDocumentRepository documentRepository, ComplaintService complaintService, UserService userService,
                           MapperService mapperService, NotificationService notificationService, MongoLogService mongoLogService) {
        this.documentRepository = documentRepository;
        this.complaintService = complaintService;
        this.userService = userService;
        this.mapperService = mapperService;
        this.notificationService = notificationService;
        this.mongoLogService = mongoLogService;
    }

    @Transactional
    public DocumentResponse upload(Long complaintId, MultipartFile file) {
        if (file == null || file.isEmpty()) throw new BadRequestException("Document file is required");
        if (file.getSize() > maxSizeMb * 1024 * 1024) throw new BadRequestException("File size must be below " + maxSizeMb + "MB");
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType)) {
            throw new BadRequestException("Allowed file types: PDF, JPG, PNG");
        }
        Complaint complaint = complaintService.findComplaint(complaintId);
        User user = userService.currentUser();
        if (user.getRole() != Role.ADMIN && !complaint.getUser().getId().equals(user.getId())) {
            throw new ForbiddenException("You cannot upload document for this complaint");
        }

        try {
            Path base = Path.of(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(base);
            String safeName = UUID.randomUUID() + "_" + file.getOriginalFilename().replaceAll("[^a-zA-Z0-9._-]", "_");
            Path target = base.resolve(safeName);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

            UploadedDocument document = new UploadedDocument();
            document.setComplaint(complaint);
            document.setFileName(file.getOriginalFilename());
            document.setFileType(contentType);
            document.setFilePath(target.toString());
            document.setVerificationStatus(VerificationStatus.PENDING);
            UploadedDocument saved = documentRepository.save(document);
            notificationService.create(complaint.getUser(), "Document uploaded for complaint ID " + complaint.getId() + ". Verification is pending.", NotificationType.IN_APP);
            return mapperService.toDocumentResponse(saved);
        } catch (IOException ex) {
            throw new BadRequestException("Unable to store file: " + ex.getMessage());
        }
    }

    public List<DocumentResponse> byComplaint(Long complaintId) {
        Complaint complaint = complaintService.findComplaint(complaintId);
        User user = userService.currentUser();
        if (user.getRole() != Role.ADMIN && !complaint.getUser().getId().equals(user.getId())) {
            throw new ForbiddenException("You cannot view documents for this complaint");
        }
        return documentRepository.findByComplaint(complaint).stream().map(mapperService::toDocumentResponse).toList();
    }

    @Transactional
    public DocumentResponse updateVerification(Long documentId, DocumentVerificationRequest request) {
        UploadedDocument document = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found"));
        User user = userService.currentUser();
        if (user.getRole() != Role.ADMIN) throw new ForbiddenException("Only admin can update document verification");
        document.setVerificationStatus(request.verificationStatus());
        document.setPredictedDocumentType(request.predictedDocumentType());
        document.setVerificationScore(request.verificationScore());
        UploadedDocument saved = documentRepository.save(document);
        notificationService.create(saved.getComplaint().getUser(), "Document verification updated: " + saved.getVerificationStatus(), NotificationType.IN_APP);
        mongoLogService.log("document_verification_logs", java.util.Map.of(
                "documentId", saved.getId(),
                "complaintId", saved.getComplaint().getId(),
                "status", saved.getVerificationStatus().name(),
                "predictedType", String.valueOf(saved.getPredictedDocumentType()),
                "score", String.valueOf(saved.getVerificationScore())
        ));
        return mapperService.toDocumentResponse(saved);
    }
}
