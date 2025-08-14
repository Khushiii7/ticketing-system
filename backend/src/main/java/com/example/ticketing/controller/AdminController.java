package com.example.ticketing.controller;

import com.example.ticketing.model.*;
import com.example.ticketing.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Set;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired UserRepository userRepo;
    @Autowired TicketRepository ticketRepo;

    @GetMapping("/users")
    public List<User> listUsers(){ return userRepo.findAll(); }

    @PostMapping("/users")
    public User createUser(@RequestBody Map<String,String> body){
        User u = new User();
        u.setUsername(body.get("username"));
        u.setPassword(body.get("password")); // should be bcryptped by service in real app; for admin convenience, using plain here
        u.setRoles(Set.of(Role.valueOf(body.getOrDefault("role","ROLE_USER"))));
        return userRepo.save(u);
    }

    @DeleteMapping("/users/{id}")
    public Map<String,String> deleteUser(@PathVariable Long id){
        userRepo.deleteById(id);
        return Map.of("status","deleted");
    }

    @GetMapping("/tickets")
    public List<Ticket> allTickets(){ return ticketRepo.findAll(); }

    @PostMapping("/tickets/{id}/force")
    public Ticket forceUpdate(@PathVariable Long id, @RequestBody Map<String,String> body){
        Ticket t = ticketRepo.findById(id).orElseThrow();
        if(body.containsKey("status")) t.setStatus(body.get("status"));
        t.setUpdatedAt(java.time.Instant.now());
        return ticketRepo.save(t);
    }
}
