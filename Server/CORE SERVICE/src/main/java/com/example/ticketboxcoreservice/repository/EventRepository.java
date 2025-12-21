package com.example.ticketboxcoreservice.repository;

import com.example.ticketboxcoreservice.model.dto.response.EventResponse;
import com.example.ticketboxcoreservice.model.entity.Event;
import com.example.ticketboxcoreservice.model.entity.Pdf;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import javax.swing.text.html.Option;
import java.util.List;
import java.util.Optional;

public interface EventRepository extends JpaRepository<Event,Long> {
    @Query("SELECT e FROM Event e JOIN e.categories c where c.id=:categoryId AND e.status=:eventStatus")
    Page<Event> findByCategoryIdAndStatus(Long categoryId, Integer eventStatus, Pageable pageable);
    @Query("SELECT e FROM Event e JOIN e.host u where u.id=:hostId AND e.status=:eventStatus ")
    Page<Event> findByHostIdAndStatus(Long hostId, Integer eventStatus, Pageable pageable);
    @Query("SELECT e FROM Event e JOIN e.approver u where u.id=:approverId")
    Page<Event> findByApproverIdAndStatus(Long approverId, Integer eventStatus , Pageable pageable);
    @Query("SELECT e FROM Event e WHERE e.status=:status")
    Page<Event> findByStatus(Integer status, Pageable pageable);

    @Query("SELECT e.contract FROM Event e WHERE e.id=:eventId")
    Optional<Pdf> findContractByEventId(Long eventId);

    @Query("SELECT e FROM Event e WHERE e.name LIKE CONCAT('%', :params, '%') OR e.address LIKE CONCAT('%', :params, '%') OR e.orgName LIKE CONCAT('%', :params, '%')")
    List<Event> search(String params);
    @Query("SELECT e FROM Event e WHERE e.status=:status")
    Page<Event> findByStatus(String status, Pageable pageable);

}
