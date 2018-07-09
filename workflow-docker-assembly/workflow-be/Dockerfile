FROM openjdk:8-jdk-alpine

EXPOSE 8080
EXPOSE 8443
EXPOSE 5000

USER root

RUN mkdir -p /etc/onap/workflow/be
RUN mkdir -p /var/log/onap/workflow/be

ENV CONFIG_FILES_DIR /etc/onap/workflow/be
ENV LOGS_DIR /var/log/onap/workflow/be

COPY workflow-be-*.jar app.jar

ENTRYPOINT ["java","-Djava.security.egd=file:/dev/./urandom -Dspring.config.location=${CONFIG_FILES_DIR}/config","-jar","/app.jar"]