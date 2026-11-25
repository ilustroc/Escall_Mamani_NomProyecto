package com.escall.crm.seguridad;

import com.escall.crm.modelo.Usuario;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class JwtService {

    private final JwtEncoder encoder;
    private final long expirationHours;

    public JwtService(JwtEncoder encoder, @Value("${app.jwt.horas-expiracion}") long expirationHours) {
        this.encoder = encoder;
        this.expirationHours = expirationHours;
    }

    public TokenGenerado generateToken(Usuario user) {
        Instant now = Instant.now();
        Instant expiresAt = now.plus(expirationHours, ChronoUnit.HOURS);
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("crm-cobranzas")
                .issuedAt(now)
                .expiresAt(expiresAt)
                .subject(user.getUsuario())
                .claim("nombre", user.getNombre())
                .claim("roles", List.of(user.getRol().name()))
                .build();
        JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();
        String token = encoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
        return new TokenGenerado(token, expiresAt);
    }

    public TokenGenerado generar(Usuario usuario) {
        return generateToken(usuario);
    }

    public record TokenGenerado(String valor, Instant expiraEn) {
    }
}
