package com.przo.company_web.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "ESTIMATE_SHEETS")
@Getter
@Setter
@NoArgsConstructor
public class EstimateSheet {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "estimate_sheet_seq")
    @SequenceGenerator(name = "estimate_sheet_seq", sequenceName = "SEQ_ESTIMATE_SHEET_ID", allocationSize = 1)
    @Column(name = "SHEET_ID")
    private Long id;

    @Column(name = "SHEET_KEY", nullable = false, unique = true, length = 50)
    private String sheetKey;

    @Basic(fetch = FetchType.EAGER)
    @Column(name = "DATA_JSON", nullable = false, columnDefinition = "CLOB")
    private String dataJson;

    @Column(name = "UPDATED_AT")
    private LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    public void setUpdatedAt() {
        this.updatedAt = LocalDateTime.now();
    }
}
