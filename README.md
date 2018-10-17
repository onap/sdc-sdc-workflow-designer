# Introduction

Workflow Designer is a service that allows a user to design a workflow, save it, and attach it to an SDC service as
an artifact. The workflow service also manages the definitions of activities that can be later used as parts of 
designed workflows.

The designer has been developed as an [SDC plugin](https://wiki.onap.org/display/DW/Generic+Designer+Support). 
It can also be run as a standalone application, but with limited functionality.

# Main Components

The designer is comprised of the following deployment units:

- Designer backend is the core component. It exposes RESTful APIs for managing workflow and activity data. The backend
is agnostic to the type of workflow artifacts &mdash; its main concern is workflow inputs, outputs, and metadata.
 
- Designer frontend serves static content of a Web application for creating and managing workflows, and forwards API 
requests to the backend. The static content include JavaScript, images, CSS, etc. A major part of the Web application 
is the Workflow Composition View &mdash; a graphical interface for arranging workflow sequences. It also produces a 
workflow artifact that will be sent to the backend and later used by a service. The architecture 
allows for different implementations of the frontend component. For example, a different technology can be used for the 
Composition View, which will probably also result in a different type of workflow artifacts.

- Cassandra database is used as main storage for workflow data by the designer backend. A dedicated instance of 
Cassandra can be deployed, or an existing cluster may be used.

- Database initialization scripts run once to create necessary Cassandra keyspaces and tables, pre-populate data, etc.     

# Manual Deployment on Docker

## 1.

## 2. Initialize Workflow Database

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

## 3. Start Backend

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

## 4. Starting Frontend

# As SDC Plugin