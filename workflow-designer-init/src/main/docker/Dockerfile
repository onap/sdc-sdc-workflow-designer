FROM python:2.7-alpine3.8

RUN pip install cqlsh==4.0.1

COPY create_keyspaces.cql create_tables.cql start.sh ./

RUN chmod 744 start.sh

ENTRYPOINT ["./start.sh"]