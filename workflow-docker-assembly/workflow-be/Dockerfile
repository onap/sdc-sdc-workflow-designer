FROM openjdk:8-jdk-alpine

EXPOSE 8080
EXPOSE 8443
EXPOSE 5005

USER root

RUN mkdir -p /etc/onap/workflow/be
RUN mkdir -p /var/log/onap/workflow/be

ENV CONFIG_FILES_DIR /etc/onap/workflow/be
ENV LOGS_DIR /var/log/onap/workflow/be

COPY workflow-be-*.jar workflow-be.jar

ENTRYPOINT exec java -jar /workflow-be.jar --spring.config.location=file:${CONFIG_FILES_DIR}/config/