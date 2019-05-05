FROM jetty:9.4.9-alpine

EXPOSE 8080
EXPOSE 8443

USER root

ARG ARTIFACT

ADD ${ARTIFACT} ${JETTY_BASE}/webapps/
RUN chown -R jetty:jetty ${JETTY_BASE}/webapps

COPY startup.sh .
RUN chmod 744 startup.sh

ENTRYPOINT [ "./startup.sh" ]