package com.astra.backend.repository;

import com.astra.backend.entity.SystemLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface SystemLogRepository extends JpaRepository<SystemLog, UUID> {
}
