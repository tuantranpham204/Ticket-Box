package com.example.ticketboxcoreservice.service;

import com.example.ticketboxcoreservice.enumf.Constants;
import com.example.ticketboxcoreservice.enumf.ErrorCode;
import com.example.ticketboxcoreservice.exception.AppException;
import com.example.ticketboxcoreservice.model.dto.request.OrderRequest;
import com.example.ticketboxcoreservice.model.dto.response.CustomPage;
import com.example.ticketboxcoreservice.model.dto.response.MessageResponse;
import com.example.ticketboxcoreservice.model.dto.response.OrderResponse;
import com.example.ticketboxcoreservice.model.entity.Order;
import com.example.ticketboxcoreservice.model.entity.OrderTicket;
import com.example.ticketboxcoreservice.repository.OrderRepository;
import com.example.ticketboxcoreservice.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final OrderTicketService orderTicketService;
    private final ModelMapper modelMapper;
    @Transactional
    public OrderResponse getCartByUserId(Long userId) {
        List<Order> orders = orderRepository.findOrderByUserIdAndPurchasedAsList(userId, Constants.ORDER_STATUS_NOT_PURCHASED);
        if (orders.size() != 1) throw new AppException(ErrorCode.INVALID_NUMBER_OF_CARTS);
        Order cart = orders.get(0);
        return modelMapper.map(orderRepository.save(cart), OrderResponse.class);
    }
    @Transactional
    public MessageResponse purchaseCartByUserId(Long userId) {
        Order cart = getCartByUserIdFunction(userId);
        cart.setStatus(Constants.ORDER_STATUS_PURCHASED);
        cart.setPurchaseDate(LocalDateTime.now());
        for (OrderTicket orderTicket : cart.getOrderTickets()) {
            orderTicketService.activatePurchasedOrderTicket(orderTicket);
        }
        orderRepository.save(cart);
        return new MessageResponse("Cart of user with id " + userId + " has been purchased successfully");
    }
    @Transactional
    public CustomPage<OrderResponse> getOrderHistoryByUserId(Long userId, Pageable pageable) {
        Page<Order> purchasedOrders = orderRepository.findOrderByUserIdAndPurchasedAsPage(userId, Constants.ORDER_STATUS_PURCHASED, pageable);
        return CustomPage.<OrderResponse>builder()
                .pageNo(purchasedOrders.getNumber()+1)
                .pageSize(purchasedOrders.getSize())
                .pageContent(purchasedOrders.getContent().stream()
                        .map(order -> modelMapper.map(order, OrderResponse.class))
                        .collect(Collectors.toList()))
                .build();
    }

    public Order getCartByUserIdFunction(Long userId) {
        List<Order> orders = orderRepository.findOrderByUserIdAndPurchasedAsList(userId, Constants.ORDER_STATUS_NOT_PURCHASED);
        if (orders.size() != 1) throw new AppException(ErrorCode.INVALID_NUMBER_OF_CARTS);
        return orders.get(0);
    }



}
