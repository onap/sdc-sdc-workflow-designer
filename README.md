# Steps to run the Workflow application on Docker

## 1. Initialize Workflow Database

`docker run -d -e CS_AUTHENTICATE={CS_AUTHENTICATE} -e CS_HOST={HOST} -e CS_PORT={PORT} -e CS_USER={USER} 
-e CS_PASSWORD={PASSWORD} {INIT_IMAGE}`

This is done only once to initialize the DB schema.

**Example** 

running docker with secured Cassandra DB

`docker run -d -e CS_HOST=10.247.41.19 -e CS_AUTHENTICATE=true -e CS_USER=test -e CS_PASSWORD=secret -e CS_PORT=9160 
onap/workflow-init:latest`

running docker with unsecured Cassandra DB

`docker run -d -e CS_HOST=10.247.41.19 -e CS_AUTHENTICATE=false -e CS_PORT=9160 onap/workflow-init:latest`

or

`docker run -d -e CS_HOST=10.247.41.19 -e CS_PORT=9160 onap/workflow-init:latest`

## 2. Start Backend

`docker run -d -e JAVA_OPTIONS={JAVA_OPTIONS} -e CS_HOSTS={COMMA_SEPARATED_HOSTS} -e CS_PORT={PORT} 
-e CS_USER={USER} -e CS_PASSWORD={PASSWORD} -p {HOST_PORT}:{APPLICATION_PORT} {BACKEND_IMAGE}`

or, if Cassandra authentication is not required

`docker run -d -e JAVA_OPTIONS={JAVA_OPTIONS} -e CS_HOSTS={COMMA_SEPARATED_HOSTS} -e CS_PORT={PORT} 
-e CS_AUTHENTICATE=false -p {HOST_PORT}:{APPLICATION_PORT} {BACKEND_IMAGE}`

**optional parameters**

For posting workflow artifact to external API

`-e SDC_PROTOCOL={SDC_PROTOCOL} -e SDC_ENDPOINT={SDC_ENDPOINT}`
SDC_PROTOCOL - HTTP\HTTPS
SDC_ENDPOINT - <IP>:<PORT>

The server listens on 8080 by default, but it is possible to change the application port by passing 
`-e SERVER_PORT={PORT}` to Docker _run_ command.

To check health information of application you can use option `-e SHOW_HEALTH={always}`

**Example**

`docker run -d -e JAVA_OPTIONS="-Xmx128m -Xms128m -Xss1m" -e CS_HOSTS=10.247.41.19,10.247.41.20 
-e CS_PORT=9042 -e CS_AUTHENTICATE=false -p 8080:8080 onap/workflow-backend:latest`