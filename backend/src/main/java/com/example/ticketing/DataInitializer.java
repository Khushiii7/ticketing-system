package com.example.ticketing;

import com.example.ticketing.model.Role;
import com.example.ticketing.model.User;
import com.example.ticketing.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.Set;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner init(UserRepository userRepo, BCryptPasswordEncoder encoder){
        return args -> {
            if(!userRepo.existsByUsername("admin")){
                User u = new User();
                u.setUsername("admin");
                u.setPassword(encoder.encode("adminpass"));
                u.setRoles(Set.of(Role.ROLE_ADMIN));
                userRepo.save(u);
            }
        };
    }
}
