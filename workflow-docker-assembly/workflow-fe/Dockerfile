FROM onap/base_sdc-jetty:1.3.1

USER root

RUN mkdir -p /etc/onap/workflow/fe
RUN mkdir -p /var/log/onap/workflow/fe

ENV CONFIG_FILES_DIR /etc/onap/workflow/fe
ENV LOGS_DIR /var/log/onap/workflow/fe

ARG ARTIFACT_VERSION

## Placebholder for execution instructions