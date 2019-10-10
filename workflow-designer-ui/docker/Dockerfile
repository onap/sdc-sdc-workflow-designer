FROM jetty:9.4-jre8-alpine

EXPOSE 8080
EXPOSE 8443

USER root

ARG ARTIFACT

COPY org.onap.sdc.p12 org.onap.sdc.trust.jks ${JETTY_BASE}/etc/

ADD ${ARTIFACT} ${JETTY_BASE}/webapps/
RUN chown -R jetty:jetty ${JETTY_BASE}/webapps ${JETTY_BASE}/etc/

COPY startup.sh .
RUN chmod 744 startup.sh

ENTRYPOINT [ "./startup.sh" ]
