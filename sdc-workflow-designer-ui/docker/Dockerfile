ARG JETTY_VERSION
FROM jetty:${JETTY_VERSION}-jdk17-alpine

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
RUN java -jar "${JETTY_HOME}/start.jar" --add-modules=ee8-deploy,rewrite && \
    printf '%s\n' 'etc/rewrite-root-to-workflows.xml' > "${JETTY_BASE}/start.d/workflow.ini"
ENTRYPOINT [ "./startup.sh" ]
