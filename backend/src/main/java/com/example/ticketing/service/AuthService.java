package com.example.ticketing.service;

import com.example.ticketing.dto.JwtResponse;
import com.example.ticketing.dto.LoginRequest;
import com.example.ticketing.dto.SignupRequest;
import com.example.ticketing.exception.ResourceAlreadyExistsException;
import com.example.ticketing.model.Role;
import com.example.ticketing.model.User;
import com.example.ticketing.repository.UserRepository;
import com.example.ticketing.security.JwtUtils;
import com.example.ticketing.security.UserDetailsImpl;
import com.example.ticketing.utils.ApiResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    @Autowired
    public AuthService(AuthenticationManager authenticationManager,
                      UserRepository userRepository,
                      PasswordEncoder passwordEncoder,
                      JwtUtils jwtUtils) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
    }

    @Transactional
    public ApiResponse authenticateUser(LoginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    loginRequest.getEmail(),
                    loginRequest.getPassword()
                )
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtUtils.generateToken(authentication);
            
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            Set<Role> roles = userDetails.getAuthorities().stream()
                .map(authority -> Role.valueOf(authority.getAuthority()))
                .collect(Collectors.toSet());

            return ApiResponse.success(new JwtResponse(
                jwt,
                userDetails.getId(),
                userDetails.getEmail(),
                userDetails.getName(),
                roles
            ));
        } catch (BadCredentialsException e) {
            return ApiResponse.error("Invalid email or password");
        }
    }

    @Transactional
    public ApiResponse registerUser(SignupRequest signUpRequest) {
        if (userRepository.existsByEmailIgnoreCase(signUpRequest.getEmail())) {
            return ApiResponse.error("Email is already in use!");
        }

        // Create new user's account
        User user = new User();
        user.setName(signUpRequest.getName());
        user.setEmail(signUpRequest.getEmail());
        user.setPassword(passwordEncoder.encode(signUpRequest.getPassword()));
        
        // Set user role (default to ROLE_USER if not specified)
        Role role = signUpRequest.getRole() != null ? signUpRequest.getRole() : Role.ROLE_USER;
        user.setRoles(Collections.singleton(role));
        
        user = userRepository.save(user);

        // Generate JWT token
        String jwt = jwtUtils.generateToken(user);
        
        return ApiResponse.success(new JwtResponse(
            jwt,
            user.getId(),
            user.getEmail(),
            user.getName(),
            user.getRoles()
        ));
    }
}
