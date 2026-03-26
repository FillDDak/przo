package com.przo.company_web.service;

import com.przo.company_web.dto.GeoInfo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class GeoLocationService {

    private final RestTemplate restTemplate;

    public GeoInfo lookup(String ip) {
        if (ip == null || ip.isBlank() || ip.equals("127.0.0.1") || ip.equals("0:0:0:0:0:0:0:1")) {
            return GeoInfo.local();
        }
        try {
            String url = "http://ip-api.com/json/" + ip + "?fields=status,city,country";
            @SuppressWarnings("unchecked")
            Map<String, String> response = restTemplate.getForObject(url, Map.class);
            if (response != null && "success".equals(response.get("status"))) {
                return new GeoInfo(response.get("city"), response.get("country"));
            }
        } catch (Exception e) {
            log.warn("GeoIP 조회 실패 (ip={}): {}", ip, e.getMessage());
        }
        return GeoInfo.unknown();
    }
}
