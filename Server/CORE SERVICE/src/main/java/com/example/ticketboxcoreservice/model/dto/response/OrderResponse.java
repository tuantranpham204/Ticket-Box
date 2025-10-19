package com.example.ticketboxcoreservice.model.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OrderResponse {
    private Long id;
    private Integer status;
    private Double totalPrice;
    private Long quantity;
    private LocalDateTime purchaseDate;
    private LocalDateTime createDate;
    private LocalDateTime updateDate;
}
