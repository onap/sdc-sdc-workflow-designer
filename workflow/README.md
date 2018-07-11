# Steps to run the Workflow application on Docker

## 1. Initialize Workflow Database

`docker run -d -e CS_HOST={HOST} -e CS_PORT={PORT} -e CS_USER={USER} -e CS_PASSWORD={PASSWORD} {INIT_IMAGE}`

This is done only once to initialize the DB schema.

**Example** 

`docker run -d -e CS_HOST=10.247.41.19 -e CS_USER=test -e CS_PASSWORD=secret -e CS_PORT=9160 onap/workflow-init:latest`

## 2. Start Backend

`docker run -d -e JAVA_OPTIONS="-Xmx128m -Xms128m -Xss1m" -e CS_HOSTS={COMMA_SEPARATED_HOSTS} -e CS_PORT={PORT} 
-e CS_USER={USER} -e CS_PASSWORD={PASSWORD} {BACKEND_IMAGE}`

or, if Cassandra authentication is not required

`docker run -d -e JAVA_OPTIONS="-Xmx128m -Xms128m -Xss1m" -e CS_HOSTS={COMMA_SEPARATED_HOSTS} -e CS_PORT={PORT} 
-e CS_AUTHENTICATE=false {BACKEND_IMAGE}`

The server listens on 8080 by default, but it is possible to change the application port by passing 
`-e SERVER_PORT={PORT}` to Docker _run_ command.

**Example**

`docker run -d -e CS_HOST=10.247.41.19,10.247.41.20 -e CS_AUTHENTICATE=false -e CS_PORT=9160 
onap/workflow-backend:latest`