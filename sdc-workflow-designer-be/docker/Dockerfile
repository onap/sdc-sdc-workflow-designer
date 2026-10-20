FROM eclipse-temurin:17-jre-alpine

EXPOSE 8080

ARG ARTIFACT

RUN addgroup -g 101 -S onap && \
    adduser -S -u 1000 -G onap -h /home/onap onap && \
    mkdir -p /app && \
    chown onap:onap /app

WORKDIR /app

ADD --chown=onap:onap ${ARTIFACT} /app.jar

COPY --chown=onap:onap org.onap.sdc.p12 /keystore
COPY --chown=onap:onap org.onap.sdc.trust.jks /truststore

COPY --chown=onap:onap startup.sh .
RUN chmod 744 startup.sh

USER onap
ENTRYPOINT [ "./startup.sh" ]
