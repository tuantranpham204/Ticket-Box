package com.example.ticketboxcoreservice.repository;

import com.example.ticketboxcoreservice.model.entity.Ticket;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface TicketRepository extends JpaRepository<Ticket,Long> {
    @Query("SELECT t FROM Ticket t WHERE t.event.id=:eventId")
    Page<Ticket> findByEventId(Long eventId, Pageable pageable);
}
