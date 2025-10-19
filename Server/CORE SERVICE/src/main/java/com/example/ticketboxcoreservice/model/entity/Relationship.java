package com.example.ticketboxcoreservice.model.entity;


import jakarta.persistence.*;
import lombok.*;

import java.util.Set;


// this entity defines the relationship the owner of the ticket and its buyer
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "s_relationship")
@Builder()
public class Relationship {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    @ManyToMany(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JoinTable(name = "s_accepted_relationship_ticket",
            joinColumns = @JoinColumn(name = "s_relationship.id"),
            inverseJoinColumns = @JoinColumn(name = "s_ticket.id")
    )
    private Set<Ticket> tickets;
    @OneToMany(mappedBy = "relationship", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private Set<OrderTicket> orderTickets;


}
