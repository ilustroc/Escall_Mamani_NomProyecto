package com.escall.crm.util;

/**
 * Compatibility delegate for {@link TextUtils}.
 */
public final class Textos {

    private Textos() {
    }

    public static String limpiar(String valor) {
        return TextUtils.clean(valor);
    }
}
