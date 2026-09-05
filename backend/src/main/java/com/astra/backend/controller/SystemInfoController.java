package com.astra.backend.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.Inet4Address;
import java.net.InetAddress;
import java.net.NetworkInterface;
import java.util.*;

@Slf4j
@RestController
@RequestMapping("/api/v1/system")
@CrossOrigin(origins = "*")
public class SystemInfoController {

    @GetMapping("/network-info")
    public ResponseEntity<Map<String, Object>> getNetworkInfo() {
        List<String> ipList = new ArrayList<>();
        String primaryIp = "127.0.0.1";

        try {
            Enumeration<NetworkInterface> interfaces = NetworkInterface.getNetworkInterfaces();
            while (interfaces.hasMoreElements()) {
                NetworkInterface ni = interfaces.nextElement();
                if (ni.isLoopback() || !ni.isUp()) continue;

                Enumeration<InetAddress> addresses = ni.getInetAddresses();
                while (addresses.hasMoreElements()) {
                    InetAddress addr = addresses.nextElement();
                    if (addr instanceof Inet4Address && !addr.isLoopbackAddress()) {
                        String ip = addr.getHostAddress();
                        if (!ip.startsWith("169.254")) { // Ignore link-local
                            ipList.add(ip);
                            if (ip.startsWith("192.168.") || ip.startsWith("10.") || ip.startsWith("172.")) {
                                primaryIp = ip;
                            }
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.warn("Failed to enumerate network interfaces: {}", e.getMessage());
        }

        if (ipList.isEmpty()) {
            ipList.add("127.0.0.1");
        }

        Map<String, Object> res = new HashMap<>();
        res.put("primaryIp", primaryIp);
        res.put("allIps", ipList);
        res.put("remotePort", 5173);
        res.put("apiPort", 8080);
        res.put("remoteUrl", "http://" + primaryIp + ":5173/remote");

        return ResponseEntity.ok(res);
    }
}
