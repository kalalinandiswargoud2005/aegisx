package com.astra.backend.service;

import com.astra.backend.entity.Device;
import com.astra.backend.repository.DeviceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DeviceService {

    private final DeviceRepository deviceRepository;

    public List<Device> getAllDevices() {
        return deviceRepository.findAll();
    }

    public Device getDeviceById(java.util.UUID id) {
        return deviceRepository.findById(id).orElse(null);
    }

    public void deleteDevice(java.util.UUID id) {
        deviceRepository.deleteById(id);
    }
}
