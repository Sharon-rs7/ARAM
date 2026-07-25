package com.aram.legalaid.controller;

import com.aram.legalaid.model.AuthorityOffice;
import com.aram.legalaid.model.Complaint;
import com.aram.legalaid.model.User;
import com.aram.legalaid.enums.Role;
import com.aram.legalaid.exception.ForbiddenException;
import com.aram.legalaid.exception.ResourceNotFoundException;
import com.aram.legalaid.repository.ComplaintRepository;
import com.aram.legalaid.service.AuthorityOfficeService;
import com.aram.legalaid.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class AuthorityOfficeController {
    private final AuthorityOfficeService authorityOfficeService;
    private final UserService userService;
    private final ComplaintRepository complaintRepository;

    public AuthorityOfficeController(
            AuthorityOfficeService authorityOfficeService,
            UserService userService,
            ComplaintRepository complaintRepository
    ) {
        this.authorityOfficeService = authorityOfficeService;
        this.userService = userService;
        this.complaintRepository = complaintRepository;
    }

    @GetMapping("/api/citizen/complaints/{complaintId}/authority-locations")
    public ResponseEntity<List<AuthorityOffice>> getCitizenAuthorityLocations(
            @PathVariable Long complaintId,
            @RequestParam(required = false) Double latitude,
            @RequestParam(required = false) Double longitude) {
        User user = userService.currentUser();
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found"));

        if (user.getRole() != Role.ADMIN) {
            if (user.getRole() == Role.CITIZEN) {
                if (!complaint.getUser().getId().equals(user.getId())) {
                    throw new ForbiddenException("Unauthorized");
                }
            } else if (user.getRole() == Role.HELPER) {
                if (complaint.getAssignedHelper() == null || !complaint.getAssignedHelper().getId().equals(user.getId())) {
                    throw new ForbiddenException("Unauthorized");
                }
            } else {
                throw new ForbiddenException("Access Denied");
            }
        }

        String category = complaint.getCategory() != null ? complaint.getCategory().name() : null;
        String district = complaint.getDistrict();
        List<AuthorityOffice> matching = authorityOfficeService.findMatchingOffices(category, district, null, latitude, longitude);
        return ResponseEntity.ok(matching);
    }

    @GetMapping("/api/authorities/search")
    public ResponseEntity<List<AuthorityOffice>> searchOffices(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String district,
            @RequestParam(required = false) String area,
            @RequestParam(required = false) Double latitude,
            @RequestParam(required = false) Double longitude
    ) {
        List<AuthorityOffice> matching = authorityOfficeService.findMatchingOffices(category, district, area, latitude, longitude);
        return ResponseEntity.ok(matching);
    }

    @GetMapping("/api/admin/authority-offices")
    public ResponseEntity<List<AuthorityOffice>> getAdminOffices() {
        requireAdmin();
        return ResponseEntity.ok(authorityOfficeService.all());
    }

    @PostMapping("/api/admin/authority-offices")
    public ResponseEntity<AuthorityOffice> createAdminOffice(@RequestBody AuthorityOffice office) {
        requireAdmin();
        return ResponseEntity.ok(authorityOfficeService.save(office));
    }

    @PutMapping("/api/admin/authority-offices/{id}")
    public ResponseEntity<AuthorityOffice> updateAdminOffice(@PathVariable Long id, @RequestBody AuthorityOffice officeDetails) {
        requireAdmin();
        AuthorityOffice office = authorityOfficeService.all().stream()
                .filter(o -> o.getId().equals(id))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Office not found"));

        office.setName(officeDetails.getName());
        office.setAuthorityType(officeDetails.getAuthorityType());
        office.setCategorySupported(officeDetails.getCategorySupported());
        office.setDistrict(officeDetails.getDistrict());
        office.setArea(officeDetails.getArea());
        office.setAddress(officeDetails.getAddress());
        office.setPhone(officeDetails.getPhone());
        office.setEmail(officeDetails.getEmail());
        office.setWebsite(officeDetails.getWebsite());
        office.setWorkingHours(officeDetails.getWorkingHours());
        office.setLatitude(officeDetails.getLatitude());
        office.setLongitude(officeDetails.getLongitude());
        office.setMapsUrl(officeDetails.getMapsUrl());
        office.setOnlinePortalUrl(officeDetails.getOnlinePortalUrl());
        office.setActive(officeDetails.isActive());

        return ResponseEntity.ok(authorityOfficeService.save(office));
    }

    @DeleteMapping("/api/admin/authority-offices/{id}")
    public ResponseEntity<Void> deleteAdminOffice(@PathVariable Long id) {
        requireAdmin();
        authorityOfficeService.delete(id);
        return ResponseEntity.noContent().build();
    }

    private void requireAdmin() {
        User user = userService.currentUser();
        if (user.getRole() != Role.ADMIN) {
            throw new ForbiddenException("Administrator privileges required");
        }
    }
}
