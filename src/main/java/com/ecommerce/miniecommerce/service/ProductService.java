package com.ecommerce.miniecommerce.service;

import com.ecommerce.miniecommerce.model.Product;
import com.ecommerce.miniecommerce.repository.CartRepository;
import com.ecommerce.miniecommerce.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;

@Service
@Transactional
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
private Cloudinary cloudinary;

    public List<Product> getAllProducts() {
        return productRepository.findAllByOrderByIdDesc();
    }

    public List<Product> getProductsByCategory(String category) {
        return productRepository.findByCategoryIgnoreCaseOrderByIdDesc(category);
    }

    public List<Product> searchProducts(String query) {
        return productRepository.findByNameContainingIgnoreCaseOrderByIdDesc(query);
    }

    public Optional<Product> getProductById(Long id) {
        return productRepository.findById(id);
    }

    public Product saveProduct(Product product) {
        return productRepository.save(product);
    }

    public void deleteProduct(Long id) {

    Product product = productRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));

    // 🔥 DELETE IMAGE FROM CLOUDINARY
    if (product.getPublicId() != null && !product.getPublicId().isEmpty()) {
        try {
            cloudinary.uploader()
                    .destroy(product.getPublicId(), com.cloudinary.utils.ObjectUtils.emptyMap());
        } catch (Exception e) {
            System.err.println("Cloudinary delete failed: " + e.getMessage());
        }
    }

    // 🔥 DELETE FROM CART FIRST
    

    // 🔥 DELETE PRODUCT FROM DB
    productRepository.delete(product);
}
    }

