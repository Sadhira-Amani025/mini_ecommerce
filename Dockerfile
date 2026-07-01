# Step 1: Build the JAR using Maven
FROM maven:3.8.8-eclipse-temurin-17 AS build
WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests

# Stage 2: Create the execution image using Eclipse Temurin JRE 17
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
COPY --from=build /app/target/miniecommerce-0.0.1-SNAPSHOT.jar app.jar
COPY uploads/ uploads/

# Expose port and start the application
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]
