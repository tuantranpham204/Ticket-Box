package com.example.ticketboxcoreservice.model.entity;


import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "s_category")
@Builder()
public class Category {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    @ManyToMany(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JoinTable(name = "s_cat_event",
            joinColumns = @JoinColumn(name = "s_category.id"),
            inverseJoinColumns = @JoinColumn(name = "s_event.id")
    )
    @JsonIgnore
    private Set<Event> events = new HashSet<>();
    public void addEvent(Event event) {
        this.events.add(event);
    }

}
