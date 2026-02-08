package com.przo.company_web.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "INQUIRIES")
@Getter
@Setter
@NoArgsConstructor
public class Inquiry {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "inquiry_seq")
    @SequenceGenerator(name = "inquiry_seq", sequenceName = "SEQ_INQUIRY_ID", allocationSize = 1)
    @Column(name = "INQUIRY_ID")
    private Long id;

    @Column(name = "NAME", nullable = false, length = 50)
    private String name;

    @Column(name = "COMPANY_NAME", length = 100)
    private String companyName;

    @Column(name = "PHONE", nullable = false, length = 20)
    private String phone;

    @Column(name = "EMAIL", nullable = false, length = 100)
    private String email;

    @Column(name = "PASSWORD", nullable = false, length = 100)
    private String password;

    @Column(name = "TITLE", nullable = false, length = 200)
    private String title;

    @Lob
    @Column(name = "CONTENT", nullable = false)
    private String content;

    @Column(name = "ATTACHMENT", length = 500)
    private String attachment;

    @Column(name = "STATUS", length = 20)
    private String status = "pending";

    @Lob
    @Column(name = "ADMIN_NOTE")
    private String adminNote;

    @CreationTimestamp
    @Column(name = "CREATED_AT", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "RESPONDED_AT")
    private LocalDateTime respondedAt;
}
