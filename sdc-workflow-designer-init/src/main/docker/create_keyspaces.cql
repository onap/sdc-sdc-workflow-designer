CREATE KEYSPACE IF NOT EXISTS WORKFLOW
WITH DURABLE_WRITES = TRUE
AND REPLICATION = {
	'class' : 'SimpleStrategy',
	'replication_factor' : 1
};

CREATE KEYSPACE IF NOT EXISTS ZUSAMMEN_WORKFLOW
WITH REPLICATION = {
	'class' : 'SimpleStrategy',
	'replication_factor' : 1
};
