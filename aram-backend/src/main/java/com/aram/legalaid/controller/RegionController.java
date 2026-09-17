package com.aram.legalaid.controller;

import com.aram.legalaid.enums.Role;
import com.aram.legalaid.model.Region;
import com.aram.legalaid.model.User;
import com.aram.legalaid.repository.RegionRepository;
import com.aram.legalaid.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/regions")
@CrossOrigin
public class RegionController {
    private final RegionRepository regionRepository;
    private final UserRepository userRepository;

    public RegionController(RegionRepository regionRepository, UserRepository userRepository) {
        this.regionRepository = regionRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getRegions() {
        List<Region> regions = regionRepository.findAll();
        List<User> allUsers = userRepository.findAll();

        List<Map<String, Object>> responseList = new ArrayList<>();
        for (Region r : regions) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", r.getRegionId());
            map.put("name", r.getRegionName());
            map.put("adminEmail", r.getAdminEmail());

            List<Map<String, Object>> admins = new ArrayList<>();
            List<Map<String, Object>> guides = new ArrayList<>();

            for (User u : allUsers) {
                if (u.getDistrict() != null && u.getDistrict().equalsIgnoreCase(r.getRegionName())) {
                    Map<String, Object> userMap = new HashMap<>();
                    userMap.put("id", u.getId());
                    userMap.put("name", u.getName());
                    userMap.put("email", u.getEmail());
                    userMap.put("mobile", u.getMobile());
                    userMap.put("status", u.getStatus().name());

                    if (u.getRole() == Role.ADMIN) {
                        admins.add(userMap);
                    } else if (u.getRole() == Role.HELPER) {
                        guides.add(userMap);
                    }
                }
            }

            map.put("admins", admins);
            map.put("guides", guides);
            responseList.add(map);
        }

        return ResponseEntity.ok(responseList);
    }
}
