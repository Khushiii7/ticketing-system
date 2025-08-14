package com.example.ticketing.controller;

import com.example.ticketing.dto.JwtResponse;
import com.example.ticketing.dto.LoginRequest;
import com.example.ticketing.dto.SignupRequest;
import com.example.ticketing.model.Role;
import com.example.ticketing.service.AuthService;
import com.example.ticketing.util.ApiResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    @Autowired
    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @GetMapping("/roles")
    public ResponseEntity<?> getAvailableRoles() {
        List<String> roles = Arrays.stream(Role.values())
                .map(Role::name)
                .collect(Collectors.toList());
        return ApiResponse.success(roles, "Available roles retrieved successfully");
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            JwtResponse response = authService.authenticateUser(loginRequest);
            return ApiResponse.success(response, "Login successful");
        } catch (Exception e) {
            return ApiResponse.unauthorized("Invalid email or password");
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        try {
            JwtResponse response = authService.registerUser(signUpRequest);
            return ApiResponse.created(response, "User registered successfully");
        } catch (RuntimeException e) {
            return ApiResponse.badRequest(e.getMessage());
        }
    }

    @GetMapping("/validate")
    public ResponseEntity<?> validateToken() {
        return ApiResponse.success("Token is valid");
    }
}
