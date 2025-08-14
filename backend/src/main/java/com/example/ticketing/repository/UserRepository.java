package com.example.ticketing.repository;

import com.example.ticketing.model.Role;
import com.example.ticketing.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.Set;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmailIgnoreCase(String email);
    
    boolean existsByEmailIgnoreCase(String email);
    
    @Query("SELECT u FROM User u JOIN u.roles r WHERE r = :role")
    List<User> findByRole(@Param("role") Role role);
    
    @Query("SELECT CASE WHEN COUNT(u) > 0 THEN true ELSE false END FROM User u JOIN u.roles r WHERE u.email = :email AND r = :role")
    boolean existsByEmailAndRole(@Param("email") String email, @Param("role") Role role);
    
    @Query("SELECT DISTINCT u FROM User u LEFT JOIN FETCH u.roles WHERE u.email = :email")
    Optional<User> findByEmailWithRoles(@Param("email") String email);
    
    @Deprecated
    Optional<User> findByUsername(String username);
    
    @Deprecated
    boolean existsByUsername(String username);
    
    @Deprecated
    boolean existsByEmail(String email);
}
