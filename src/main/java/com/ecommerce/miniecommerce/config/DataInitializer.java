package com.ecommerce.miniecommerce.config;

import com.ecommerce.miniecommerce.model.Product;
import com.ecommerce.miniecommerce.model.Role;
import com.ecommerce.miniecommerce.model.User;
import com.ecommerce.miniecommerce.repository.ProductRepository;
import com.ecommerce.miniecommerce.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Ensure uploads folder exists
        createUploadsFolder();

        // 1. Seed Users (disabled)

        // 2. Seed Products
        if (productRepository.count() == 0) {
            // Books
            productRepository.save(new Product(
                    "Java Programming",
                    "Books",
                    500.0,
                    "/uploads/book_default.png"
            ));
            productRepository.save(new Product(
                    "Python Basics",
                    "Books",
                    400.0,
                    "/uploads/book_default.png"
            ));
            productRepository.save(new Product(
                    "Data Structures",
                    "Books",
                    450.0,
                    "/uploads/book_default.png"
            ));
            productRepository.save(new Product(
                    "Web Development",
                    "Books",
                    600.0,
                    "/uploads/book_default.png"
            ));
            productRepository.save(new Product(
                    "DBMS Concepts",
                    "Books",
                    350.0,
                    "/uploads/book_default.png"
            ));

            // Stationery
            productRepository.save(new Product(
                    "Notebook",
                    "Stationery",
                    100.0,
                    "/uploads/stationery_default.png"
            ));
            productRepository.save(new Product(
                    "Pen Set",
                    "Stationery",
                    150.0,
                    "/uploads/stationery_default.png"
            ));
            productRepository.save(new Product(
                    "Pencil Box",
                    "Stationery",
                    120.0,
                    "/uploads/stationery_default.png"
            ));
            productRepository.save(new Product(
                    "Highlighter Pack",
                    "Stationery",
                    180.0,
                    "/uploads/stationery_default.png"
            ));
            productRepository.save(new Product(
                    "Geometry Box",
                    "Stationery",
                    250.0,
                    "/uploads/stationery_default.png"
            ));

            System.out.println("Seeded 10 default products in Books and Stationery categories.");
        }
    }

    private void createUploadsFolder() {
        try {
            Path uploadPath = Paths.get("uploads");
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
                System.out.println("Created uploads directory at: " + uploadPath.toAbsolutePath());
            }
        } catch (IOException e) {
            System.err.println("Could not create uploads directory: " + e.getMessage());
        }
    }
}
