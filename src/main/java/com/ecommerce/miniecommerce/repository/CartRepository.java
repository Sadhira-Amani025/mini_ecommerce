package com.ecommerce.miniecommerce.repository;

import com.ecommerce.miniecommerce.model.CartItem;
import com.ecommerce.miniecommerce.model.Product;
import com.ecommerce.miniecommerce.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<CartItem, Long> {
    List<CartItem> findByUser(User user);
    Optional<CartItem> findByUserAndProduct(User user, Product product);
    void deleteByUser(User user);
    void deleteByProduct(Product product);
}
