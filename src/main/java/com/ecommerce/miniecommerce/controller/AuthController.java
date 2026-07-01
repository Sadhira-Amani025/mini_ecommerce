package com.ecommerce.miniecommerce.controller;

import com.ecommerce.miniecommerce.model.Role;
import com.ecommerce.miniecommerce.model.User;
import com.ecommerce.miniecommerce.security.JwtTokenProvider;
import com.ecommerce.miniecommerce.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserService userService;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @PostMapping("/login")
public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
    try {

        String email = loginRequest.getEmail().trim().toLowerCase();

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        email,
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        String jwt = tokenProvider.generateToken(authentication);
        User user = (User) authentication.getPrincipal();

        Map<String, Object> response = new HashMap<>();
        response.put("token", jwt);
        response.put("id", user.getId());
        response.put("name", user.getName());
        response.put("email", user.getEmail());
        response.put("role", user.getRole().name());

        return ResponseEntity.ok(response);

    } catch (Exception e) {
        e.printStackTrace();

        Map<String, String> errorResponse = new HashMap<>();
        errorResponse.put("message", e.getMessage());

        return ResponseEntity.badRequest().body(errorResponse);
    }
}
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequest registerRequest) {
        try {
            Role assignedRole = Role.ROLE_USER;
            if (registerRequest.getRole() != null) {
                try {
                    assignedRole = Role.valueOf(registerRequest.getRole());
                } catch (IllegalArgumentException e) {
                    assignedRole = Role.ROLE_USER;
                }
            }

            User user = userService.registerUser(
                    registerRequest.getName(),
                    registerRequest.getEmail(),
                    registerRequest.getPassword(),
                    assignedRole
            );

            Map<String, String> response = new HashMap<>();
            response.put("message", "User registered successfully!");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    // Static Request DTOs
    public static class LoginRequest {
        private String email;
        private String password;

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }
    }

    public static class RegisterRequest {
        private String name;
        private String email;
        private String password;
        private String role;

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }

        public String getRole() {
            return role;
        }

        public void setRole(String role) {
            this.role = role;
        }
    }
}
