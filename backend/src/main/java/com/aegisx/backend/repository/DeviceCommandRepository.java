package com.aegisx.backend.repository;

import com.aegisx.backend.entity.DeviceCommand;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface DeviceCommandRepository extends JpaRepository<DeviceCommand, UUID> {
    List<DeviceCommand> findByDeviceIdAndStatus(UUID deviceId, String status);
    List<DeviceCommand> findByIncidentId(UUID incidentId);
}
