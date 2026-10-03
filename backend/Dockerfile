# Build stage
FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /build
COPY pom.xml .
RUN mvn -B -q dependency:go-offline
COPY src ./src
RUN mvn -B -q -DskipTests package

# Runtime stage — slim for Render free (512 MB). Office→PDF previews need LibreOffice on a larger plan.
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

RUN mkdir -p /app/data/notes /app/data/payment-proofs

COPY --from=build /build/target/*.jar /app/app.jar

ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0"

EXPOSE 6543

CMD ["sh", "-c", "java $JAVA_OPTS -jar /app/app.jar"]
