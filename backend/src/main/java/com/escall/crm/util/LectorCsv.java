package com.escall.crm.util;

import java.io.InputStream;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Adapter for backward compatibility delegating to standardized {@link CsvReader}.
 */
public final class LectorCsv {

    public static final int MAX_FILAS = CsvReader.MAX_ROWS;

    private LectorCsv() {
    }

    public record Fila(int numero, Map<String, String> valores) {
        public String get(String columna) {
            String v = valores.get(columna);
            return v == null || v.isBlank() ? null : v.trim();
        }
    }

    public static List<Fila> leer(InputStream entrada, Set<String> columnasObligatorias) {
        List<CsvReader.CsvRow> rows = CsvReader.readCsv(entrada, columnasObligatorias);
        return rows.stream().map(r -> new Fila(r.rowNumber(), r.values())).toList();
    }
}
