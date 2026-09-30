FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8082

# Note: Cloud platforms (Render, Railway, ECS, Kubernetes) manage container health
# checks via external HTTP probes configured against /actuator/health.
ENTRYPOINT ["sh", "-c", "exec java -Djava.security.egd=file:/dev/./urandom -jar app.jar"]
