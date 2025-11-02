package com.example.ticketboxcoreservice.model.entity;


import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.*;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "s_user")
@Builder()
public class User implements UserDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(columnDefinition = "varchar(255) collate 'utf8_bin'",unique = true,nullable = false)
    private String username;
    @Column(columnDefinition = "varchar(255) collate 'utf8_bin'",nullable = false)
    private String password;
    @Column(columnDefinition = "varchar(255) collate 'utf8_bin'",unique = true)
    private String email;
    private String fullName;
    @ManyToMany(fetch = FetchType.EAGER,cascade = {CascadeType.PERSIST,CascadeType.MERGE,CascadeType.DETACH,CascadeType.REFRESH})
    @JoinTable(
            name = "s_user_role",
            joinColumns = @JoinColumn(name = "s_user.id"),
            inverseJoinColumns = @JoinColumn(name = "s_role.id")
    )
    private Set<Role> roles = new HashSet<>();
    @OneToMany(mappedBy = "host", fetch = FetchType.LAZY,cascade = CascadeType.ALL)
    private Set<Event> hostedEvents = new HashSet<>();
    @OneToMany(mappedBy = "approver", fetch = FetchType.LAZY,cascade = CascadeType.ALL)
    private Set<Event> approvedEvents = new HashSet<>();
    @OneToMany(mappedBy = "buyer", fetch = FetchType.LAZY,cascade = CascadeType.ALL)
    private Set<Order> orders = new HashSet<>();
    @OneToOne(fetch = FetchType.LAZY,cascade = CascadeType.ALL)
    private Image avatar;
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        List<SimpleGrantedAuthority> role= new ArrayList<>();
        for (Role x: roles){
            role.add(new SimpleGrantedAuthority(x.getName()));
        }
        return role;
    }
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }
    @Override
    public boolean isAccountNonLocked() {
        return true;
    }
    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }
    @Override
    public boolean isEnabled() {
        return true;
    }


}
