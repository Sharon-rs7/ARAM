package com.aram.legalaid.service;

import com.aram.legalaid.model.AuthorityOffice;
import com.aram.legalaid.repository.AuthorityOfficeRepository;
import com.aram.legalaid.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AuthorityOfficeService {
    private final AuthorityOfficeRepository authorityOfficeRepository;

    public AuthorityOfficeService(AuthorityOfficeRepository authorityOfficeRepository) {
        this.authorityOfficeRepository = authorityOfficeRepository;
    }

    public List<AuthorityOffice> all() {
        return authorityOfficeRepository.findAll();
    }

    public AuthorityOffice save(AuthorityOffice office) {
        return authorityOfficeRepository.save(office);
    }

    public void delete(Long id) {
        AuthorityOffice office = authorityOfficeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Office not found with id " + id));
        office.setActive(false);
        authorityOfficeRepository.save(office);
    }

    // 5-argument version for backward compatibility
    public List<AuthorityOffice> findMatchingOffices(
            String category, 
            String district, 
            String area, 
            Double lat, 
            Double lng
    ) {
        return findMatchingOffices(category, null, district, area, null, lat, lng);
    }

    // 7-argument version for advanced NLP matching
    public List<AuthorityOffice> findMatchingOffices(
            String category, 
            String priority, 
            String district, 
            String area, 
            String language, 
            Double userLat, 
            Double userLng
    ) {
        // Find by category
        List<AuthorityOffice> offices = authorityOfficeRepository.findByCategorySupportedAndActiveTrue(category != null ? category : "GENERAL_LEGAL_AID");
        
        if (offices.isEmpty()) {
            // Fallback to all active offices
            offices = authorityOfficeRepository.findByActiveTrue();
        }

        List<MatchedOfficeWrapper> matchedList = new ArrayList<>();

        for (AuthorityOffice office : offices) {
            double score = 0.0;

            // 1. Category match
            if (category != null && office.getCategorySupported().equalsIgnoreCase(category)) {
                score += 100.0;
            }

            // 2. District match
            if (district != null && office.getDistrict().equalsIgnoreCase(district)) {
                score += 50.0;
            }

            // 3. Area match
            if (area != null && office.getArea().equalsIgnoreCase(area)) {
                score += 25.0;
            }

            // 4. Language match
            if (language != null && office.getSupportedLanguages() != null 
                    && office.getSupportedLanguages().toLowerCase().contains(language.toLowerCase())) {
                score += 10.0;
            }

            // 5. Distance calculation if coordinates are present
            Double distance = null;
            if (userLat != null && userLng != null && office.getLatitude() != null && office.getLongitude() != null) {
                distance = calculateHaversineDistance(userLat, userLng, office.getLatitude(), office.getLongitude());
                // Distance bonus: closer is better
                score += Math.max(0.0, 50.0 - distance);
            }

            matchedList.add(new MatchedOfficeWrapper(office, score, distance));
        }

        // Sort by score descending, then by distance ascending if present
        matchedList.sort((a, b) -> {
            int comp = Double.compare(b.score, a.score);
            if (comp != 0) return comp;
            if (a.distance != null && b.distance != null) {
                return Double.compare(a.distance, b.distance);
            }
            return 0;
        });

        return matchedList.stream().map(w -> w.office).collect(Collectors.toList());
    }

    private double calculateHaversineDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371; // Radius of the earth in km
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    private static class MatchedOfficeWrapper {
        final AuthorityOffice office;
        final double score;
        final Double distance;

        MatchedOfficeWrapper(AuthorityOffice office, double score, Double distance) {
            this.office = office;
            this.score = score;
            this.distance = distance;
        }
    }
}
