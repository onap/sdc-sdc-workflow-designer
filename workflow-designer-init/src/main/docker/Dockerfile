FROM python:2.7-alpine3.8

RUN pip install cqlsh==5.0.4 && \
    mkdir ~/.cassandra/ && \
    echo  '[cql]' > ~/.cassandra/cqlshrc  && \
    echo  'version=3.4.4' >> ~/.cassandra/cqlshrc

COPY create_keyspaces.cql create_tables.cql start.sh ./

RUN chmod 744 start.sh

ENTRYPOINT ["./start.sh"]
