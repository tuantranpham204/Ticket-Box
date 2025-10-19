package com.example.ticketboxcoreservice.repository;

import com.example.ticketboxcoreservice.model.dto.response.ImageResponse;
import com.example.ticketboxcoreservice.model.dto.response.RoleResponse;
import com.example.ticketboxcoreservice.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import javax.swing.text.html.Option;
import java.util.Optional;
import java.util.Set;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    boolean existsByUsername(String username);

}
