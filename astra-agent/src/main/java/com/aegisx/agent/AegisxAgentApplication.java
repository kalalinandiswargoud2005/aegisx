package com.astra.agent;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class AstraxAgentApplication {

	public static void main(String[] args) {
		SpringApplication.run(AstraxAgentApplication.class, args);
	}
}
