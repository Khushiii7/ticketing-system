package com.example.ticketing.repository;

import com.example.ticketing.model.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TicketRepository extends JpaRepository<Ticket,Long> {
    List<Ticket> findByOwnerId(Long ownerId);
}
