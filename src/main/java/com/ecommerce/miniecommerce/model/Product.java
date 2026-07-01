package com.ecommerce.miniecommerce.model;

import javax.persistence.*;

@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String category;

    @Column(nullable = false)
    private Double price;

    @Column(nullable = false)
    private String imageUrl;   // ✅ FIXED
    @Column(name = "public_id")
    private String publicId;

    
    public Product() {}

    public Product(String name, String category, Double price, String imageUrl) {
        this.name = name;
        this.category = category;
        this.price = price;
        this.imageUrl = imageUrl;
    }

    // getters & setters

    public Long getId() { return id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getPublicId() {
    return publicId;
    }

    public void setPublicId(String publicId) {
    this.publicId = publicId;
     }
}