package com.example.ticketboxcoreservice.model.dto.request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegisterRequest {
    private String username;
    private String fullName;
    private String email;
    private String password;
    private String confirmPassword;
}
