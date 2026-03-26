package com.przo.company_web.dto;

public record GeoInfo(String city, String country) {
    public static GeoInfo unknown() {
        return new GeoInfo("Unknown", "Unknown");
    }

    public static GeoInfo local() {
        return new GeoInfo("Local", "Local");
    }
}
