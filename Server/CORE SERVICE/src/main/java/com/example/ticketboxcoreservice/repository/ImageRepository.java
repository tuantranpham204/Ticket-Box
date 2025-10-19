package com.example.ticketboxcoreservice.repository;

import com.example.ticketboxcoreservice.model.entity.Image;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ImageRepository extends JpaRepository<Image,Long> {
}
