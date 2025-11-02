package com.example.ticketboxcoreservice.service;

import com.example.ticketboxcoreservice.enumf.Constants;
import com.example.ticketboxcoreservice.enumf.ErrorCode;
import com.example.ticketboxcoreservice.exception.AppException;
import com.example.ticketboxcoreservice.exception.ResourceNotFoundException;
import com.example.ticketboxcoreservice.model.dto.request.OrderTicketQRCode;
import com.example.ticketboxcoreservice.model.dto.request.OrderTicketRequest;
import com.example.ticketboxcoreservice.model.dto.response.MessageResponse;
import com.example.ticketboxcoreservice.model.dto.response.OrderTicketResponse;
import com.example.ticketboxcoreservice.model.entity.Order;
import com.example.ticketboxcoreservice.model.entity.OrderTicket;
import com.example.ticketboxcoreservice.repository.OrderRepository;
import com.example.ticketboxcoreservice.repository.OrderTicketRepository;
import com.example.ticketboxcoreservice.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class OrderTicketService {
    private final OrderTicketRepository orderTicketRepository;

    private final JwtService jwtService;
    private final OrderRepository orderRepository;
    private final QrCodeService qrCodeService;
    private final ModelMapper modelMapper;
    private final TicketRepository ticketRepository;


    public OrderTicketResponse createOrderTicket(Long userId, OrderTicketRequest orderTicketRequest) {
        OrderTicket orderTicket = modelMapper.map(orderTicketRequest, OrderTicket.class);
        Order cart = getCartByUserIdFunction(userId);
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
        return new MessageResponse("Order ticket with id " + orderTicketId + " is deleted successfully!");
    }
    // activate order ticket when its order is purchased
    public void activatePurchasedOrderTicket(OrderTicket orderTicket) {
        orderTicket.setStatus(Constants.ORDER_TICKET_STATUS_ACTIVE);
        orderTicket.setToken(generateOrderTicketToken(orderTicket));
    }
    // /api/order-ticket/qr/
    public OrderTicket validateOrderTicketQRCode(OrderTicketQRCode orderTicketQRCode) {
        try {
            String token = qrCodeService.decodeQrCode(orderTicketQRCode.getQrCode());
            if (jwtService.isOrderTicketTokenExpired(token)) {
                throw new AppException(ErrorCode.ORDER_TICKET_EXPIRED);
            }
            OrderTicket scannedOrderTicket  = jwtService.extractClaimFromOrderTicketToken(token,
                    claims -> claims.get("orderTicket", OrderTicket.class)
            );
            OrderTicket orderTicket = orderTicketRepository.findById(scannedOrderTicket.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("orderTicket", "orderTicketId", scannedOrderTicket.getId()));
            if (!Objects.equals(orderTicket.getStatus(), Constants.ORDER_TICKET_STATUS_ACTIVE)) {
                throw new AppException(ErrorCode.ORDER_TICKET_USED);
            }
            if (!orderTicket.equals(scannedOrderTicket)) {
                throw new AppException(ErrorCode.ORDER_TICKET_UNMATCHED);
            }
            orderTicket.setStatus(Constants.ORDER_TICKET_STATUS_PENDING);
            return orderTicketRepository.save(orderTicket);
        } catch (Exception e) {
            throw new AppException(ErrorCode.INTERNAL_ERROR);
        }

    }

    public MessageResponse confirmOrder(OrderTicket orderTicket) {
        orderTicket.setStatus(Constants.ORDER_TICKET_STATUS_USED);
        orderTicketRepository.save(orderTicket);
        return new MessageResponse("Order ticket with id " + orderTicket.getId() + " is confirmed!");
    }

    private String generateOrderTicketToken(OrderTicket orderTicket) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("orderTicket", orderTicket);
        String subject = orderTicket.getId().toString();
        return jwtService.generateOrderTicketToken(claims, subject,
                orderTicket.getOrder().getPurchaseDate(),
                orderTicket.getTicket().getEvent().getEndDate());
    }

    private Order getCartByUserIdFunction(Long userId) {
        List<Order> orders = orderRepository.findOrderByUserIdAndPurchasedAsList(userId, Constants.ORDER_STATUS_NOT_PURCHASED);
        if (orders.size() != 1) throw new AppException(ErrorCode.INVALID_NUMBER_OF_CARTS);
        return orders.get(0);
    }

}
