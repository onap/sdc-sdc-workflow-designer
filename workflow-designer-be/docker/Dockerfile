FROM openjdk:8-jdk-alpine

EXPOSE 8080

USER root

ARG ARTIFACT

ADD ${ARTIFACT} /app.jar

COPY org.onap.sdc.p12 /keystore
COPY org.onap.sdc.trust.jks /truststore

COPY startup.sh .
RUN chmod 744 startup.sh

ENTRYPOINT [ "./startup.sh" ]