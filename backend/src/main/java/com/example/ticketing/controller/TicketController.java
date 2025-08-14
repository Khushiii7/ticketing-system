package com.example.ticketing.controller;

import com.example.ticketing.model.*;
import com.example.ticketing.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.time.Instant;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    @Autowired TicketRepository ticketRepo;
    @Autowired UserRepository userRepo;

    @PostMapping
    public Ticket createTicket(@RequestBody Ticket t, Authentication auth){
        String username = auth.getName();
        User u = userRepo.findByUsername(username).orElseThrow();
        t.setOwner(u);
        t.setStatus("OPEN");
        t.setCreatedAt(Instant.now());
        t.setUpdatedAt(Instant.now());
        return ticketRepo.save(t);
    }

    @GetMapping
    public List<Ticket> myTickets(Authentication auth){
        User u = userRepo.findByUsername(auth.getName()).orElseThrow();
        return ticketRepo.findByOwnerId(u.getId());
    }

    @GetMapping("/{id}")
    public Ticket getTicket(@PathVariable Long id, Authentication auth){
        Ticket t = ticketRepo.findById(id).orElseThrow();
        // owner or assigned or admin can view
        User u = userRepo.findByUsername(auth.getName()).orElseThrow();
        boolean owner = t.getOwner()!=null && t.getOwner().getId().equals(u.getId());
        boolean assignee = t.getAssignee()!=null && t.getAssignee().getId().equals(u.getId());
        boolean isAdmin = auth.getAuthorities().stream().anyMatch(a->a.getAuthority().equals("ROLE_ADMIN"));
        if(owner||assignee||isAdmin) return t;
        throw new RuntimeException("forbidden");
    }

    @PostMapping("/{id}/comment")
    public Ticket addComment(@PathVariable Long id, @RequestBody Map<String,String> body, Authentication auth){
        Ticket t = ticketRepo.findById(id).orElseThrow();
        User u = userRepo.findByUsername(auth.getName()).orElseThrow();
        Comment c = new Comment();
        c.setAuthor(u);
        c.setText(body.get("text"));
        c.setCreatedAt(Instant.now());
        t.getComments().add(c);
        t.setUpdatedAt(Instant.now());
        return ticketRepo.save(t);
    }

    @PostMapping("/{id}/assign")
    public Ticket assign(@PathVariable Long id, @RequestBody Map<String,Long> body, Authentication auth){
        Ticket t = ticketRepo.findById(id).orElseThrow();
        Long assigneeId = body.get("assigneeId");
        User assignee = userRepo.findById(assigneeId).orElseThrow();
        // only admin or agent can assign; regular user can reassign only if owner (and role permits)
        boolean isAdmin = auth.getAuthorities().stream().anyMatch(a->a.getAuthority().equals("ROLE_ADMIN"));
        User requester = userRepo.findByUsername(auth.getName()).orElseThrow();
        boolean isOwner = t.getOwner()!=null && t.getOwner().getId().equals(requester.getId());
        boolean isAgent = auth.getAuthorities().stream().anyMatch(a->a.getAuthority().equals("ROLE_AGENT"));
        if(!isAdmin && !isAgent && !isOwner) throw new RuntimeException("forbidden");
        t.setAssignee(assignee);
        t.setUpdatedAt(Instant.now());
        return ticketRepo.save(t);
    }

    @PostMapping("/{id}/status")
    public Ticket changeStatus(@PathVariable Long id, @RequestBody Map<String,String> body, Authentication auth){
        Ticket t = ticketRepo.findById(id).orElseThrow();
        String status = body.get("status");
        boolean isAdmin = auth.getAuthorities().stream().anyMatch(a->a.getAuthority().equals("ROLE_ADMIN"));
        boolean isAgent = auth.getAuthorities().stream().anyMatch(a->a.getAuthority().equals("ROLE_AGENT"));
        User requester = userRepo.findByUsername(auth.getName()).orElseThrow();
        boolean isOwner = t.getOwner()!=null && t.getOwner().getId().equals(requester.getId());
        // Only agent or admin or owner can change status (owner limited)
        if(isOwner && !(status.equals("CLOSED")||status.equals("OPEN"))) {
            throw new RuntimeException("owners can only open/close");
        }
        if(!isAdmin && !isAgent && !isOwner) throw new RuntimeException("forbidden");
        t.setStatus(status);
        t.setUpdatedAt(Instant.now());
        return ticketRepo.save(t);
    }
}
