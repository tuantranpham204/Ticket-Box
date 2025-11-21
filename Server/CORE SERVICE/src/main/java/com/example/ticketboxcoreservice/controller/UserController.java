package com.example.ticketboxcoreservice.controller;


import com.example.ticketboxcoreservice.model.dto.request.ImageRequest;
import com.example.ticketboxcoreservice.model.dto.request.TicketRequest;
import com.example.ticketboxcoreservice.model.dto.request.UserRequest;
import com.example.ticketboxcoreservice.model.dto.response.ApiResponse;
import com.example.ticketboxcoreservice.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name="User")
public class UserController {
    private final UserService userService;

    @Operation(summary = "get user by user id")
    @GetMapping("/get/{userId}")
    public ResponseEntity<ApiResponse> getUserById(
            @PathVariable("userId") Long userId
            ) {
        ApiResponse response = ApiResponse.succeed(userService.getUserById(userId));
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @Operation(summary = "update user to approver")
    @PutMapping("/to-approver/{userId}")
    public ResponseEntity<ApiResponse> toApprover(
            @PathVariable("userId") Long userId
            ) {
        ApiResponse response = ApiResponse.succeed(userService.updateUserToApprover(userId));
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @Operation(summary = "get all user to")
    @GetMapping("/all")
    public ResponseEntity<ApiResponse> all(
            @RequestParam(value = "pageNo", defaultValue = "1", required = false) int pageNo,
            @RequestParam(value = "pageSize", defaultValue = "10", required = false) int pageSize,
            @RequestParam(value = "sortBy", defaultValue = "username", required = false) String sortBy) {
        Pageable pageable = PageRequest.of(pageNo - 1, pageSize, Sort.by(sortBy).ascending());
        ApiResponse response = ApiResponse.succeed(userService.getAllUser(pageable));
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @Operation(summary = "update user by user id")
    @PutMapping("/update/{userId}")
    public ResponseEntity<ApiResponse> updateUser(
            @PathVariable("userId") Long userId,
            @RequestBody @Valid UserRequest userRequest
    ) {
        ApiResponse response = ApiResponse.succeed(userService.updateUser(userId, userRequest));
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
    @Operation(summary = "update user avatar")
    @PutMapping("/avatar/{userId}")
    public ResponseEntity<ApiResponse> updateUserAvatar(
            @PathVariable("userId") Long userId,
            @RequestBody @Valid ImageRequest request) {
        ApiResponse response = ApiResponse.succeed(userService.updateAvatarByUserId(userId, request));
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
}
