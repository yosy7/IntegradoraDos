package utez.edu.mx.services.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import utez.edu.mx.services.module.usuario.Usuario;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Component
public class JwtUtil {

    private static final String SECRET = "sgp_utez_secret_key_2026_very_secure_key_abc123";
    private static final long EXPIRATION = 1000 * 60 * 60 * 10; // 10 horas

    private SecretKey getKey() {
        return Keys.hmacShaKeyFor(SECRET.getBytes());
    }

    public String generateToken(Usuario usuario) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("rol", usuario.getRol() != null ? usuario.getRol().getNombre() : "INTEGRANTE");
        claims.put("idUsuario", usuario.getIdUsuario());
        claims.put("nombre", usuario.getNombre());

        return Jwts.builder()
                .claims(claims)
                .subject(usuario.getUsername())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + EXPIRATION))
                .signWith(getKey())
                .compact();
    }

    public String extractUsername(String token) {
        return extractClaims(token).getSubject();
    }

    // ✅ FIX: isTokenValid ahora captura ExpiredJwtException y cualquier JwtException
    // En jjwt, si el token está expirado, extractClaims() lanza ExpiredJwtException
    // antes de que podamos siquiera comparar el username — por eso fallaba silenciosamente
    public boolean isTokenValid(String token, UserDetails userDetails) {
        try {
            String username = extractUsername(token);
            return username.equals(userDetails.getUsername()) && !isTokenExpired(token);
        } catch (ExpiredJwtException e) {
            return false; // Token expirado → no válido
        } catch (JwtException e) {
            return false; // Firma inválida, token malformado, etc.
        } catch (Exception e) {
            return false; // Cualquier otro error inesperado
        }
    }

    private boolean isTokenExpired(String token) {
        try {
            return extractClaims(token).getExpiration().before(new Date());
        } catch (ExpiredJwtException e) {
            return true; // Si lanza excepción de expirado, definitivamente expiró
        }
    }

    private Claims extractClaims(String token) {
        return Jwts.parser()
                .verifyWith(getKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}