package com.example.ticketboxcoreservice.repository;

import com.example.ticketboxcoreservice.model.entity.Pdf;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface PdfRepository extends JpaRepository<Pdf, Long> {
    @Query("SELECT p FROM Pdf p JOIN Event e ON e.contract.id = p.id AND e.id=:eventId")
    Optional<Pdf> findContractByEventId(Long eventId);
}
