package com.example.ticketboxcoreservice.model.dto.response;

import lombok.*;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OrderTicketResponse {
    private Long id;
    private Integer status;
    private Double unitPrice;
    private String token;
    private String ownerName;
    private RelationshipResponse relationship;
    private Long subQuantity;
    private TicketResponse ticket;
}
