package com.example.ticketboxcoreservice.model.entity;

import com.example.ticketboxcoreservice.enumf.ErrorCode;
import com.example.ticketboxcoreservice.exception.AppException;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "s_order_ticket")
@Builder()
public class OrderTicket {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Integer status;
    private String token;
    //@JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY, cascade = {CascadeType.PERSIST,CascadeType.MERGE,CascadeType.DETACH,CascadeType.REFRESH})
    @JoinColumn(name = "order.id")
    private Order order;
    @ManyToOne(fetch = FetchType.LAZY, cascade = {CascadeType.PERSIST,CascadeType.MERGE,CascadeType.DETACH,CascadeType.REFRESH})
    @JoinColumn(name = "ticket.id")
    private Ticket ticket;
    private String ownerCID;
    @ManyToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JoinColumn(name = "relationship.id")
    private Relationship relationship;
    private Long subQuantity;

    public void validateSubQuantity() {
        if (subQuantity > ticket.getMaxQtyPerOrder() ||  subQuantity < ticket.getMinQtyPerOrder()) {
            throw new AppException(ErrorCode.ORDER_TICKET_QUANTITY_INVALID);
        }
    }
}
