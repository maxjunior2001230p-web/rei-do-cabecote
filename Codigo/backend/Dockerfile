FROM maven:3.9.9-eclipse-temurin-17 AS build

WORKDIR /app
COPY pom.xml mvnw .mvn/ ./
RUN chmod +x mvnw
RUN ./mvnw -B dependency:go-offline

COPY src ./src
RUN ./mvnw -B clean package -DskipTests

FROM eclipse-temurin:17-jre

WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

ENV JAVA_OPTS=""
EXPOSE 8080
ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar app.jar"]