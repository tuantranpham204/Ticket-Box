package com.example.ticketboxcoreservice.service;

import com.example.ticketboxcoreservice.enumf.Constants;
import com.example.ticketboxcoreservice.enumf.ErrorCode;
import com.example.ticketboxcoreservice.exception.AppException;
import com.example.ticketboxcoreservice.exception.ResourceNotFoundException;
import com.example.ticketboxcoreservice.model.dto.request.OrderTicketQRCode;
import com.example.ticketboxcoreservice.model.dto.request.OrderTicketRequest;
import com.example.ticketboxcoreservice.model.dto.response.CustomPage;
import com.example.ticketboxcoreservice.model.dto.response.MessageResponse;
import com.example.ticketboxcoreservice.model.dto.response.OrderTicketResponse;
import com.example.ticketboxcoreservice.model.dto.response.OrderTicketToken;
import com.example.ticketboxcoreservice.model.entity.Order;
import com.example.ticketboxcoreservice.model.entity.OrderTicket;
import com.example.ticketboxcoreservice.repository.OrderRepository;
import com.example.ticketboxcoreservice.repository.OrderTicketRepository;
import com.example.ticketboxcoreservice.repository.RelationshipRepository;
import com.example.ticketboxcoreservice.repository.TicketRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderTicketService {
    private final OrderTicketRepository orderTicketRepository;

    private final JwtService jwtService;
    private final OrderRepository orderRepository;
    private final QrCodeService qrCodeService;
    private final ModelMapper modelMapper;
    private final TicketRepository ticketRepository;
    private final RelationshipRepository relationshipRepository;

    @Transactional
    public OrderTicketResponse createOrderTicket(Long userId, OrderTicketRequest orderTicketRequest) {
        OrderTicket orderTicket = modelMapper.map(orderTicketRequest, OrderTicket.class);
        Order cart = getCartByUserIdFunction(userId);
        orderTicket.setOrder(cart);
        orderTicket.setTicket(
                ticketRepository.findById(orderTicketRequest.getTicketId()).orElseThrow(
                        () -> new ResourceNotFoundException("ticket", "ticket id", orderTicketRequest.getTicketId())));
        orderTicket.validateSubQuantity();
        orderTicket.setStatus(com.example.ticketboxcoreservice.enumf.Constants.ORDER_TICKET_STATUS_INACTIVE);
        orderTicket.setRelationship(
                relationshipRepository.findById(orderTicketRequest.getRelationshipId()).orElseThrow(
                        () -> new ResourceNotFoundException("relationship", "relationship id",
                                orderTicketRequest.getRelationshipId())));
        return modelMapper.map(orderTicketRepository.save(orderTicket), OrderTicketResponse.class);
    }

    @Transactional
    public OrderTicketResponse updateOrderTicket(Long userId, Long orderTicketId,
            OrderTicketRequest orderTicketRequest) {
        Order cart = getCartByUserIdFunction(userId);
        boolean isOrderTicketInCart = false;
        for (OrderTicket orderTicket : cart.getOrderTickets()) {
            if (orderTicketId.equals(orderTicket.getId()))
                isOrderTicketInCart = true;
        }
        if (!isOrderTicketInCart) {
            throw new AppException(ErrorCode.ORDER_TICKET_NOT_INSIDE_CART);
        }
        OrderTicket orderTicket = orderTicketRepository.findById(orderTicketId).orElseThrow(
                () -> new ResourceNotFoundException("ticket", "ticket id", orderTicketId));
        if (!orderTicket.getStatus().equals(Constants.ORDER_TICKET_STATUS_INACTIVE)) {
            throw new AppException(ErrorCode.ONLY_INACTIVE_ORDER_TICKETS_IS_UPDATABLE_AND_REMOVABLE);
        }
        updateOrderTotals(cart, orderTicket, orderTicketRequest.getSubQuantity());
        orderTicket.setSubQuantity(orderTicketRequest.getSubQuantity());
        orderTicket.validateSubQuantity();
        if (!Objects.equals(orderTicket.getRelationship().getId(), orderTicketRequest.getRelationshipId()))
            orderTicket.setRelationship(
                    relationshipRepository.findById(orderTicketRequest.getRelationshipId()).orElseThrow(
                            () -> new ResourceNotFoundException("relationship", "relationship id",
                                    orderTicketRequest.getRelationshipId())));
        return modelMapper.map(orderTicketRepository.save(orderTicket), OrderTicketResponse.class);
    }

    @Transactional
    public MessageResponse deleteOrderTicket(Long orderTicketId) {

        if (orderTicketRepository.getOrderTicketStatusByOrderTicketId(
                orderTicketId) != com.example.ticketboxcoreservice.enumf.Constants.ORDER_TICKET_STATUS_INACTIVE) {
            throw new AppException(ErrorCode.ONLY_INACTIVE_ORDER_TICKETS_IS_UPDATABLE_AND_REMOVABLE);
        }
        if (orderTicketRepository.getOrderStatusByOrderTicketId(
                orderTicketId) != com.example.ticketboxcoreservice.enumf.Constants.ORDER_STATUS_NOT_PURCHASED) {
            throw new AppException(ErrorCode.ONLY_CART_IS_UPDATABLE);
        }

        Order cart = orderRepository.findByOrderTicketId(orderTicketId).orElseThrow(
                () -> new ResourceNotFoundException("order", "order ticket id", orderTicketId));
        OrderTicket orderTicket = orderTicketRepository.findById(orderTicketId).orElseThrow(
                () -> new ResourceNotFoundException("ticket", "ticket id", orderTicketId));

        updateOrderTotals(cart, orderTicket, 0l);
        orderTicketRepository.deleteById(orderTicketId);
        return new MessageResponse("Order ticket with id " + orderTicketId + " is deleted successfully!");
    }

    // activate order ticket when its order is purchased
    public void activatePurchasedOrderTicket(OrderTicket orderTicket) {
        orderTicket.setStatus(Constants.ORDER_TICKET_STATUS_ACTIVE);
        orderTicket.setToken(generateOrderTicketToken(orderTicket));
    }

    // /api/order-ticket/qr/
//    @Transactional
//    public OrderTicket validateOrderTicketQRCode(OrderTicketQRCode orderTicketQRCode) {
//        String token = qrCodeService.decodeQrCode(orderTicketQRCode.getQrCode());
//        return validateOrderTicketByToken(token);
//    }

    @Transactional
    public OrderTicketResponse validateOrderTicketByToken(String token) {
        if (jwtService.isOrderTicketTokenExpired(token)) {
            throw new AppException(ErrorCode.ORDER_TICKET_EXPIRED);
        }
        Long orderTicketId = jwtService.extractClaimFromOrderTicketToken(token,
                claims -> claims.get("orderTicketId", Long.class));
        OrderTicket orderTicket = orderTicketRepository.findById(orderTicketId)
                .orElseThrow(() -> new ResourceNotFoundException("orderTicket", "orderTicketId", orderTicketId));

        // Verify that the scanned token matches the token stored in database for this
        // ticket
        if (!Objects.equals(orderTicket.getToken(), token)) {
            throw new AppException(ErrorCode.ORDER_TICKET_UNMATCHED);
        }

        if (!Objects.equals(orderTicket.getStatus(), Constants.ORDER_TICKET_STATUS_ACTIVE)) {
            throw new AppException(ErrorCode.ORDER_TICKET_USED);
        }
        orderTicket.setStatus(com.example.ticketboxcoreservice.enumf.Constants.ORDER_TICKET_STATUS_USED);
        return modelMapper.map(orderTicketRepository.save(orderTicket), OrderTicketResponse.class);
    }

    @Transactional
    public OrderTicketToken getOrderTicketToken(Long orderTicketId, Long buyerId) {
        return OrderTicketToken.builder()
                .token(orderTicketRepository.getTokenByOrderTicketIdAndBuyerId(orderTicketId, buyerId).orElseThrow(
                        () -> new ResourceNotFoundException("order ticket token",
                                String.format("order ticket id %s and buyer id %s", orderTicketId, buyerId), "")))
                .build();
    }

    @Transactional
    public CustomPage<OrderTicketResponse> getCartTicketsByUserId(Long userId, Pageable pageable) {
        Order cart = getCartByUserIdFunction(userId);
        Page<OrderTicket> cartTickets = orderTicketRepository.findByOrderId(cart.getId(), pageable);
        return CustomPage.<OrderTicketResponse>builder()
                .pageNo(cartTickets.getNumber() + 1)
                .pageSize(cartTickets.getSize())
                .pageContent(cartTickets.getContent().stream()
                        .map(cartTicket -> modelMapper.map(cartTicket, OrderTicketResponse.class))
                        .collect(Collectors.toList()))
                .build();
    }

    @Transactional
    public CustomPage<OrderTicketResponse> getOrderTicketsByOrderId(Long orderId, Pageable pageable) {
        Page<OrderTicket> orderTickets = orderTicketRepository.findByOrderId(orderId, pageable);
        return CustomPage.<OrderTicketResponse>builder()
                .pageNo(orderTickets.getNumber() + 1)
                .pageSize(orderTickets.getSize())
                .pageContent(orderTickets.getContent().stream()
                        .map(orderTicket -> modelMapper.map(orderTicket, OrderTicketResponse.class))
                        .collect(Collectors.toList()))
                .build();
    }

    private String generateOrderTicketToken(OrderTicket orderTicket) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("orderTicketId", orderTicket.getId());
        String subject = orderTicket.getId().toString();
        return jwtService.generateOrderTicketToken(claims, subject,
                orderTicket.getOrder().getPurchaseDate(),
                orderTicket.getTicket().getEvent().getEndDate());
    }

    private Order getCartByUserIdFunction(Long userId) {
        List<Order> orders = orderRepository.findOrderByUserIdAndPurchasedAsList(userId,
                com.example.ticketboxcoreservice.enumf.Constants.ORDER_STATUS_NOT_PURCHASED);
        if (orders.size() != 1)
            throw new AppException(ErrorCode.INVALID_NUMBER_OF_CARTS);
        return orders.get(0);
    }

    private void updateOrderTotals(Order order, OrderTicket orderTicket, Long newQty) {
        Long qtyDiff = newQty - orderTicket.getSubQuantity();
        order.setQuantity(order.getQuantity() + qtyDiff);
        order.setTotalPrice(order.getTotalPrice() + qtyDiff * orderTicket.getTicket().getUnitPrice());
        orderRepository.save(order);
    }

    public byte[] getOrderTicketQRCode(Long orderTicketId) {
        OrderTicket orderTicket = orderTicketRepository.findById(orderTicketId)
                .orElseThrow(() -> new ResourceNotFoundException("orderTicket", "orderTicketId", orderTicketId));
        if (orderTicket.getToken() == null || orderTicket.getToken().isEmpty()) {
            throw new AppException(ErrorCode.INTERNAL_ERROR); // Should have a token if purchased
        }
        return qrCodeService.encodeQrCode(orderTicket.getToken(), 300, 300);
    }
}
