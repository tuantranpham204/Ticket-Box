package com.example.ticketboxcoreservice.controller;


import com.example.ticketboxcoreservice.model.dto.request.EventRequest;
import com.example.ticketboxcoreservice.model.dto.request.ImageRequest;
import com.example.ticketboxcoreservice.model.dto.response.ApiResponse;
import com.example.ticketboxcoreservice.model.dto.response.EventResponse;
import com.example.ticketboxcoreservice.service.EventService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.parameters.P;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
@Tag(name="Event")
public class EventController {
    private final EventService eventService;

    @Operation(summary = "create event request by user id")
    @PostMapping("/create/{creatorUserId}")
    public ResponseEntity<ApiResponse> createEvent(
            @PathVariable("creatorUserId") Long creatorUserId,
            @RequestBody EventRequest eventRequest,
            @RequestPart("img") MultipartFile img,
            @RequestPart("banner") MultipartFile banner) {
        ImageRequest imgReq = new ImageRequest(img);
        ImageRequest bannerReq = new ImageRequest(banner);
        eventRequest.setImg(imgReq); eventRequest.setBanner(bannerReq);
        ApiResponse response = ApiResponse.succeed(eventService.createEvent(creatorUserId, eventRequest));
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @Operation(summary = "update event request by user id")
    @PutMapping("/update/{eventId}/{creatorUserId}")
    public ResponseEntity<ApiResponse> updateEvent(
            @PathVariable("creatorUserId") Long creatorUserId,
            @PathVariable("eventId") Long eventId,
            @RequestBody EventRequest eventRequest,
            @RequestPart("img") MultipartFile img,
            @RequestPart("banner") MultipartFile banner) {
        ImageRequest imgReq = new ImageRequest(img);
        ImageRequest bannerReq = new ImageRequest(banner);
        eventRequest.setImg(imgReq); eventRequest.setBanner(bannerReq);
        ApiResponse response = ApiResponse.succeed(eventService.updateEvent(creatorUserId, eventId,eventRequest));
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
            @PathVariable("eventId") Long eventId){
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
    public ResponseEntity<ApiResponse> getEventByEventId( @PathVariable("eventId") Long eventId) {
        ApiResponse response = ApiResponse.succeed(eventService.getEventByEventId(eventId));
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @Operation(summary = "get event by category id")
    @GetMapping("/category/{catId}")
    public ResponseEntity<ApiResponse> getEventByCatId(
            @PathVariable("catId") Long catId,
            @RequestParam(value = "pageNo", defaultValue = "1", required = false) int pageNo,
            @RequestParam(value = "pageSize", defaultValue = "10", required = false) int pageSize,
            @RequestParam(value = "sortBy", defaultValue = "eventId", required = false) String sortBy) {
        Pageable pageable = PageRequest.of(pageNo - 1, pageSize, Sort.by(sortBy).ascending());
        ApiResponse response = ApiResponse.succeed(eventService.getEventByCategoryId(catId, pageable));
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @Operation(summary = "get event by creator user id")
    @GetMapping("/creator/{creatorUserId}")
    public ResponseEntity<ApiResponse> getEventByCreatorId(
            @PathVariable("creatorUserId") Long creatorUserId,
            @RequestParam(value = "pageNo", defaultValue = "1", required = false) int pageNo,
            @RequestParam(value = "pageSize", defaultValue = "10", required = false) int pageSize,
            @RequestParam(value = "sortBy", defaultValue = "eventId", required = false) String sortBy) {
        Pageable pageable = PageRequest.of(pageNo - 1, pageSize, Sort.by(sortBy).ascending());
        ApiResponse response = ApiResponse.succeed(eventService.getEventByCreatorUserId(creatorUserId, pageable));
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @Operation(summary = "get event by creator user id")
    @GetMapping("/approver/{approverUserId}")
    public ResponseEntity<ApiResponse> getEventByApproverId(
            @PathVariable("approverUserId") Long approverUserId,
            @RequestParam(value = "pageNo", defaultValue = "1", required = false) int pageNo,
            @RequestParam(value = "pageSize", defaultValue = "10", required = false) int pageSize,
            @RequestParam(value = "sortBy", defaultValue = "eventId", required = false) String sortBy) {
        Pageable pageable = PageRequest.of(pageNo - 1, pageSize, Sort.by(sortBy).ascending());
        ApiResponse response = ApiResponse.succeed(eventService.getEventByApproverUserId(approverUserId, pageable));
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
}
