package com.example.ticketboxcoreservice.service;

import com.example.ticketboxcoreservice.enumf.Constants;
import com.example.ticketboxcoreservice.enumf.ErrorCode;
import com.example.ticketboxcoreservice.exception.AppException;
import com.example.ticketboxcoreservice.exception.ResourceNotFoundException;
import com.example.ticketboxcoreservice.model.dto.request.OrderTicketRequest;
import com.example.ticketboxcoreservice.model.dto.response.MessageResponse;
import com.example.ticketboxcoreservice.model.dto.response.OrderTicketResponse;
import com.example.ticketboxcoreservice.model.entity.Order;
import com.example.ticketboxcoreservice.model.entity.OrderTicket;
import com.example.ticketboxcoreservice.repository.OrderTicketRepository;
import com.example.ticketboxcoreservice.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.time.ZoneId;
import java.time.ZoneOffset;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class OrderTicketService {
    private final OrderTicketRepository orderTicketRepository;

    private final JwtService jwtService;
    private final QrCodeService qrCodeService;
    private final OrderService orderService;
    private final ModelMapper modelMapper;
    private final TicketRepository ticketRepository;


    public OrderTicketResponse createOrderTicket(Long userId, OrderTicketRequest orderTicketRequest) {
        OrderTicket orderTicket = modelMapper.map(orderTicketRequest, OrderTicket.class);
        Order cart = orderService.getCartByUserIdFunction(userId);
        orderTicket.setOrder(cart);
        orderTicket.setTicket(ticketRepository.findById(orderTicketRequest.getTicketId()).orElseThrow(
                () -> new ResourceNotFoundException("ticket", "ticket id", orderTicketRequest.getTicketId())
        ));
        orderTicket.setStatus(Constants.ORDER_TICKET_STATUS_INACTIVE);
        orderTicket.setToken(generateOrderTicketToken(orderTicket));
        return modelMapper.map(orderTicketRepository.save(orderTicket), OrderTicketResponse.class);
    }
    public MessageResponse deleteOrderTicket(Long orderTicketId) {
        if (orderTicketRepository.getOrderTicketStatusByOrderTicketId(orderTicketId) != Constants.ORDER_TICKET_STATUS_INACTIVE) {
            throw new AppException(ErrorCode.ONLY_INACTIVE_ORDER_TICKETS_IS_UPDATABLE_AND_REMOVABLE);
        }
        if (orderTicketRepository.getOrderStatusByOrderTicketId(orderTicketId) != Constants.ORDER_STATUS_NOT_PURCHASED) {
            throw new AppException(ErrorCode.ONLY_CART_IS_UPDATABLE);
        }
        orderTicketRepository.deleteById(orderTicketId);
        return new MessageResponse("Order ticket with id " + " is deleted successfully!");
    }
    // activate order ticket when its order is purchased
    public void activatePurchasedOrderTicket(OrderTicket orderTicket) {
        orderTicket.setStatus(Constants.ORDER_TICKET_STATUS_ACTIVE);
        orderTicket.setToken(generateOrderTicketToken(orderTicket));
    }
//    public Boolean validateOrderTicketQrToken(String receivedOrderTicketToken) {
//        try {
//            jwtService.
//        } catch (Exception e) {
//
//        }
//    }

    public String generateOrderTicketToken(OrderTicket orderTicket) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("ownerName",  orderTicket.getOwnerName());
        claims.put("relationshipWithBuyer", orderTicket.getRelationship());
        String subject = orderTicket.getId().toString();
        return jwtService.generateOrderTicketToken(claims, subject,
                orderTicket.getOrder().getPurchaseDate(),
                orderTicket.getTicket().getEvent().getEndDate());
    }

}
