package com.przo.company_web;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@org.springframework.scheduling.annotation.EnableAsync
public class CompanyWebApplication {

	public static void main(String[] args) {
		SpringApplication.run(CompanyWebApplication.class, args);
	}

}
