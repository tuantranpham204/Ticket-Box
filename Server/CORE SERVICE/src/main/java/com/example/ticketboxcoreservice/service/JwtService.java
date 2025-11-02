package com.example.ticketboxcoreservice.service;

import com.example.ticketboxcoreservice.model.entity.OrderTicket;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
@RequiredArgsConstructor
public class JwtService {
    @Value("${app.jwt-secret}")
    private String secretKey;
    @Value("${app.jwt-expiration-milliseconds}")
    private Long jwtExpiration;
    @Value("${app.order-ticket-jwt-secret}")
    private String orderTicketSecretKey;

    public String extractUsername(String token){
        return extractClaim(token, Claims::getSubject);
    }
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver){
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }
    public String generateToken(UserDetails userDetails, Long time){
        return generateToken(new HashMap<>(),userDetails,time);
    }
    public String generateToken(Map<String, Object> extraClaims, UserDetails userDetails, Long time){
        return buildToken(extraClaims, userDetails, time);
    }
    public String generateOrderTicketToken(
            Map<String, Object> extraClaims,
            String subject,
            LocalDateTime purchaseDate,
            LocalDateTime eventEndDate) {
        Date issuedAt = Date.from(purchaseDate.toInstant(ZoneOffset.UTC));
        Date expiration = Date.from(eventEndDate.toInstant(ZoneOffset.UTC));
        return buildOrderTicketToken(extraClaims, subject, issuedAt, expiration);
    }
    private String buildOrderTicketToken(
            Map<String, Object> extraClaims,
            String subject,
            Date issuedAt,
            Date expiration) {
        return Jwts.builder()
                .setClaims(extraClaims)
                .setSubject(subject)
                .setIssuedAt(issuedAt)
                .setExpiration(expiration)
                .signWith(getOrderTicketKey(), SignatureAlgorithm.HS256)
                .compact();
    }
    public long getExpirationTime() {
        return jwtExpiration;
    }
    private String buildToken(Map<String, Object> extraClaims, UserDetails userDetails, Long jwtExpiration){
        return Jwts
                .builder()
                .setClaims(extraClaims)
                .setSubject(userDetails.getUsername())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpiration))
                .signWith(getSignInKey(), SignatureAlgorithm.HS256)
                .compact();
    }
    public boolean isTokenValid(String token, UserDetails userDetails){
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername())) && !isTokenExpired(token);
    }
    public boolean isTokenExpired(String token){
        return extractExpiration(token).before(new Date());
    }
    private Date extractExpiration(String token){
        return extractClaim(token, Claims::getExpiration);
    }
    private Claims extractAllClaims(String token){
        return Jwts
                .parserBuilder()
                .setSigningKey(getSignInKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    // --- NEW METHODS FOR ORDER TICKET TOKEN ---

    /**
     * Extracts all claims from an Order Ticket token using the orderTicketSecretKey.
     * @param token The JWT token from the QR code.
     * @return The claims principal.
     */
    public Claims extractAllClaimsFromOrderTicketToken(String token){
        return Jwts
                .parserBuilder()
                .setSigningKey(getOrderTicketKey()) // Use the correct key
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    /**
     * Extracts a specific claim from an Order Ticket token.
     * @param token The JWT token.
     * @param claimsResolver A function to resolve the desired claim.
     * @return The claim.
     */
    public <T> T extractClaimFromOrderTicketToken(String token, Function<Claims, T> claimsResolver){
        final Claims claims = extractAllClaimsFromOrderTicketToken(token);
        return claimsResolver.apply(claims);
    }

    /**
     * Checks if an Order Ticket token is expired or has an invalid signature.
     * @param token The JWT token.
     * @return True if expired or invalid, false otherwise.
     */
    public boolean isOrderTicketTokenExpired(String token){
        try {
            // This will fail if signature is invalid OR if expired
            return extractClaimFromOrderTicketToken(token, Claims::getExpiration).before(new Date());
        } catch (Exception e) {
            // Catches SignatureException, ExpiredJwtException, MalformedJwtException, etc.
            return true;
        }
    }

    // --- END OF NEW METHODS ---

    private Key getSignInKey(){
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }
    private Key getOrderTicketKey(){
        byte[] keyBytes = Decoders.BASE64.decode(orderTicketSecretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
