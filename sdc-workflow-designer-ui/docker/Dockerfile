FROM jetty:9.4.31-jre11-slim

EXPOSE 8080
EXPOSE 8443

USER root

ARG ARTIFACT

COPY org.onap.sdc.p12 org.onap.sdc.trust.jks ${JETTY_BASE}/etc/
COPY rewrite-root-to-workflows.xml ${JETTY_BASE}/etc/

ADD --chown=jetty:jetty ${ARTIFACT} ${JETTY_BASE}/webapps/
RUN chown -R jetty:jetty ${JETTY_BASE}/webapps ${JETTY_BASE}/etc/

COPY --chown=jetty:jetty startup.sh .
RUN chmod 744 startup.sh

USER jetty
ENTRYPOINT [ "./startup.sh" ]
