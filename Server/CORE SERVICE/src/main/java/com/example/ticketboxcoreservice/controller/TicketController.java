package com.example.ticketboxcoreservice.controller;


import com.example.ticketboxcoreservice.model.dto.request.EventRequest;
import com.example.ticketboxcoreservice.model.dto.request.TicketRequest;
import com.example.ticketboxcoreservice.model.dto.response.ApiResponse;
import com.example.ticketboxcoreservice.service.TicketService;
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
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
@Tag(name="Ticket")
public class TicketController {
    private final TicketService ticketService;

    @Operation(summary = "create ticket request by user id")
    @PostMapping("/create/{eventId}/{creatorUserId}")
    public ResponseEntity<ApiResponse> createTicket(
            @PathVariable("creatorUserId") Long creatorUserId,
            @PathVariable("eventId") Long eventId,
            @RequestBody TicketRequest ticketRequest) {
        ApiResponse response = ApiResponse.succeed(ticketService.createTicket(creatorUserId, eventId, ticketRequest));
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
    @Operation(summary = "update ticket request by user id")
    @PutMapping("/update/{eventId}/{creatorUserId}")
    public ResponseEntity<ApiResponse> updateTicket(
            @PathVariable("creatorUserId") Long creatorUserId,
            @PathVariable("eventId") Long eventId,
            @RequestBody TicketRequest ticketRequest) {
        ApiResponse response = ApiResponse.succeed(ticketService.updateTicket(creatorUserId, eventId, ticketRequest));
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @Operation(summary = "cancel ticket request by user id")
    @PutMapping("/cancel/{ticketId}/{creatorUserId}")
    public ResponseEntity<ApiResponse> cancelTicket(
            @PathVariable("creatorUserId") Long creatorUserId,
            @PathVariable("ticketId") Long ticketId) {
        ApiResponse response = ApiResponse.succeed(ticketService.cancelTicket(creatorUserId, ticketId));
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @Operation(summary = "decline ticket request by user id")
    @PutMapping("/decline/{ticketId}/{approverUserId}")
    public ResponseEntity<ApiResponse> declineTicket(
            @PathVariable("approverUserId") Long approverUserId,
            @PathVariable("ticketId") Long ticketId) {
        ApiResponse response = ApiResponse.succeed(ticketService.declineTicket(approverUserId, ticketId));
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @Operation(summary = "approve ticket request by user id")
    @PutMapping("/approve/{ticketId}/{approverUserId}")
    public ResponseEntity<ApiResponse> approveTicket(
            @PathVariable("approverUserId") Long approverUserId,
            @PathVariable("ticketId") Long ticketId) {
        ApiResponse response = ApiResponse.succeed(ticketService.approveTicket(approverUserId, ticketId));
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @Operation(summary = "get ticket by event id")
    @GetMapping("/event/{eventId}")
    public ResponseEntity<ApiResponse> getTicketByEventId(
            @PathVariable("eventId") Long eventId,
            @RequestParam(value = "pageNo", defaultValue = "1", required = false) int pageNo,
            @RequestParam(value = "pageSize", defaultValue = "10", required = false) int pageSize,
            @RequestParam(value = "sortBy", defaultValue = "eventId", required = false) String sortBy) {
        Pageable pageable = PageRequest.of(pageNo - 1, pageSize, Sort.by(sortBy).ascending());
        ApiResponse response = ApiResponse.succeed(ticketService.getTicketsByEventId(eventId, pageable));
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @Operation(summary = "get ticket by ticket id")
    @GetMapping("/ticket/{ticketId}")
    public ResponseEntity<ApiResponse> getTicketByTicketId(
            @PathVariable("ticketId") Long ticketId) {
        ApiResponse response = ApiResponse.succeed(ticketService.getTicketByTicketId(ticketId));
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

}
