FROM jetty:9.4.9-alpine

EXPOSE 8080
EXPOSE 8443

USER root

ARG ARTIFACT

COPY org.onap.sdc.p12 org.onap.sdc.trust.jks /etc/sdc-cert/

ADD ${ARTIFACT} ${JETTY_BASE}/webapps/
RUN chown -R jetty:jetty ${JETTY_BASE}/webapps /etc/sdc-cert

COPY startup.sh .
RUN chmod 744 startup.sh

ENTRYPOINT [ "./startup.sh" ]
