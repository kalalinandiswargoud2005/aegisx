package com.astra.backend.repository;

import com.astra.backend.entity.Device;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DeviceRepository extends JpaRepository<Device, UUID> {
    Optional<Device> findByName(String name);
    Optional<Device> findByHostname(String hostname);
    Optional<Device> findByHardwareId(String hardwareId);
    Optional<Device> findByDeviceToken(String deviceToken);

    Optional<Device> findFirstByHardwareIdOrderByCreatedAtDesc(String hardwareId);
    Optional<Device> findFirstByHostnameOrderByCreatedAtDesc(String hostname);
    Optional<Device> findFirstByDeviceTokenOrderByCreatedAtDesc(String deviceToken);
    Optional<Device> findFirstByNameOrderByCreatedAtDesc(String name);

    List<Device> findAllByHardwareId(String hardwareId);
    List<Device> findAllByHostname(String hostname);
}

