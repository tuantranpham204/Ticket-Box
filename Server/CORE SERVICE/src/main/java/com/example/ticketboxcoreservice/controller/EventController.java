package com.example.ticketboxcoreservice.controller;

import com.example.ticketboxcoreservice.model.dto.request.EventMediaRequest;
import com.example.ticketboxcoreservice.model.dto.request.EventRequest;
import com.example.ticketboxcoreservice.model.dto.response.ApiResponse;
import com.example.ticketboxcoreservice.service.EventService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
@Tag(name = "Event")
public class EventController {
    private final EventService eventService;
    private final ModelMapper modelMapper;

    @Operation(summary = "create event request by user id")
    @PostMapping(path = "/create/{creatorUserId}")
    public ResponseEntity<ApiResponse> createEvent(
            @PathVariable("creatorUserId") Long creatorUserId,
            @RequestBody @Valid EventRequest eventRequest) {
        ApiResponse response = ApiResponse.succeed(eventService.createEvent(creatorUserId, eventRequest));
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @Operation(summary = "update event request by user id")
    @PutMapping(path = "/update/{eventId}/{creatorUserId}")
    public ResponseEntity<ApiResponse> updateEvent(
            @PathVariable("creatorUserId") Long creatorUserId,
            @PathVariable("eventId") Long eventId,
            @RequestBody @Valid EventRequest request) {
        ApiResponse response = ApiResponse.succeed(eventService.updateEvent(creatorUserId, eventId, request));
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @Operation(summary = "update event multipart files")
    @PutMapping(path = "/upload/{eventId}", consumes = { MediaType.MULTIPART_FORM_DATA_VALUE })
    public ResponseEntity<ApiResponse> updateEventMultipartFiles(
            @PathVariable("eventId") Long eventId,
            @ModelAttribute @Valid EventMediaRequest request) {
        ApiResponse response = ApiResponse.succeed(eventService.updateEventMultipartFiles(eventId, request));
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @Operation(summary = "cancel event request by user id")
    @PutMapping("/cancel/{eventId}/{creatorUserId}")
    public ResponseEntity<ApiResponse> cancelEvent(
            @PathVariable("creatorUserId") Long creatorUserId,
            @PathVariable("eventId") Long eventId) {
        ApiResponse response = ApiResponse.succeed(eventService.cancelEvent(creatorUserId, eventId));
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @Operation(summary = "decline event request by user id")
    @PutMapping("/decline/{eventId}/{approverUserId}")
    public ResponseEntity<ApiResponse> declineEvent(
            @PathVariable("approverUserId") Long approverUserId,
            @PathVariable("eventId") Long eventId) {
        ApiResponse response = ApiResponse.succeed(eventService.declineEvent(approverUserId, eventId));
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @Operation(summary = "update event request by user id")
    @PutMapping("/approve/{eventId}/{approverUserId}")
    public ResponseEntity<ApiResponse> approveEvent(
            @PathVariable("approverUserId") Long approverUserId,
            @PathVariable("eventId") Long eventId) {
        ApiResponse response = ApiResponse.succeed(eventService.approveEvent(approverUserId, eventId));
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @Operation(summary = "get event by event id")
    @GetMapping("/event/{eventId}")
    public ResponseEntity<ApiResponse> getEventByEventId(@PathVariable("eventId") Long eventId) {
        ApiResponse response = ApiResponse.succeed(eventService.getEventByEventId(eventId));
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @Operation(summary = "get event by category id")
    @GetMapping("/category/{catId}/{status}")
    public ResponseEntity<ApiResponse> getEventByCatIdAndStatus(
            @PathVariable("catId") Long catId,
            @PathVariable("status") Integer status,
            @RequestParam(value = "pageNo", defaultValue = "1", required = false) int pageNo,
            @RequestParam(value = "pageSize", defaultValue = "10", required = false) int pageSize,
            @RequestParam(value = "sortBy", defaultValue = "id", required = false) String sortBy) {
        Pageable pageable = PageRequest.of(pageNo - 1, pageSize, Sort.by(sortBy).ascending());
        ApiResponse response = ApiResponse.succeed(eventService.getEventByCategoryIdAndStatus(catId, status, pageable));
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @Operation(summary = "get event by creator user id and status")
    @GetMapping("/creator/{creatorUserId}/{status}")
    public ResponseEntity<ApiResponse> getEventByCreatorIdAndStatus(
            @PathVariable("creatorUserId") Long creatorUserId,
            @PathVariable("status") Integer eventStatus,
            @RequestParam(value = "pageNo", defaultValue = "1", required = false) int pageNo,
            @RequestParam(value = "pageSize", defaultValue = "10", required = false) int pageSize,
            @RequestParam(value = "sortBy", defaultValue = "id", required = false) String sortBy) {
        Pageable pageable = PageRequest.of(pageNo - 1, pageSize, Sort.by(sortBy).ascending());
        ApiResponse response = ApiResponse
                .succeed(eventService.getEventByCreatorUserId(creatorUserId, eventStatus, pageable));
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @Operation(summary = "get event by creator user id")
    @GetMapping("/approver/{approverUserId}/{status}")
    public ResponseEntity<ApiResponse> getEventByApproverIdAndStatus(
            @PathVariable("approverUserId") Long approverUserId,
            @PathVariable("status") Integer status,
            @RequestParam(value = "pageNo", defaultValue = "1", required = false) int pageNo,
            @RequestParam(value = "pageSize", defaultValue = "10", required = false) int pageSize,
            @RequestParam(value = "sortBy", defaultValue = "id", required = false) String sortBy) {
        Pageable pageable = PageRequest.of(pageNo - 1, pageSize, Sort.by(sortBy).ascending());
        ApiResponse response = ApiResponse
                .succeed(eventService.getEventByApproverUserId(approverUserId, status, pageable));
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @Operation(summary = "get event contract by event id")
    @GetMapping("/contract/{eventId}")
    public ResponseEntity<ApiResponse> getEventContractByEventId(
            @PathVariable("eventId") Long eventId) {
        ApiResponse response = ApiResponse.succeed(eventService.getEventContractByEventId(eventId));
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @Operation(summary = "get event downloadable contract by event id")
    @GetMapping("/contract-download/{eventId}")
    public ResponseEntity<ApiResponse> getEventDownloadableContractByEventId(
            @PathVariable("eventId") Long eventId) {
        ApiResponse response = ApiResponse.succeed(eventService.getDownloadableEventContractByEventId(eventId));
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @Operation(summary = "search events by relative comparation of name, org name, address")
    @GetMapping("/search/{params}")
    public ResponseEntity<ApiResponse> getEventsByRelativeName(@PathVariable("params") String params) {
        ApiResponse response = ApiResponse.succeed(eventService.search(params));
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @Operation(summary = "search events by relative comparation of name, org name, address")
    @GetMapping("/events")
    public ResponseEntity<ApiResponse> getEventsByEventIds(
            @RequestParam(value = "eventId") List<Long> eventIds) {
        ApiResponse response = ApiResponse.succeed(eventService.getEventsByEventIds(eventIds));
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @Operation(summary = "get event by status")
    @GetMapping("/{status}")
    public ResponseEntity<ApiResponse> getAllEventsByStatus(
            @PathVariable("status") Integer status,
            @RequestParam(value = "pageNo", defaultValue = "1", required = false) int pageNo,
            @RequestParam(value = "pageSize", defaultValue = "10", required = false) int pageSize,
            @RequestParam(value = "sortBy", defaultValue = "id", required = false) String sortBy) {
        Pageable pageable = PageRequest.of(pageNo - 1, pageSize, Sort.by(sortBy).ascending());
        ApiResponse response = ApiResponse.succeed(eventService.getAllEventsByStatus(status, pageable));
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

}
