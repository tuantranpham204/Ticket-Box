package com.example.ticketboxcoreservice.repository;

import com.example.ticketboxcoreservice.model.entity.Category;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CategoryRepository extends JpaRepository<Category,Long> {

    @Modifying
    @Transactional
    @Query(value = "INSERT INTO s_cat_event(s_category_id, s_event_id) VALUES (:categoryId, :eventId)", nativeQuery = true)
    void addCategoryToEvents(@Param("categoryId") Long categoryId, @Param("eventId") Long eventId);

}
