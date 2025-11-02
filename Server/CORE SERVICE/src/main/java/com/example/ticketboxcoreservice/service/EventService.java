package com.example.ticketboxcoreservice.service;

import com.example.ticketboxcoreservice.enumf.Constants;
import com.example.ticketboxcoreservice.enumf.ErrorCode;
import com.example.ticketboxcoreservice.exception.AppException;
import com.example.ticketboxcoreservice.exception.ResourceNotFoundException;
import com.example.ticketboxcoreservice.model.dto.request.EventRequest;
import com.example.ticketboxcoreservice.model.dto.response.CustomPage;
import com.example.ticketboxcoreservice.model.dto.response.EventResponse;
import com.example.ticketboxcoreservice.model.dto.response.MessageResponse;
import com.example.ticketboxcoreservice.model.entity.Event;
import com.example.ticketboxcoreservice.model.entity.Image;
import com.example.ticketboxcoreservice.model.entity.User;
import com.example.ticketboxcoreservice.repository.EventRepository;
import com.example.ticketboxcoreservice.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EventService {
    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    private final UserService userService;
    private final ImageService imageService;
    private final ModelMapper modelMapper;

    //get userId from session storage
    @Transactional
    public EventResponse createEvent(Long creatorUserId, EventRequest eventRequest)  {
        Event event = mapNotNullValuesFromEventReq(eventRequest, new Event());
        User host = userRepository.findById(creatorUserId).orElseThrow(
                () -> new ResourceNotFoundException("user", "user id", creatorUserId));
        event.setHost(host);
        event.setStatus(Constants.EVENT_STATUS_PENDING);
        event.setCreateDate(LocalDateTime.now());
        event.setUpdateDate(LocalDateTime.now());
        return modelMapper.map(eventRepository.save(event), EventResponse.class);
    }
    @Transactional
    public MessageResponse approveEvent(Long approverUserId, Long eventId) {
        User approver = userRepository.findById(approverUserId).orElseThrow(
                () -> new ResourceNotFoundException("user", "user id", approverUserId));
        if (!userService.isApproverByUser(approver)) throw new AppException(ErrorCode.NON_APPROVERS_CANNOT_APPROVE_OR_DECLINE_EVENTS);
        Event event = eventRepository.findById(eventId).orElseThrow(
                () -> new ResourceNotFoundException("event", "event id", eventId));
        event.setApprover(approver);
        event.approve();
        eventRepository.save(event);
        return MessageResponse.builder().message("Event with id " + eventId + " has been approved successfully by approver with id " + approverUserId).build();
    }
    @Transactional
    public EventResponse updateEvent(Long creatorUserId, Long eventId, EventRequest eventRequest) {
        Event event = eventRepository.findById(eventId).orElseThrow(
                () -> new ResourceNotFoundException("event", "event id", eventId));
        if (!event.getHost().getId().equals(creatorUserId)) throw new AppException(ErrorCode.ONLY_HOST_CAN_UPDATE_EVENT);
        if (!event.getStatus().equals(Constants.EVENT_STATUS_PENDING)) throw new AppException(ErrorCode.ONLY_PENDING_EVENT_IS_UPDATABLE);
        event = mapNotNullValuesFromEventReq(eventRequest, event);
        event.setUpdateDate(LocalDateTime.now());
        return modelMapper.map(eventRepository.save(event), EventResponse.class);
    }
    @Transactional
    public MessageResponse cancelEvent(Long creatorUserId, Long eventId) {
        Event event = eventRepository.findById(eventId).orElseThrow(
                () -> new ResourceNotFoundException("event", "event id", eventId));
        if (!event.getHost().getId().equals(creatorUserId)) throw new AppException(ErrorCode.ONLY_HOST_CAN_UPDATE_EVENT);
        if (!event.getStatus().equals(Constants.EVENT_STATUS_PENDING)) throw new AppException(ErrorCode.ONLY_PENDING_EVENT_IS_UPDATABLE);
        event.cancel();
        eventRepository.save(event);
        return MessageResponse.builder().message("Event with id " + eventId + " has been cancelled successfully by user with id " + creatorUserId).build();
    }
    @Transactional
    public MessageResponse declineEvent(Long approverUserId, Long eventId) {
        User approver = userRepository.findById(approverUserId).orElseThrow(
                () -> new ResourceNotFoundException("user", "user id", approverUserId));
        if (!userService.isApproverByUser(approver)) throw new AppException(ErrorCode.NON_APPROVERS_CANNOT_APPROVE_OR_DECLINE_EVENTS);
        Event event = eventRepository.findById(eventId).orElseThrow(
                () -> new ResourceNotFoundException("event", "event id", eventId));
        event.setApprover(approver);
        event.decline();
        return MessageResponse.builder().message("Event with id " + eventId + " has been declined successfully by approver with id " + approverUserId).build();
    }
    @Transactional
    public EventResponse getEventByEventId(Long eventId) {
        Event event = eventRepository.findById(eventId).orElseThrow(
                () -> new ResourceNotFoundException("event", "event id", eventId));
        return modelMapper.map(event, EventResponse.class);
    }
    @Transactional
    public CustomPage<EventResponse> getEventByCategoryId(Long categoryId, Pageable pageable) {
        Page<Event> events = eventRepository.findByCategoryId(categoryId, pageable);
        return CustomPage.<EventResponse>builder()
                .pageNo(events.getNumber() + 1)
                .pageSize(events.getSize())
                .pageContent(events.getContent().stream().map(
                        event -> modelMapper.map(event, EventResponse.class)
                ).collect(Collectors.toList()))
                .build();
    }
    @Transactional
    public CustomPage<EventResponse> getEventByCreatorUserId(Long creatorUserId, Pageable pageable) {
        Page<Event> events = eventRepository.findByHostId(creatorUserId, pageable);
        return CustomPage.<EventResponse>builder()
                .pageNo(events.getNumber() + 1)
                .pageSize(events.getSize())
                .pageContent(events.getContent().stream().map(
                        event -> modelMapper.map(event, EventResponse.class)
                ).collect(Collectors.toList()))
                .build();
    }
    @Transactional
    public CustomPage<EventResponse> getEventByApproverUserId(Long approverUserId, Pageable pageable) {
        Page<Event> events = eventRepository.findByHostId(approverUserId, pageable);
        return CustomPage.<EventResponse>builder()
                .pageNo(events.getNumber() + 1)
                .pageSize(events.getSize())
                .pageContent(events.getContent().stream().map(
                        event -> modelMapper.map(event, EventResponse.class)
                ).collect(Collectors.toList()))
                .build();
    }



    private Event mapNotNullValuesFromEventReq(EventRequest request, Event event) {
        // == Simple Primitive/String Fields ==
        Optional.ofNullable(request.getName()).ifPresent(event::setName);
        Optional.ofNullable(request.getOnline()).ifPresent(event::setOnline);
        Optional.ofNullable(request.getAddress()).ifPresent(event::setAddress);
        Optional.ofNullable(request.getOrgName()).ifPresent(event::setOrgName);
        Optional.ofNullable(request.getOrgInfo()).ifPresent(event::setOrgInfo);
        Optional.ofNullable(request.getStartDate()).ifPresent(event::setStartDate);
        Optional.ofNullable(request.getEndDate()).ifPresent(event::setEndDate);
        Optional.ofNullable(request.getInfo()).ifPresent(event::setInfo);

        try {
            // Update Image
            if (request.getImg() != null) {
                event.setImg(modelMapper.map(imageService.uploadImage(request.getImg()), Image.class));
            }
            // Update Banner
            if (request.getBanner() != null) {
                event.setBanner(modelMapper.map(imageService.uploadImage(request.getBanner()), Image.class));
            }
        } catch (IOException e) {

            //
        }

        return event;
    }

}
