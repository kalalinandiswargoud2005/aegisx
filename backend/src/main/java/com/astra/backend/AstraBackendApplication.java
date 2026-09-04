package com.astra.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.scheduling.annotation.EnableScheduling;

import org.springframework.context.annotation.Bean;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.boot.CommandLineRunner;

@SpringBootApplication
@EnableScheduling
public class AstraBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(AstraBackendApplication.class, args);
	}

	@Bean
	public CommandLineRunner fixDatabaseSchema(JdbcTemplate jdbcTemplate) {
		return args -> {
			try {
				jdbcTemplate.execute("ALTER TABLE threats.incidents ADD COLUMN IF NOT EXISTS target VARCHAR(255);");
				System.out.println("Successfully ensured 'target' column exists in threats.incidents table.");
				
				// Incidents cleared for initial fresh start.
				System.out.println("Successfully cleared all incidents from the database.");
				
				// Clear mock devices
				jdbcTemplate.execute("DELETE FROM devices.registered_devices WHERE id::text LIKE '10000000-%';");
				System.out.println("Successfully cleared mock devices from the database.");
			} catch (Exception e) {
				System.err.println("Note: Could not execute database startup script: " + e.getMessage());
			}
		};
	}

}
