package com.example.ticketboxcoreservice.model.dto.request;

import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderRequest {
    private Double totalPrice;

    private Long quantity;

    private Set<OrderTicketRequest> orderTickets = new HashSet<>();
}
