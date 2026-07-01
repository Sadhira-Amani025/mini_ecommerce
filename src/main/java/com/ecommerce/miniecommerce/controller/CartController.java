package com.ecommerce.miniecommerce.controller;

import com.ecommerce.miniecommerce.model.CartItem;
import com.ecommerce.miniecommerce.model.User;
import com.ecommerce.miniecommerce.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    @Autowired
    private CartService cartService;

    @GetMapping
    public ResponseEntity<List<CartItem>> getCart(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(cartService.getCartItems(user));
    }

    @PostMapping("/add")
    public ResponseEntity<?> addToCart(@AuthenticationPrincipal User user, @RequestBody AddCartRequest request) {
        try {
            CartItem item = cartService.addToCart(user, request.getProductId(), request.getQuantity());
            return ResponseEntity.ok(item);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PutMapping("/update/{cartItemId}")
    public ResponseEntity<?> updateQuantity(@AuthenticationPrincipal User user,
                                           @PathVariable Long cartItemId,
                                           @RequestBody Map<String, Integer> requestBody) {
        try {
            Integer quantity = requestBody.get("quantity");
            if (quantity == null) {
                throw new RuntimeException("Quantity is required");
            }
            CartItem item = cartService.updateQuantity(user, cartItemId, quantity);
            return ResponseEntity.ok(item != null ? item : "Item removed");
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @DeleteMapping("/remove/{cartItemId}")
    public ResponseEntity<?> removeFromCart(@AuthenticationPrincipal User user, @PathVariable Long cartItemId) {
        try {
            cartService.removeFromCart(user, cartItemId);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Item removed successfully!");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @DeleteMapping("/clear")
    public ResponseEntity<?> clearCart(@AuthenticationPrincipal User user) {
        try {
            cartService.clearCart(user);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Cart cleared successfully!");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    // Static request DTO
    public static class AddCartRequest {
        private Long productId;
        private Integer quantity;

        public Long getProductId() {
            return productId;
        }

        public void setProductId(Long productId) {
            this.productId = productId;
        }

        public Integer getQuantity() {
            return quantity;
        }

        public void setQuantity(Integer quantity) {
            this.quantity = quantity;
        }
    }
}
