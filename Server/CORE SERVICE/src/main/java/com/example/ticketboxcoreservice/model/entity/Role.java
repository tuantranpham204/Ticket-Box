package com.example.ticketboxcoreservice.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "s_order_ticket")
@Builder()
public class Role {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    @ManyToMany(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JoinTable(name = "s_user_role",
            joinColumns = @JoinColumn(name = "s_role.id"),
            inverseJoinColumns = @JoinColumn(name = "s_user.id")
    )
    @JsonIgnore
    Set<User> users = new HashSet<>();
}
