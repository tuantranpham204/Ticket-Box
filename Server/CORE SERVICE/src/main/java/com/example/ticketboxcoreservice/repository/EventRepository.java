package com.example.ticketboxcoreservice.repository;

import com.example.ticketboxcoreservice.model.dto.response.EventResponse;
import com.example.ticketboxcoreservice.model.entity.Event;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface EventRepository extends JpaRepository<Event,Long> {
    @Query("SELECT e FROM Event e JOIN e.categories c where c.id=:categoryId")
    Page<Event> findByCategoryId(Long categoryId, Pageable pageable);
    @Query("SELECT e FROM Event e JOIN e.host u where u.id=:hostId")
    Page<Event> findByHostId(Long hostId, Pageable pageable);
    @Query("SELECT e FROM Event e JOIN e.approver u where u.id=:approverId")
    Page<Event> findByApproverId(Long approverId, Pageable pageable);
}
