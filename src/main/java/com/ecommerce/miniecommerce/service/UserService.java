package com.ecommerce.miniecommerce.service;

import com.ecommerce.miniecommerce.model.Role;
import com.ecommerce.miniecommerce.model.User;
import com.ecommerce.miniecommerce.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Transactional
    public User registerUser(String name, String email, String password, Role role) {
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email is already registered!");
        }
        User user = new User(name, email, passwordEncoder.encode(password), role);
        return userRepository.save(user);
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
}
