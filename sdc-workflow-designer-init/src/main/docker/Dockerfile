FROM python:3.12-alpine

RUN pip install cassandra-driver==3.29.2 cqlsh==6.2.0

RUN addgroup -g 1000 sdc && adduser -S -u 1000 -G sdc -s /bin/sh sdc
USER sdc
RUN mkdir ~/.cassandra/ && \
    echo  '[cql]' > ~/.cassandra/cqlshrc  && \
    echo  'version=3.4.4' >> ~/.cassandra/cqlshrc

USER root
COPY create_keyspaces.cql create_tables.cql start.sh ./
RUN chown sdc:sdc create_keyspaces.cql && \
    chown sdc:sdc create_tables.cql && \
    chown sdc:sdc start.sh && \
    chmod 744 start.sh

USER sdc
ENTRYPOINT ["./start.sh"]
