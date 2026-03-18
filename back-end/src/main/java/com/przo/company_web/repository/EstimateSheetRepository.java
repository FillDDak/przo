package com.przo.company_web.repository;

import com.przo.company_web.entity.EstimateSheet;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EstimateSheetRepository extends JpaRepository<EstimateSheet, Long> {
    Optional<EstimateSheet> findBySheetKey(String sheetKey);
}
