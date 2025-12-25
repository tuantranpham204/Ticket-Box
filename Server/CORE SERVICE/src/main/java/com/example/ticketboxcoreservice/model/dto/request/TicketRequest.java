package com.example.ticketboxcoreservice.model.dto.request;

import com.example.ticketboxcoreservice.enumf.ErrorCode;
import com.example.ticketboxcoreservice.exception.AppException;
import com.example.ticketboxcoreservice.model.entity.Event;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketRequest {
    private String type;
    private LocalDateTime startSale;
    private LocalDateTime endSale;
    private Boolean status;
    private Long capacity;
    private Long sold;
    private Long minQtyPerOrder;
    private Long maxQtyPerOrder;
    private Double unitPrice;
}
