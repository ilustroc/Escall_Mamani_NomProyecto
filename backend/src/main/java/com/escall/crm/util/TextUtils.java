package com.escall.crm.util;

/**
 * String and Text Sanitization Utility.
 */
public final class TextUtils {

    private TextUtils() {
    }

    /**
     * Trims leading and trailing whitespace and converts empty strings to null.
     */
    public static String clean(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    /** Compatibility alias */
    public static String limpiar(String value) {
        return clean(value);
    }
}
