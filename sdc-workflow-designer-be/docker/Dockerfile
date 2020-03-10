FROM openjdk:8-jdk-alpine

EXPOSE 8080

USER root 
RUN addgroup -g 1000 sdc && adduser -S -u 1000 -G sdc -s /bin/sh sdc

ARG ARTIFACT

ADD --chown=sdc:sdc ${ARTIFACT} /app.jar

COPY --chown=sdc:sdc org.onap.sdc.p12 /keystore
COPY --chown=sdc:sdc org.onap.sdc.trust.jks /truststore

COPY --chown=sdc:sdc startup.sh .
RUN chmod 744 startup.sh
 
RUN mkdir /var/log/ONAP/
RUN chown sdc:sdc /var/log/ONAP/

USER sdc
ENTRYPOINT [ "./startup.sh" ]
