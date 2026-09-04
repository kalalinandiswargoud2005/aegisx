package com.astra.backend.repository;

import com.astra.backend.entity.Device;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface DeviceRepository extends JpaRepository<Device, UUID> {
    Optional<Device> findByName(String name);
    Optional<Device> findByHostname(String hostname);
    Optional<Device> findByHardwareId(String hardwareId);
    Optional<Device> findByDeviceToken(String deviceToken);
}
