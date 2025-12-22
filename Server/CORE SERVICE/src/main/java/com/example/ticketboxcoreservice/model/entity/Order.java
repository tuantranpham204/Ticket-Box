package com.example.ticketboxcoreservice.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "s_order")
@Builder()
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Integer status;
    private Double totalPrice;
    private Long quantity;
    private LocalDateTime purchaseDate;
    private LocalDateTime createDate;
    private LocalDateTime updateDate;
    @Builder.Default
    @OneToMany(mappedBy = "order", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private Set<OrderTicket> orderTickets = new HashSet<>();
    @ManyToOne(fetch = FetchType.LAZY, cascade = { CascadeType.PERSIST, CascadeType.MERGE, CascadeType.DETACH,
            CascadeType.REFRESH })
    @JoinColumn(name = "buyer_id", referencedColumnName = "id")
    private User buyer;

    public void recalculate() {
        totalPrice = 0d;
        quantity = 0L;
        for (OrderTicket orderTicket : orderTickets) {
            quantity += orderTicket.getSubQuantity();
            totalPrice += (double) orderTicket.getSubQuantity() * orderTicket.getTicket().getUnitPrice();
        }
    }

}
