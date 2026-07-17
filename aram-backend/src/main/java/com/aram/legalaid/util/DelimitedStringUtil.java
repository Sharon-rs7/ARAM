package com.aram.legalaid.util;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

public final class DelimitedStringUtil {
    private DelimitedStringUtil() {}
    public static String join(List<String> items) {
        if (items == null) return "";
        return items.stream().map(String::trim).collect(Collectors.joining("||"));
    }
    public static List<String> split(String value) {
        if (value == null || value.isBlank()) return List.of();
        return Arrays.stream(value.split("\\|\\|"))
                .map(String::trim)
                .filter(s -> !s.isBlank())
                .toList();
    }
}
