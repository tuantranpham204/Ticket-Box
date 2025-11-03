package com.example.ticketboxcoreservice.controller;


import com.example.ticketboxcoreservice.model.dto.request.OrderTicketQRCode;
import com.example.ticketboxcoreservice.model.dto.request.OrderTicketRequest;
import com.example.ticketboxcoreservice.model.dto.response.ApiResponse;
import com.example.ticketboxcoreservice.model.entity.OrderTicket;
import com.example.ticketboxcoreservice.service.OrderTicketService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/order-tickets")
@RequiredArgsConstructor
@Tag(name="Order Ticket")
public class OrderTicketController {
    private final OrderTicketService orderTicketService;

    @Operation(summary = "create order ticket by user id")
    @PostMapping("/create/{userId}")
    public ResponseEntity<ApiResponse> createOrderTicket(
            @PathVariable Long userId,
            @RequestBody OrderTicketRequest orderTicketRequest) {
        ApiResponse response = ApiResponse.succeed(orderTicketService.createOrderTicket(userId, orderTicketRequest));
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @Operation(summary = "create order ticket by user id")
    @DeleteMapping("/delete/{orderTicketId}")
    public ResponseEntity<ApiResponse> deleteOrderTicket(
            @PathVariable Long orderTicketId) {
        ApiResponse response = ApiResponse.succeed(orderTicketService.deleteOrderTicket(orderTicketId));
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @Operation(summary = "validate order ticket")
    @PutMapping(path="/validate", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse> validateOrderTicket(
            @RequestPart("qrCode") @Valid MultipartFile qrCode) {
        OrderTicketQRCode orderTicketQRCode = new OrderTicketQRCode(qrCode);
        ApiResponse response = ApiResponse.succeed(orderTicketService.validateOrderTicketQRCode(orderTicketQRCode));
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @Operation(summary = "validate order ticket by user id")
    @PutMapping("/confirm")
    public ResponseEntity<ApiResponse> validateOrderTicket(
            @RequestBody OrderTicket orderTicket) {
        ApiResponse response = ApiResponse.succeed(orderTicketService.confirmOrder(orderTicket));
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @Operation(summary = "get cart tickets by user id")
    @GetMapping("/cart/{userId}")
    public ResponseEntity<ApiResponse> getCartTicketsByUserId(
            @PathVariable("userId") Long userId,
            @RequestParam(value = "pageNo", defaultValue = "1", required = false) int pageNo,
            @RequestParam(value = "pageSize", defaultValue = "10", required = false) int pageSize,
            @RequestParam(value = "sortBy", defaultValue = "orderTicketId", required = false) String sortBy
    ) {
        Pageable pageable = PageRequest.of(pageNo - 1, pageSize, Sort.by(sortBy).ascending());
        ApiResponse response = ApiResponse.succeed(orderTicketService.getCartTicketsByUserId(userId, pageable));
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
    @Operation(summary = "get order tickets by order id")
    @GetMapping("/order/{orderId}")
    public ResponseEntity<ApiResponse> getOrderTicketsByOrderId(
            @PathVariable("orderId") Long orderId,
            @RequestParam(value = "pageNo", defaultValue = "1", required = false) int pageNo,
            @RequestParam(value = "pageSize", defaultValue = "10", required = false) int pageSize,
            @RequestParam(value = "sortBy", defaultValue = "orderTicketId", required = false) String sortBy
    ) {
        Pageable pageable = PageRequest.of(pageNo - 1, pageSize, Sort.by(sortBy).ascending());
        ApiResponse response = ApiResponse.succeed(orderTicketService.getOrderTicketsByOrderId(orderId, pageable));
        return new ResponseEntity<>(response, HttpStatus.OK);
    }


    
    


}
