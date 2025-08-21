FROM eclipse-temurin:11-alpine

EXPOSE 8080

USER root
ARG ARTIFACT

ARG user=onap
ARG group=onap

RUN addgroup -S $group && adduser -G $group -D $user && \
    mkdir /var/log/$user && \
    mkdir /app && \
    chown -R $user:$group /var/log/$user && \
    chown -R $user:$group /app

ADD --chown=onap:onap ${ARTIFACT} /app.jar

COPY --chown=onap:onap org.onap.sdc.p12 /keystore
COPY --chown=onap:onap org.onap.sdc.trust.jks /truststore

COPY --chown=onap:onap startup.sh .
RUN chmod 744 startup.sh

USER onap
ENTRYPOINT [ "./startup.sh" ]
