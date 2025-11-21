package com.example.ticketboxcoreservice.model.dto.request;

import com.example.ticketboxcoreservice.model.entity.Relationship;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderTicketRequest {
    private String ownerName;
    private Relationship relationship;
    private Long ticketId;
    private Long subQuantity;
}
