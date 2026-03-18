package com.przo.company_web.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "FAQS")
@Getter
@Setter
@NoArgsConstructor
public class Faq {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "faq_seq")
    @SequenceGenerator(name = "faq_seq", sequenceName = "SEQ_FAQ_ID", allocationSize = 1)
    @Column(name = "FAQ_ID")
    private Long id;

    @Column(name = "QUESTION", nullable = false, length = 500)
    private String question;

    @Lob
    @Column(name = "ANSWER", nullable = false)
    private String answer;

    @Column(name = "ORDER_INDEX", nullable = false)
    private Integer orderIndex = 0;
}
