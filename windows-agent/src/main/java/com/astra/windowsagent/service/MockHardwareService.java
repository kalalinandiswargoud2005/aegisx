package com.astra.windowsagent.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class MockHardwareService {
    
    public void triggerHardwareAlert(String threatId, String detail) {
        System.out.println("=========================");
        System.out.println("       ESP32 MOCK        ");
        System.out.println(" Threat: " + threatId);
        System.out.println(" LED:    RED");
        System.out.println(" OLED:   " + detail);
        System.out.println(" BUZZER: ON");
        System.out.println("=========================");
    }
}
