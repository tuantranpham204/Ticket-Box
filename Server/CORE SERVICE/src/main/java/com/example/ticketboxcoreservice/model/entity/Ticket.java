package com.example.ticketboxcoreservice.model.entity;

import com.example.ticketboxcoreservice.enumf.Constants;
import com.example.ticketboxcoreservice.enumf.ErrorCode;
import com.example.ticketboxcoreservice.exception.AppException;
import com.fasterxml.jackson.annotation.JsonIgnore;
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
@Table(name = "s_ticket")
@Builder()
public class Ticket {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String type;
    private LocalDateTime startSale;
    private LocalDateTime endSale;
    private Double unitPrice;
    private Long capacity;
    private Long sold;
    private Integer status;
    private Long maxQtyPerOrder;
    private Long minQtyPerOrder;
    private LocalDateTime createDate;
    private LocalDateTime updateDate;
    @ManyToOne(fetch = FetchType.LAZY,cascade = {CascadeType.PERSIST,CascadeType.MERGE,CascadeType.DETACH,CascadeType.REFRESH})
    @JoinColumn(name = "event.id", unique = false)
    private Event event;
    @OneToMany(mappedBy = "ticket", fetch = FetchType.LAZY,cascade = CascadeType.ALL)
    private Set<OrderTicket> orderTickets = new HashSet<>();

    @ManyToMany(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JoinTable(name = "s_accepted_relationship_ticket",
            joinColumns = @JoinColumn(name = "s_ticket.id"),
            inverseJoinColumns = @JoinColumn(name = "s_relationship.id")
    )
    private Set<Relationship> acceptedRelationships = new HashSet<>();

    public Boolean validateSaleDate() {
        return !startSale.isBefore(endSale) ||!startSale.isAfter(event.getStartDate()) || !endSale.isBefore(event.getEndDate());
    }
    public void approve() {
        updateDate = LocalDateTime.now();
        if (sold == null) sold = 0L;
        if (LocalDateTime.now().isBefore(startSale)) status = Constants.TICKET_STATUS_UPCOMING;
        else if (LocalDateTime.now().isAfter(endSale)) status = Constants.TICKET_STATUS_ENDED;
        else if (LocalDateTime.now().isAfter(startSale) && LocalDateTime.now().isBefore(endSale) && sold < capacity) status = Constants.TICKET_STATUS_REMAINING;
        else if (LocalDateTime.now().isAfter(startSale) && LocalDateTime.now().isBefore(endSale) && sold >= capacity) status = Constants.TICKET_STATUS_SOLD_OUT;
        else throw new AppException(ErrorCode.SOLD_TICKET_CANNOT_EXCEED_ITS_CAPACITY);
    }
    public void cancel() {
        updateDate = LocalDateTime.now();
        if (status == Constants.TICKET_STATUS_PENDING) status = Constants.TICKET_STATUS_CANCELED;
        else throw new AppException(ErrorCode.ONLY_PENDING_TICKET_IS_UPDATABLE);
    }
    public void decline() {
        updateDate = LocalDateTime.now();
        if (status == Constants.TICKET_STATUS_PENDING) status = Constants.TICKET_STATUS_DECLINED;
        else throw new AppException(ErrorCode.ONLY_PENDING_TICKET_IS_UPDATABLE);
    }


}
