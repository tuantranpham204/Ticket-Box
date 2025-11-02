package com.example.ticketboxcoreservice.controller;


import com.example.ticketboxcoreservice.model.dto.request.EventRequest;
import com.example.ticketboxcoreservice.model.dto.response.ApiResponse;
import com.example.ticketboxcoreservice.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Tag(name="Order")
public class OrderController {
    private final OrderService orderService;

    @Operation(summary = "purchase cart by user id")
    @PutMapping("/purchase/{userId}")
    public ResponseEntity<ApiResponse> purchaseCart(
            @PathVariable("userId") Long userId
            ) {
        ApiResponse response = ApiResponse.succeed(orderService.purchaseCartByUserId(userId));
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
    @Operation(summary = "get cart by user id")
    @GetMapping("/cart/{userId}")
    public ResponseEntity<ApiResponse> getCartByUserId(
            @PathVariable("userId") Long userId
    ) {
        ApiResponse response = ApiResponse.succeed(orderService.getCartByUserId(userId));
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @Operation(summary = "purchase cart by user id")
    @GetMapping("/history/{userId}")
    public ResponseEntity<ApiResponse> getOrderHistoryByUserId(
            @PathVariable("userId") Long userId,
            @RequestParam(value = "pageNo", defaultValue = "1", required = false) int pageNo,
            @RequestParam(value = "pageSize", defaultValue = "10", required = false) int pageSize,
            @RequestParam(value = "sortBy", defaultValue = "eventId", required = false) String sortBy
    ) {
        Pageable pageable = PageRequest.of(pageNo - 1, pageSize, Sort.by(sortBy).ascending());
        ApiResponse response = ApiResponse.succeed(orderService.getOrderHistoryByUserId(userId, pageable));
        return new ResponseEntity<>(response, HttpStatus.OK);
    }



}
