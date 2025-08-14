package com.example.ticketing.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Ticket {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String subject;
    @Column(columnDefinition = "TEXT")
    private String description;
    private String priority; // LOW,MEDIUM,HIGH,URGENT
    private String status; // OPEN,IN_PROGRESS,RESOLVED,CLOSED

    private Instant createdAt;
    private Instant updatedAt;

    @ManyToOne
    private User owner;

    @ManyToOne
    private User assignee;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Comment> comments = new ArrayList<>();
}
