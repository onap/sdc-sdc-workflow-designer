#!/bin/sh

is_cs_unauthenticated=1
FALSE=0
if [[ -z "${CS_AUTHENTICATE}" || "${CS_AUTHENTICATE}" == "false" ]]; then
	is_cs_unauthenticated=$FALSE
fi

if [ $is_cs_unauthenticated -eq $FALSE ]; then
	echo "Establishing unsecured connection to Cassandra"
fi

if [[ $is_cs_unauthenticated -eq 1 &&  -z "${CS_USER}" ]]; then
	echo "CS_USER environment variable must be set"
	exit 1
fi

if [[ $is_cs_unauthenticated -eq 1 &&  -z "${CS_PASSWORD}" ]]; then
	echo "CS_PASSWORD environment variable must be set"
	exit 1
fi

if [[ -z "${CS_HOST}" ]]; then
	echo "CS_HOST environment variable must be set"
	exit 1
fi

if [ $is_cs_unauthenticated -eq 1 ]; then
    cqlsh -u ${CS_USER} -p ${CS_PASSWORD} -f /create_workflow_db.cql ${CS_HOST} ${CS_PORT}
else
    cqlsh -f /create_workflow_db.cql ${CS_HOST} ${CS_PORT}
fi

