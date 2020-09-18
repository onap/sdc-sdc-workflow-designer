FROM onap/integration-java11:7.1.0

EXPOSE 8080

USER root
ARG ARTIFACT

ADD --chown=onap:onap ${ARTIFACT} /app.jar

COPY --chown=onap:onap org.onap.sdc.p12 /keystore
COPY --chown=onap:onap org.onap.sdc.trust.jks /truststore

COPY --chown=onap:onap startup.sh .
RUN chmod 744 startup.sh
 
RUN mkdir /var/log/ONAP/
RUN chown onap:onap /var/log/ONAP/

USER onap
ENTRYPOINT [ "./startup.sh" ]
