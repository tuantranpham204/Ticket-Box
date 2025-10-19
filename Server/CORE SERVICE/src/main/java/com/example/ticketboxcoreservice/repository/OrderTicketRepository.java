package com.example.ticketboxcoreservice.repository;

import com.example.ticketboxcoreservice.model.entity.OrderTicket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface OrderTicketRepository extends JpaRepository<OrderTicket,Long> {
    @Query("SELECT ot.status FROM OrderTicket ot WHERE ot.id=:orderTicketId")
    int getOrderTicketStatusByOrderTicketId(Long orderTicketId);

    @Query("SELECT ot.order.status FROM OrderTicket ot WHERE ot.id=:orderTicketId")
    int getOrderStatusByOrderTicketId(Long orderTicketId);

}
