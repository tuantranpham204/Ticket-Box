package com.example.ticketboxcoreservice.service;

import com.example.ticketboxcoreservice.enumf.Constants;
import com.example.ticketboxcoreservice.enumf.ErrorCode;
import com.example.ticketboxcoreservice.exception.AppException;
import com.example.ticketboxcoreservice.exception.ResourceNotFoundException;
import com.example.ticketboxcoreservice.model.dto.request.TicketRequest;
import com.example.ticketboxcoreservice.model.dto.response.CustomPage;
import com.example.ticketboxcoreservice.model.dto.response.EventResponse;
import com.example.ticketboxcoreservice.model.dto.response.MessageResponse;
import com.example.ticketboxcoreservice.model.dto.response.TicketResponse;
import com.example.ticketboxcoreservice.model.entity.Event;
import com.example.ticketboxcoreservice.model.entity.Ticket;
import com.example.ticketboxcoreservice.repository.EventRepository;
import com.example.ticketboxcoreservice.repository.TicketRepository;
import com.example.ticketboxcoreservice.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TicketService {
    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    private final ModelMapper modelMapper;

    @Transactional
    public TicketResponse createTicket(Long creatorUserId, Long eventId, TicketRequest ticketRequest) {
        Ticket ticket = modelMapper.map(ticketRequest, Ticket.class);
        Event event = eventRepository.findById(eventId).orElseThrow(
                () -> new ResourceNotFoundException("event", "event id", eventId));
        if (!event.getHost().getId().equals(creatorUserId)) throw new AppException(ErrorCode.ONLY_HOST_CAN_UPDATE_EVENT);
        ticket.setEvent(event);
        ticket.setStatus(Constants.TICKET_STATUS_PENDING);
        ticket.setUpdateDate(LocalDateTime.now());
        ticket.setCreateDate(LocalDateTime.now());
        if (!ticket.validateSaleDate()) throw new AppException(ErrorCode.INVALID_TICKET_SALE_DATE);
        return modelMapper.map(ticketRepository.save(ticket), TicketResponse.class);
    }
    @Transactional
    public TicketResponse updateTicket(Long creatorUserId, Long ticketId, TicketRequest ticketRequest) {
        Ticket ticket = ticketRepository.findById(ticketId).orElseThrow(
                () -> new ResourceNotFoundException("event", "event id", ticketId));
        if (!ticket.getEvent().getHost().getId().equals(creatorUserId)) throw new AppException(ErrorCode.ONLY_HOST_CAN_UPDATE_TICKET);
        if (!ticket.getEvent().getStatus().equals(Constants.TICKET_STATUS_PENDING)) throw new AppException(ErrorCode.ONLY_PENDING_TICKET_IS_UPDATABLE);
        mapNotNullValuesFromTicketReq(ticketRequest, ticket);
        ticket.setUpdateDate(LocalDateTime.now());
        if (!ticket.validateSaleDate()) throw new AppException(ErrorCode.INVALID_TICKET_SALE_DATE);
        return  modelMapper.map(ticketRepository.save(ticket), TicketResponse.class);
    }
    @Transactional
    public MessageResponse approveTicket(Long approverUserId, Long ticketId) {
        Ticket ticket = ticketRepository.findById(ticketId).orElseThrow(
                () -> new ResourceNotFoundException("event", "event id", ticketId));
        if (!ticket.getEvent().getApprover().getId().equals(approverUserId)) throw new AppException(ErrorCode.ONLY_APPROVERS_OF_EVENTS_CAN_APPROVE_THEIR_TICKETS);
        if (!ticket.validateSaleDate()) throw new AppException(ErrorCode.INVALID_TICKET_SALE_DATE);
        ticket.approve();
        return new MessageResponse("Ticket with id " + ticketId + " has been approved");
    }
    @Transactional
    public MessageResponse cancelTicket(Long creatorUserId, Long ticketId) {
        Ticket ticket = ticketRepository.findById(ticketId).orElseThrow(
                () -> new ResourceNotFoundException("event", "event id", ticketId));
        if (!ticket.getEvent().getHost().getId().equals(creatorUserId)) throw new AppException(ErrorCode.ONLY_HOST_CAN_UPDATE_TICKET);
        ticket.cancel();
        ticketRepository.save(ticket);
        return new MessageResponse("Ticket with id " + ticketId + " has been canceled");
    }
    @Transactional
    public MessageResponse declineTicket(Long approverUserId, Long ticketId) {
        Ticket ticket = ticketRepository.findById(ticketId).orElseThrow(
                () -> new ResourceNotFoundException("event", "event id", ticketId));
        if (!ticket.getEvent().getApprover().getId().equals(approverUserId)) throw new AppException(ErrorCode.ONLY_APPROVERS_OF_EVENTS_CAN_APPROVE_THEIR_TICKETS);
        ticket.decline();
        return new MessageResponse("Ticket with id " + ticketId + " has been declined");
    }
    @Transactional
    public TicketResponse getTicketByUserId(Long ticketId) {
        Ticket ticket = ticketRepository.findById(ticketId).orElseThrow(
                () -> new ResourceNotFoundException("event", "event id", ticketId));
        return modelMapper.map(ticket, TicketResponse.class);
    }
    @Transactional
    public CustomPage<TicketResponse> getTicketsByEventId(Long eventId, Pageable pageable) {
        Page<Ticket> tickets = ticketRepository.findByEventId(eventId, pageable);
        return CustomPage.<TicketResponse>builder()
                .pageNo(tickets.getNumber()+1)
                .pageSize(tickets.getSize())
                .pageContent(tickets.getContent().stream().map(
                        ticket -> modelMapper.map(ticket, TicketResponse.class)
                ).collect(Collectors.toList())).build();
    }

    private Ticket mapNotNullValuesFromTicketReq(TicketRequest request, Ticket ticket) {
        // --- Map simple fields using Optional for a clean, null-safe check ---
        Optional.ofNullable(request.getType()).ifPresent(ticket::setType);
        Optional.ofNullable(request.getUnitPrice()).ifPresent(ticket::setUnitPrice);
        Optional.ofNullable(request.getCapacity()).ifPresent(ticket::setCapacity);
        Optional.ofNullable(request.getStartSale()).ifPresent(ticket::setStartSale);
        Optional.ofNullable(request.getEndSale()).ifPresent(ticket::setEndSale);

        return ticket;
    }
}











