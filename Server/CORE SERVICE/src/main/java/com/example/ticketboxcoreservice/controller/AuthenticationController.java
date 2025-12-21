package com.example.ticketboxcoreservice.controller;

import com.example.ticketboxcoreservice.model.dto.request.LoginRequest;
import com.example.ticketboxcoreservice.model.dto.request.RegisterRequest;
import com.example.ticketboxcoreservice.model.dto.response.ApiResponse;
import com.example.ticketboxcoreservice.model.dto.response.JwtAuthResponse;
import com.example.ticketboxcoreservice.model.dto.response.UserResponse;
import com.example.ticketboxcoreservice.service.AuthenticationService;
import com.example.ticketboxcoreservice.service.JwtService;
import com.example.ticketboxcoreservice.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Authentication API")
public class AuthenticationController {
    private final AuthenticationService authenticationService;

    @Operation(summary = "Refresh Token", description = "Refresh access token API")
    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse> refreshToken(HttpServletRequest request) {
        final String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return new ResponseEntity<>(ApiResponse.error(401, "Refresh token is missing or invalid"), HttpStatus.UNAUTHORIZED);
        }
        final String refreshToken = authHeader.substring(7);
        ApiResponse response = ApiResponse.succeed(authenticationService.refreshToken(refreshToken));
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
    @Operation(summary = "Login", description = "Login API")
    @PostMapping("/login")
    public ResponseEntity<ApiResponse> login(@RequestBody @Valid LoginRequest request){
        ApiResponse response = ApiResponse.succeed(authenticationService.login(request));
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
    @Operation(summary = "Register", description = "Register API")
    @PostMapping("/register")
    public ResponseEntity<ApiResponse> register(@RequestBody @Valid RegisterRequest request){
        ApiResponse response = ApiResponse.succeed(authenticationService.register(request));
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

}
