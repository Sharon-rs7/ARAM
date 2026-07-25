package com.aram.legalaid.service;

import com.aram.legalaid.model.AuthorityOffice;
import com.aram.legalaid.repository.AuthorityOfficeRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

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
        authorityOfficeRepository.deleteById(id);
    }

    public List<AuthorityOffice> findMatchingOffices(String category, String district, String area, Double userLat, Double userLng) {
        List<AuthorityOffice> offices;
        if (category != null && district != null) {
            offices = authorityOfficeRepository.findByCategorySupportedIgnoreCaseAndDistrictIgnoreCase(category, district);
        } else if (district != null) {
            offices = authorityOfficeRepository.findByDistrictIgnoreCase(district);
        } else if (category != null) {
            offices = authorityOfficeRepository.findByCategorySupportedIgnoreCase(category);
        } else {
            offices = authorityOfficeRepository.findAll();
        }

        if (offices.isEmpty() && category != null) {
            offices = authorityOfficeRepository.findByCategorySupportedIgnoreCase(category);
        }
        
        if (offices.isEmpty()) {
            offices = authorityOfficeRepository.findAll().stream().filter(AuthorityOffice::isActive).toList();
        }

        List<AuthorityOffice> mutableList = new ArrayList<>(offices);

        if (area != null && !area.trim().isEmpty()) {
            mutableList.sort((o1, o2) -> {
                boolean o1AreaMatch = o1.getArea() != null && o1.getArea().equalsIgnoreCase(area);
                boolean o2AreaMatch = o2.getArea() != null && o2.getArea().equalsIgnoreCase(area);
                if (o1AreaMatch && !o2AreaMatch) return -1;
                if (!o1AreaMatch && o2AreaMatch) return 1;
                return 0;
            });
        }

        if (userLat != null && userLng != null) {
            mutableList.sort((o1, o2) -> {
                Double dist1 = getDistance(o1, userLat, userLng);
                Double dist2 = getDistance(o2, userLat, userLng);
                if (dist1 == null && dist2 == null) return 0;
                if (dist1 == null) return 1;
                if (dist2 == null) return -1;
                return Double.compare(dist1, dist2);
            });
        }

        return mutableList;
    }

    public Double getDistance(AuthorityOffice office, double userLat, double userLng) {
        if (office.getLatitude() == null || office.getLongitude() == null) {
            return null;
        }
        return calculateDistance(userLat, userLng, office.getLatitude(), office.getLongitude());
    }

    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371; // Earth radius in km
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
}
