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
    private String buildToken(Map<String, Object> extraClaims, String subject, Long jwtExpiration){
        return Jwts
                .builder()
                .setClaims(extraClaims)
                .setSubject(subject)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpiration))
                .signWith(getSignInKey(), SignatureAlgorithm.HS256)
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
    private Key getSignInKey(){
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }
    private Key getOrderTicketKey(){
        byte[] keyBytes = Decoders.BASE64.decode(orderTicketSecretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
