package com.example.ticketboxcoreservice.controller;

import com.example.ticketboxcoreservice.model.dto.request.LoginRequest;
import com.example.ticketboxcoreservice.model.dto.request.RegisterRequest;
import com.example.ticketboxcoreservice.model.dto.response.JwtAuthResponse;
import com.example.ticketboxcoreservice.model.dto.response.UserResponse;
import com.example.ticketboxcoreservice.service.AuthenticationService;
import com.example.ticketboxcoreservice.service.JwtService;
import com.example.ticketboxcoreservice.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
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
    //private final OrderService orderService;
    private final UserService userService;
    private final JwtService jwtService;

    @Operation(summary = "Login", description = "Login API")
    @PostMapping("/login")
    public ResponseEntity<JwtAuthResponse> login(@RequestBody @Valid LoginRequest request){
        JwtAuthResponse authenticationUser =  authenticationService.login(request);
        return ResponseEntity.ok(authenticationUser);
    }

    @Operation(summary = "Register", description = "Register API")
    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@RequestBody @Valid RegisterRequest request){
        UserResponse response = authenticationService.register(request);

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }
}
