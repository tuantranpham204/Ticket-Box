package com.example.ticketboxcoreservice.model.dto.response;

import lombok.*;

import java.sql.Timestamp;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class JwtAuthResponse {
    @Builder.Default
    private String tokenType="Bearer";
    private String accessToken;
    private String refreshToken;
    private UserResponse user;
    private Timestamp expiredTime;
}
