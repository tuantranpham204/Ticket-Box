package com.example.ticketboxcoreservice.model.dto.response;

import lombok.*;

import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {
    private Long id;
    private String username;
    private String email;
    private String fullName;
    private Set<RoleResponse> roles;
    private ImageResponse avatar;
}
