package com.example.ticketboxcoreservice.repository;

import com.example.ticketboxcoreservice.model.entity.Pdf;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface PdfRepository extends JpaRepository<Pdf, Long> {
    @Query("SELECT e.contract FROM Event e WHERE e.id=:eventId")
    Pdf findContractByEventId(Long eventId);
}
