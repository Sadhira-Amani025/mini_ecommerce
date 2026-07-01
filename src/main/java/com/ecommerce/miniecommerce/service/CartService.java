package com.ecommerce.miniecommerce.service;

import com.ecommerce.miniecommerce.model.CartItem;
import com.ecommerce.miniecommerce.model.Product;
import com.ecommerce.miniecommerce.model.User;
import com.ecommerce.miniecommerce.repository.CartRepository;
import com.ecommerce.miniecommerce.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class CartService {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private ProductRepository productRepository;

    public List<CartItem> getCartItems(User user) {
        return cartRepository.findByUser(user);
    }

    public CartItem addToCart(User user, Long productId, Integer quantity) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + productId));

        Optional<CartItem> existingItem = cartRepository.findByUserAndProduct(user, product);

        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            item.setQuantity(item.getQuantity() + quantity);
            return cartRepository.save(item);
        } else {
            CartItem item = new CartItem(user, product, quantity);
            return cartRepository.save(item);
        }
    }

    public CartItem updateQuantity(User user, Long cartItemId, Integer quantity) {
        CartItem cartItem = cartRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        if (!cartItem.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized to modify this cart item");
        }

        if (quantity <= 0) {
            cartRepository.delete(cartItem);
            return null;
        }

        cartItem.setQuantity(quantity);
        return cartRepository.save(cartItem);
    }

    public void removeFromCart(User user, Long cartItemId) {
        CartItem cartItem = cartRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        if (!cartItem.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized to modify this cart item");
        }

        cartRepository.delete(cartItem);
    }

    public void clearCart(User user) {
        cartRepository.deleteByUser(user);
    }
}
