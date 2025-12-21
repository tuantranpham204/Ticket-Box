package com.example.ticketboxcoreservice.service;

import com.example.ticketboxcoreservice.enumf.Constants;
import com.example.ticketboxcoreservice.enumf.ErrorCode;
import com.example.ticketboxcoreservice.exception.AppException;
import com.example.ticketboxcoreservice.exception.ResourceNotFoundException;
import com.example.ticketboxcoreservice.model.dto.request.EventRequest;
import com.example.ticketboxcoreservice.model.dto.request.ImageRequest;
import com.example.ticketboxcoreservice.model.dto.request.PdfRequest;
import com.example.ticketboxcoreservice.model.dto.response.*;
import com.example.ticketboxcoreservice.model.entity.*;
import com.example.ticketboxcoreservice.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EventService {
    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    private final PdfRepository pdfRepository;
    private final CategoryRepository categoryRepository;
    private final UserService userService;
    private final PdfService pdfService;
    private final ImageService imageService;
    private final ModelMapper modelMapper;

    //get userId from session storage
    @Transactional
    public EventResponse createEvent(Long creatorUserId, EventRequest eventRequest)  {
        Event event = modelMapper.map(eventRequest, Event.class);

        User host = userRepository.findById(creatorUserId).orElseThrow(
                () -> new ResourceNotFoundException("user", "user id", creatorUserId));
        event.setHost(host);
        event.setStatus(Constants.EVENT_STATUS_PENDING);
        event.setCreateDate(LocalDateTime.now());
        event.setUpdateDate(LocalDateTime.now());
        event = eventRepository.save(event);
        Category category = categoryRepository.findById(eventRequest.getCategory().getId()).orElseThrow(
                () -> new ResourceNotFoundException("category", "category id", eventRequest.getCategory().getId())
        );
        categoryRepository.addCategoryToEvents(category.getId(), event.getId());
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
    public CustomPage<EventResponse> getEventByCategoryIdAndStatus(Long categoryId, Integer eventStatus, Pageable pageable) {
        Page<Event> events = eventRepository.findByCategoryIdAndStatus(categoryId, eventStatus, pageable);
        return CustomPage.<EventResponse>builder()
                .pageNo(events.getNumber() + 1)
                .pageSize(events.getSize())
                .totalPages(events.getTotalPages())
                .totalPages(events.getTotalPages())
                .pageContent(events.getContent().stream().map(
                        event -> modelMapper.map(event, EventResponse.class)
                ).collect(Collectors.toList()))
                .build();
    }
    @Transactional
    public CustomPage<EventResponse> getEventByCreatorUserId(Long creatorUserId, Integer status, Pageable pageable) {
        Page<Event> events = eventRepository.findByHostIdAndStatus(creatorUserId,status, pageable);
        return CustomPage.<EventResponse>builder()
                .pageNo(events.getNumber() + 1)
                .pageSize(events.getSize())
                .totalPages(events.getTotalPages())
                .pageContent(events.getContent().stream().map(
                        event -> modelMapper.map(event, EventResponse.class)
                ).collect(Collectors.toList()))
                .build();
    }
    @Transactional
    public CustomPage<EventResponse> getEventByApproverUserId(Long approverUserId, Integer eventStatus, Pageable pageable) {
        Page<Event> events = eventRepository.findByApproverIdAndStatus(approverUserId, eventStatus, pageable);
        return CustomPage.<EventResponse>builder()
                .pageNo(events.getNumber() + 1)
                .pageSize(events.getSize())
                .totalPages(events.getTotalPages())
                .pageContent(events.getContent().stream().map(
                        event -> modelMapper.map(event, EventResponse.class)
                ).collect(Collectors.toList()))
                .build();
    }
    @Transactional
    public PdfResponse getEventContractByEventId(Long eventId) {
        Pdf contract = pdfRepository.findContractByEventId(eventId).orElseThrow(
                () -> new ResourceNotFoundException("Pdf", "event id", eventId)
        );
        return modelMapper.map(contract, PdfResponse.class);
    }
    @Transactional
    public PdfDownloadResponse getDownloadableEventContractByEventId(Long eventId) {
        Pdf contract = pdfRepository.findById(eventId).orElseThrow(
                () -> new ResourceNotFoundException("event", "event id", eventId)
        );
        return pdfService.getPdfDownloadable(contract);
    }

    @Transactional
    public EventResponse updateEventMultipartFiles(Long eventId, ImageRequest img, ImageRequest banner, PdfRequest info, PdfRequest contract) {
        Event event = eventRepository.findById(eventId).orElseThrow(
                () -> new ResourceNotFoundException("event", "event id", eventId)
        );
        event.setUpdateDate(LocalDateTime.now());
        try {
            Image eventImg = event.getImg();
            Image eventBanner = event.getBanner();
            Pdf eventInfo = event.getInfo();
            Pdf eventContract = event.getContract();
            // Update Image
            if (eventImg != null) {
                event.setImg(modelMapper.map(imageService.replaceImage(eventImg, img.getImage()), Image.class));
            } else {
                event.setImg(modelMapper.map(imageService.uploadImage(img), Image.class));
            }
            // Update Banner
            if (eventBanner != null) {
                event.setBanner(modelMapper.map(imageService.replaceImage(eventBanner, banner.getImage()), Image.class));
            } else {
                event.setBanner(modelMapper.map(imageService.uploadImage(banner), Image.class));
            }
            if (eventInfo != null) {
                event.setInfo(modelMapper.map(pdfService.replacePdf(eventInfo, info.getFile()), Pdf.class));
            } else {
                event.setInfo(modelMapper.map(pdfService.uploadPdf(info), Pdf.class));
            }
            if (eventContract != null) {
                event.setContract(modelMapper.map(pdfService.replacePdf(eventContract, contract.getFile()), Pdf.class));
            } else {
                event.setContract(modelMapper.map(pdfService.uploadPdf(contract), Pdf.class));
            }
        } catch (IOException e) {
            throw new IllegalArgumentException(e.getMessage());
        }
        return modelMapper.map(eventRepository.save(event), EventResponse.class);
    }

    @Transactional
    public List<EventResponse> search(String params) {
        return eventRepository.search(params).stream()
                .map(event -> modelMapper.map(event, EventResponse.class))
                .collect(Collectors.toList());
    }

    @Transactional
    public List<EventResponse> getEventsByEventIds(List<Long> eventIds) {
        List<Event> events = eventIds.stream().map(eventId -> eventRepository.findById(eventId).orElseThrow(
                () -> new ResourceNotFoundException("event", "event id", eventId)
        )).collect(Collectors.toList());
        return events.stream().map(event -> modelMapper.map(event, EventResponse.class)).collect(Collectors.toList());
    }
    @Transactional
    public CustomPage<EventResponse> getAllEventsByStatus(Integer status, Pageable pageable) {
        Page<Event> events = eventRepository.findByStatus(status, pageable);
        return CustomPage.<EventResponse>builder()
                .pageNo(events.getNumber() + 1)
                .pageSize(events.getSize())
                .totalPages(events.getTotalPages())
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
        Category category = categoryRepository.findById(request.getCategory().getId()).orElseThrow(
                () -> new ResourceNotFoundException("category", "category id", request.getCategory().getId())
        );
        categoryRepository.addCategoryToEvents(category.getId(), event.getId());
        return event;
    }



}
