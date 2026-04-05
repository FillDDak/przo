package com.przo.company_web.service;

import com.przo.company_web.entity.EstimateSheet;
import com.przo.company_web.repository.EstimateSheetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PriceTableService {

    private static final String PRICE_TABLE_KEY = "price-table";
    private final EstimateSheetRepository estimateSheetRepository;

    public Optional<String> load() {
        return estimateSheetRepository.findBySheetKey(PRICE_TABLE_KEY)
                .map(EstimateSheet::getDataJson);
    }

    @Transactional
    public void save(String dataJson) {
        try {
            EstimateSheet sheet = estimateSheetRepository.findBySheetKey(PRICE_TABLE_KEY)
                    .orElseGet(() -> {
                        EstimateSheet s = new EstimateSheet();
                        s.setSheetKey(PRICE_TABLE_KEY);
                        return s;
                    });
            sheet.setDataJson(dataJson);
            estimateSheetRepository.saveAndFlush(sheet);
        } catch (Exception e) {
            throw new RuntimeException("가격표 저장 실패: " + e.getMessage(), e);
        }
    }
}
