package utez.edu.mx.services.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserDetailsServiceImpl userDetailsService;

    public JwtFilter(JwtUtil jwtUtil, UserDetailsServiceImpl userDetailsService) {
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");

        // Sin token: continuar sin autenticar (rutas públicas pasarán, protegidas serán bloqueadas por Spring Security)
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        final String token = authHeader.substring(7);
        final String username;

        // ✅ FIX 1: extraer username con manejo de excepción explícito
        // Si el token tiene firma inválida o está malformado, extractUsername lanza excepción
        try {
            username = jwtUtil.extractUsername(token);
        } catch (Exception e) {
            logger.warn("JWT inválido o malformado: " + e.getMessage());
            filterChain.doFilter(request, response);
            return;
        }

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            UserDetails userDetails;

            // ✅ FIX 2: capturar excepción si el usuario no existe en BD
            try {
                userDetails = userDetailsService.loadUserByUsername(username);
            } catch (Exception e) {
                logger.warn("Usuario del token no encontrado en BD: " + username);
                filterChain.doFilter(request, response);
                return;
            }

            // ✅ FIX 3: isTokenValid también puede lanzar excepción si el token está expirado
            // porque internamente llama a extractClaims() que usa el parser de jjwt
            boolean tokenValido;
            try {
                tokenValido = jwtUtil.isTokenValid(token, userDetails);
            } catch (Exception e) {
                logger.warn("Token expirado o inválido para usuario '" + username + "': " + e.getMessage());
                filterChain.doFilter(request, response);
                return;
            }

            if (tokenValido) {
                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                userDetails.getAuthorities()
                        );

                authToken.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request)
                );

                SecurityContextHolder.getContext().setAuthentication(authToken);

                // Log temporal — puedes quitarlo una vez que funcione
                logger.info("✅ Auth seteada para: " + username + " | Roles: " + userDetails.getAuthorities());
            } else {
                // Log temporal — puedes quitarlo una vez que funcione
                logger.warn("❌ Token inválido o expirado para: " + username);
            }
        }

        filterChain.doFilter(request, response);
    }
}