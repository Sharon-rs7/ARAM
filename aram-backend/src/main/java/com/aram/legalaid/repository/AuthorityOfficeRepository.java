package com.aram.legalaid.repository;

import com.aram.legalaid.model.AuthorityOffice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuthorityOfficeRepository extends JpaRepository<AuthorityOffice, Long> {
    List<AuthorityOffice> findByActiveTrue();
    List<AuthorityOffice> findByCategorySupportedAndDistrictAndActiveTrue(String categorySupported, String district);
    List<AuthorityOffice> findByCategorySupportedAndActiveTrue(String categorySupported);
}
