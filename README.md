# StellarStore - Mini E-Commerce Website for Books and Stationery

A complete, responsive, and visually stunning Mini E-Commerce Website built using **Spring Boot (Backend)**, **MySQL (Database)**, and **HTML/CSS/JavaScript (Frontend)**. This project features a modern glassmorphism design, secure JWT-based authentication, dynamic search, shopping cart management, and a comprehensive admin panel.

---

## 🚀 Tech Stack
- **Backend:** Spring Boot 2.7.18 (compatible with Java 8/1.8+)
- **Database:** MySQL / MariaDB (configured for XAMPP default settings)
- **Security:** Spring Security & JWT (JSON Web Tokens) with BCrypt password encryption
- **Frontend:** Responsive HTML5, Vanilla CSS3 (Glassmorphic variables & tokens, custom transitions, animations), Vanilla JavaScript (ES6, Fetch API)
- **Icons:** Font Awesome 6.4.0

---

## 📦 Project Directory Structure
```
d:\mini ecommerce
  ├── pom.xml                                 # Maven dependencies and build settings
  ├── README.md                               # Project documentation and setup guides
  ├── uploads/                                # Target directory for product image uploads
  ├── src/
  │   ├── main/
  │   │   ├── java/com/ecommerce/miniecommerce/
  │   │   │   ├── MiniEcommerceApplication.java  # Main app launcher
  │   │   │   ├── config/                     # Configurations (Security, MVC mapping, Data seeding)
  │   │   │   ├── controller/                 # REST controllers (Auth, Products, Cart, Admin)
  │   │   │   ├── model/                      # JPA Entities (User, Product, CartItem, Role)
  │   │   │   ├── repository/                 # Database access interfaces
  │   │   │   ├── security/                   # JWT generation and filters
  │   │   │   └── service/                    # Business logic implementations
  │   │   └── resources/
  │   │       ├── application.properties      # Connection strings and file size limits
  │   │       └── static/                     # Frontend Static Resources
  │   │           ├── index.html              # E-Store Home & Search Catalog
  │   │           ├── login.html              # Member & Admin Login Portal
  │   │           ├── register.html           # New Member Registration
  │   │           ├── cart.html               # Shopping Cart Page
  │   │           ├── admin.html              # Admin Inventory & User Dashboard
  │   │           ├── css/style.css           # Premium Glassmorphic stylesheet
  │   │           └── js/                     # AJAX scripts (app.js, admin.js)
```

---

## 🛠️ Step-by-Step Local Setup

### 1. Prerequisites
- **Java Development Kit (JDK) 8** or higher installed.
- **Apache Maven 3.8.x** installed.
- **MySQL / MariaDB** (usually via XAMPP or standalone).

### 2. Database Initialization
1. Start your local MySQL server (e.g. start MySQL inside the XAMPP Control Panel).
2. The database configurations are located in `src/main/resources/application.properties`:
   - Port: `3306`
   - Database name: `mini_ecommerce` (Auto-created on startup)
   - Username: `root`
   - Password: `` (empty by default)
3. The application seeds **default products and users** automatically on startup if the tables are empty.

### 3. Build the Application
Open a terminal in the root directory (`d:\mini ecommerce`) and build the package:
```bash
mvn clean package
```
This generates a standalone executable JAR file: `target/miniecommerce-0.0.1-SNAPSHOT.jar`.

### 4. Run the Server
Run the generated JAR file using Java:
```bash
java -jar target/miniecommerce-0.0.1-SNAPSHOT.jar
```
*Alternatively, run directly via Maven:*
```bash
mvn spring-boot:run
```

### 5. Access the Web App
Open your web browser and navigate to:
```
http://localhost:8080/

```

---

## 🔑 REST API Documentation

### Authentication APIs (`/api/auth`)
- `POST /api/auth/register` - Create a standard user account.
- `POST /api/auth/login` - Verify credentials and obtain JWT token.

### Product Catalog APIs (`/api/products`)
- `GET /api/products` - List all products.
- `GET /api/products/{id}` - Retrieve details of a specific product.
- `GET /api/products/search?q={query}` - Dynamic search by product name.
- `GET /api/products/category/{category}` - Filter products by category (`Books` / `Stationery`).

### Shopping Cart APIs (`/api/cart`) - *Requires JWT Token*
- `GET /api/cart` - View authenticated user's cart items.
- `POST /api/cart/add` - Add an item to the cart (JSON contains `productId`, `quantity`).
- `PUT /api/cart/update/{cartItemId}` - Modify product quantity (JSON contains `quantity`).
- `DELETE /api/cart/remove/{cartItemId}` - Delete an item from the cart.
- `DELETE /api/cart/clear` - Delete all items in the cart (triggered on successful checkout).

### Admin Operations (`/api/admin`) - *Requires Admin JWT Token*
- `GET /api/admin/users` - View all registered accounts.
- `POST /api/admin/products` - Add a new product (supports Multi-part Form Data with image file upload).
- `PUT /api/admin/products/{id}` - Update product details and/or change product image.
- `DELETE /api/admin/products/{id}` - Permanently delete a product.

---

## 🌐 Deployment Instructions

### 1. Deploying to GitHub
1. Create a new repository on GitHub (e.g. `mini-ecommerce-website`).
2. Initialize Git in the project root:
   ```bash
   git init
   ```
3. Create a `.gitignore` file to exclude binary, config, and system files:
   ```
   /target/
   /.mvn/
   /apache-maven-*/
   *.class
   *.jar
   *.zip
   *.log
   .DS_Store
   ```
4. Add and commit all project files:
   ```bash
   git add .
   git commit -m "Initial commit of Mini E-Commerce Website"
   ```
5. Link your local repository to GitHub and push:
   ```bash
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
   git push -u origin main
   ```

### 2. Deploying to Render (Spring Boot + MySQL)

#### A. Set up Render MySQL Database
1. Go to the [Render Dashboard](https://dashboard.render.com/) and click **New** -> **PostgreSQL** or deploy a MySQL instance using a partner like [Aiven](https://aiven.io/) or [Tidb Cloud](https://en.pingcap.com/tidb-cloud/). Alternatively, you can use Render's blueprint or deploy a Dockerized MySQL instance on Render.
2. Retrieve your database credentials: Host, Port, Database Name, Username, and Password.

#### B. Configure Spring Boot for Render
Ensure your `application.properties` uses environment variables so database secrets are not exposed in code:
```properties
spring.datasource.url=jdbc:mysql://${DB_HOST}:${DB_PORT}/${DB_NAME}?useSSL=true
spring.datasource.username=${DB_USER}
spring.datasource.password=${DB_PASSWORD}
```

#### C. Create a Web Service on Render
1. Click **New** -> **Web Service** on Render.
2. Connect your GitHub repository.
3. Set the following build configurations:
   - **Environment:** `Java` or `Docker` (using a standard openjdk base Dockerfile is highly recommended for Java projects).
   - **Build Command (if using Java environment):** `./mvnw clean package -DskipTests` (Ensure you check maven wrapper files into Git).
   - **Start Command:** `java -jar target/miniecommerce-0.0.1-SNAPSHOT.jar`
4. Set Environment Variables in the **Environment** tab:
   - `DB_HOST`: *Your production MySQL host*
   - `DB_PORT`: `3306` (or database port)
   - `DB_NAME`: *Your database name*
   - `DB_USER`: *Your database username*
   - `DB_PASSWORD`: *Your database password*
   - `JWT_SECRET`: *A secure random string (minimum 256-bit)*
5. Click **Deploy Web Service**. Render will build and launch your Spring Boot application!
