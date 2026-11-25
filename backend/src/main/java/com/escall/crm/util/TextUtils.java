package com.escall.crm.util;

public final class TextUtils {

    private TextUtils() {
    }

    public static String clean(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    public static String limpiar(String value) {
        return clean(value);
    }
}
