package com.ecommerce.miniecommerce.controller;

import com.ecommerce.miniecommerce.model.Product;
import com.ecommerce.miniecommerce.model.User;
import com.ecommerce.miniecommerce.service.ProductService;
import com.ecommerce.miniecommerce.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.web.multipart.MultipartFile;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private UserService userService;

    @Autowired
    private ProductService productService;

    @Autowired
private Cloudinary cloudinary;


    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @PostMapping("/products")
public ResponseEntity<?> addProduct(
        @RequestParam("name") String name,
        @RequestParam("category") String category,
        @RequestParam("price") Double price,
        @RequestParam(value = "imageFile", required = false) MultipartFile file
) {
  System.out.println("FILE RECEIVED: " + 
        (file != null ? file.getOriginalFilename() : "NULL"));
    try {

       String imageUrl = null;
String publicId = null;

if (file != null && !file.isEmpty()) {
    Map<String, String> uploadResult = uploadImage(file);
    imageUrl = uploadResult.get("url");
    publicId = uploadResult.get("publicId");
} 
else if (category != null && category.trim().equalsIgnoreCase("Stationery")) {
    imageUrl = "/uploads/stationery_default.png";
} else {
    imageUrl = "/uploads/book_default.png";
}

        Product product = new Product();
        product.setName(name);
        product.setCategory(category);
        product.setPrice(price);
        product.setImageUrl(imageUrl);
        product.setPublicId(publicId);

// 🔥 DEBUG LOGS (ADD HERE)


 // ✅ IMPORTANT FIX

        Product savedProduct = productService.saveProduct(product);
        return ResponseEntity.ok(savedProduct);

    } catch (Exception e) {
    e.printStackTrace();

    Map<String, String> response = new HashMap<>();
    response.put("message", e.getClass().getName() + " : " + e.getMessage());
    return ResponseEntity.badRequest().body(response);
}
}

    @PutMapping("/products/{id}")
public ResponseEntity<?> updateProduct(
        @PathVariable Long id,
        @RequestParam("name") String name,
        @RequestParam("category") String category,
        @RequestParam("price") Double price,
        @RequestParam(value = "imageFile", required = false) MultipartFile file
) {

    try {

        Product product = productService.getProductById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));

        product.setName(name);
        product.setCategory(category);
        product.setPrice(price);

        // ✅ IMAGE HANDLING (CLOUDINARY ONLY)
       
            if (file != null && !file.isEmpty()) {
    Map<String, String> uploadResult = uploadImage(file);
    product.setImageUrl(uploadResult.get("url"));
    product.setPublicId(uploadResult.get("publicId"));
}
        

        // ✅ OPTIONAL: if no new image, keep old one (DO NOTHING)
        // no need for default uploads logic anymore

        Product updatedProduct = productService.saveProduct(product);
        return ResponseEntity.ok(updatedProduct);

    } catch (Exception e) {
    e.printStackTrace();

    Map<String, String> response = new HashMap<>();
    response.put("message", e.getClass().getName() + " : " + e.getMessage());
    return ResponseEntity.badRequest().body(response);
}
}

public Map<String, String> uploadImage(MultipartFile file) {
    try {
        Map result = cloudinary.uploader()
                .upload(file.getBytes(), ObjectUtils.emptyMap());

        Map<String, String> response = new HashMap<>();
        response.put("url", result.get("secure_url").toString());
        response.put("publicId", result.get("public_id").toString());

        return response;

    } catch (Exception e) {
        throw new RuntimeException("Image upload failed", e);
    }
}



   

@DeleteMapping("/products/{id}")
public ResponseEntity<?> deleteProduct(@PathVariable Long id) {

    productService.deleteProduct(id);

    Map<String, String> response = new HashMap<>();
    response.put("message", "Product deleted successfully!");
    return ResponseEntity.ok(response);
}
}
