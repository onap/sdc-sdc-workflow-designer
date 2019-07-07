FROM openjdk:8-jdk-alpine

EXPOSE 8080

USER root

ARG ARTIFACT

ADD ${ARTIFACT} /app.jar

COPY startup.sh .
RUN chmod 744 startup.sh

COPY keystore /
COPY truststore /

ENTRYPOINT [ "./startup.sh" ]