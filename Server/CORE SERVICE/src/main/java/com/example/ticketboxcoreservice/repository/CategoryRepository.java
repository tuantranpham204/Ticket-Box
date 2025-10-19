package com.example.ticketboxcoreservice.repository;

import com.example.ticketboxcoreservice.model.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category,Long> {
}
