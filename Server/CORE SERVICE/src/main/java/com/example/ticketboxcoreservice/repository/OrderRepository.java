package com.example.ticketboxcoreservice.repository;

import com.example.ticketboxcoreservice.enumf.Constants;
import com.example.ticketboxcoreservice.model.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order,Long> {
    @Query("from Order o where o.buyer.id=:userId and o.status =:status")
    List<Order> findOrderByUserIdAndPurchasedAsList(Long userId, Integer status);

    @Query("from Order o where o.buyer.id=:userId and o.status =:status")
    Page<Order> findOrderByUserIdAndPurchasedAsPage(Long userId, Integer status, Pageable pageable);

}
