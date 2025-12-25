package com.example.ticketboxcoreservice.model.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketResponse {
    private Long id;
    private String type;
    private LocalDateTime startSale;
    private LocalDateTime endSale;
    private Double unitPrice;
    private Long capacity;
    private Long sold;
    private Integer status;
    private Double ticketPrice;
    private Long minQtyPerOrder;
    private Long maxQtyPerOrder;
    private EventResponse event;
}
