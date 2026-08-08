package com.aegisx.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.scheduling.annotation.EnableScheduling;

import org.springframework.context.annotation.Bean;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.boot.CommandLineRunner;

@SpringBootApplication
@EnableScheduling
public class AegisxBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(AegisxBackendApplication.class, args);
	}

	@Bean
	public CommandLineRunner fixDatabaseSchema(JdbcTemplate jdbcTemplate) {
		return args -> {
			try {
				jdbcTemplate.execute("ALTER TABLE threats.incidents ADD COLUMN IF NOT EXISTS target VARCHAR(255);");
				System.out.println("Successfully ensured 'target' column exists in threats.incidents table.");
				
				// Clear mock incidents so the Threat Center is clean for presentation
				jdbcTemplate.execute("DELETE FROM threats.incidents WHERE id::text LIKE '20000000-%';");
				System.out.println("Successfully cleared mock incidents from the database.");
			} catch (Exception e) {
				System.err.println("Note: Could not execute database startup script: " + e.getMessage());
			}
		};
	}

}
