package com.escall.crm.util;

public final class Textos {

    private Textos() {
    }

    public static String limpiar(String valor) {
        return TextUtils.clean(valor);
    }
}
