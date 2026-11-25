package com.escall.crm.util;

import com.escall.crm.excepcion.ReglaNegocioException;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.*;

/**
 * Standard CSV Reader utility.
 * Parses CSV files with ";" or "," delimiter, handles UTF-8 BOM, and quoted values.
 */
public final class CsvReader {

    public static final int MAX_ROWS = 20_000;

    private CsvReader() {
    }

    public record CsvRow(int rowNumber, Map<String, String> values) {

        public String get(String column) {
            String val = values.get(column);
            return val == null || val.isBlank() ? null : val.trim();
        }
    }

    public static List<CsvRow> readCsv(InputStream input, Set<String> mandatoryColumns) {
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(input, StandardCharsets.UTF_8))) {
            String header = reader.readLine();
            if (header == null || header.isBlank()) {
                throw new ReglaNegocioException("El archivo está vacío");
            }
            header = header.replace("\uFEFF", "");
            char delimiter = header.chars().filter(c -> c == ';').count() >= header.chars().filter(c -> c == ',').count()
                    ? ';' : ',';
            List<String> columns = split(header, delimiter).stream()
                    .map(c -> c.trim().toLowerCase(Locale.ROOT).replace(' ', '_'))
                    .toList();

            List<String> missing = mandatoryColumns.stream().filter(c -> !columns.contains(c)).sorted().toList();
            if (!missing.isEmpty()) {
                throw new ReglaNegocioException("Estructura inválida. Faltan las columnas: " + String.join(", ", missing));
            }

            List<CsvRow> rows = new ArrayList<>();
            String line;
            int lineNumber = 1;
            while ((line = reader.readLine()) != null) {
                lineNumber++;
                if (line.isBlank()) {
                    continue;
                }
                if (rows.size() >= MAX_ROWS) {
                    throw new ReglaNegocioException("El archivo supera el máximo de " + MAX_ROWS + " filas");
                }
                List<String> parts = split(line, delimiter);
                Map<String, String> values = new HashMap<>();
                for (int i = 0; i < columns.size(); i++) {
                    values.put(columns.get(i), i < parts.size() ? parts.get(i) : null);
                }
                rows.add(new CsvRow(lineNumber, values));
            }
            if (rows.isEmpty()) {
                throw new ReglaNegocioException("El archivo no tiene filas de datos");
            }
            return rows;
        } catch (IOException e) {
            throw new ReglaNegocioException("No se pudo leer el archivo. Verifica que sea un CSV en UTF-8.");
        }
    }

    private static List<String> split(String line, char delimiter) {
        List<String> parts = new ArrayList<>();
        StringBuilder current = new StringBuilder();
        boolean inQuotes = false;
        for (int i = 0; i < line.length(); i++) {
            char c = line.charAt(i);
            if (c == '"') {
                if (inQuotes && i + 1 < line.length() && line.charAt(i + 1) == '"') {
                    current.append('"');
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (c == delimiter && !inQuotes) {
                parts.add(current.toString());
                current.setLength(0);
            } else {
                current.append(c);
            }
        }
        parts.add(current.toString());
        return parts;
    }
}
