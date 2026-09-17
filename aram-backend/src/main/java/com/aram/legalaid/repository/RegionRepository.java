package com.aram.legalaid.repository;

import com.aram.legalaid.model.Region;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface RegionRepository extends JpaRepository<Region, Long> {
    Optional<Region> findByRegionId(String regionId);
    Optional<Region> findByRegionNameIgnoreCase(String regionName);
    boolean existsByRegionId(String regionId);
}
