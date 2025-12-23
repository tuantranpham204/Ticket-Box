package com.example.ticketboxcoreservice.service;

import com.example.ticketboxcoreservice.enumf.ErrorCode;
import com.example.ticketboxcoreservice.exception.AppException;
import com.example.ticketboxcoreservice.exception.ResourceNotFoundException;
import com.example.ticketboxcoreservice.model.dto.request.OrderTicketQRCode;
import com.example.ticketboxcoreservice.model.dto.request.OrderTicketRequest;
import com.example.ticketboxcoreservice.model.dto.response.CustomPage;
import com.example.ticketboxcoreservice.model.dto.response.MessageResponse;
import com.example.ticketboxcoreservice.model.dto.response.OrderTicketResponse;
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
        if (!orderTicket.getStatus()
                .equals(com.example.ticketboxcoreservice.enumf.Constants.ORDER_TICKET_STATUS_INACTIVE)) {
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
                () -> new ResourceNotFoundException("order", "order ticket id", orderTicketId)
        );
        OrderTicket orderTicket = orderTicketRepository.findById(orderTicketId).orElseThrow(
                () -> new ResourceNotFoundException("ticket", "ticket id", orderTicketId));

        updateOrderTotals(cart, orderTicket, 0l);
        orderTicketRepository.deleteById(orderTicketId);
        return new MessageResponse("Order ticket with id " + orderTicketId + " is deleted successfully!");
    }

    // activate order ticket when its order is purchased
    public void activatePurchasedOrderTicket(OrderTicket orderTicket) {
        orderTicket.setStatus(com.example.ticketboxcoreservice.enumf.Constants.ORDER_TICKET_STATUS_USED);
        orderTicket.setToken(generateOrderTicketToken(orderTicket));
    }

    // /api/order-ticket/qr/
    @Transactional
    public OrderTicket validateOrderTicketQRCode(OrderTicketQRCode orderTicketQRCode) {
        try {
            String token = qrCodeService.decodeQrCode(orderTicketQRCode.getQrCode());
            if (jwtService.isOrderTicketTokenExpired(token)) {
                throw new AppException(ErrorCode.ORDER_TICKET_EXPIRED);
            }
            OrderTicket scannedOrderTicket = jwtService.extractClaimFromOrderTicketToken(token,
                    claims -> claims.get("orderTicket", OrderTicket.class));
            OrderTicket orderTicket = orderTicketRepository.findById(scannedOrderTicket.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("orderTicket", "orderTicketId",
                            scannedOrderTicket.getId()));
            if (!Objects.equals(orderTicket.getStatus(),
                    com.example.ticketboxcoreservice.enumf.Constants.ORDER_TICKET_STATUS_ACTIVE)) {
                throw new AppException(ErrorCode.ORDER_TICKET_USED);
            }
            if (!orderTicket.equals(scannedOrderTicket)) {
                throw new AppException(ErrorCode.ORDER_TICKET_UNMATCHED);
            }
            orderTicket.setStatus(com.example.ticketboxcoreservice.enumf.Constants.ORDER_TICKET_STATUS_PENDING);
            return orderTicketRepository.save(orderTicket);
        } catch (Exception e) {
            throw new AppException(ErrorCode.INTERNAL_ERROR);
        }

    }

    @Transactional
    public MessageResponse confirmOrder(OrderTicket orderTicket) {
        orderTicket.setStatus(com.example.ticketboxcoreservice.enumf.Constants.ORDER_TICKET_STATUS_USED);
        orderTicketRepository.save(orderTicket);
        return new MessageResponse("Order ticket with id " + orderTicket.getId() + " is confirmed!");
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
        claims.put("orderTicket", orderTicket);
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

}
