# Introduction

Workflow Designer is a service that allows a user to design a workflow, save it, and attach it to an SDC service as
an artifact. The workflow service also manages the definitions of activities that can be later used as parts of 
designed workflows.

The designer has been developed as an [SDC plugin](https://wiki.onap.org/display/DW/Generic+Designer+Support), 
but can also be run as a standalone application (although with limited functionality).




# Components

The designer is comprised of the following deployment units:

- Designer backend is the core component. It exposes RESTful APIs for managing workflow and activity data. The backend
is agnostic to the type of a workflow artifact &mdash; its main concerns are workflow inputs and outputs, and metadata.
 
- Designer frontend serves static content of a Web application for creating and managing workflows, and forwards API 
requests to the backend. The static content includes JavaScript, images, CSS, etc. A major part of the Web application 
is Workflow Composition View &mdash; a graphical interface for arranging a workflow sequence. The Web application also produces a 
workflow artifact that will be sent to the backend, saved along with other data, and later used by a service. The architecture 
allows for different implementations of the frontend component. For example, a different technology can be used for the 
Composition View, which will probably also result in a different type of the artifacts (e.g. Bpmn.io vs. Camunda).

- Cassandra database is used by the designer backend as the main storage for workflow data. A dedicated instance of 
Cassandra can be deployed, or an existing cluster may be used.

- Database initialization scripts run once per deployment to create the necessary Cassandra keyspaces and tables, pre-populate data, etc.     

# Deployment on Docker

The procedure below describes manual deployment on plain Docker for development or a demo.

## 1. Database

Create a dedicated instance of Cassandra. This step is optional if you already have a Cassandra cluster.
The designer is not expected to have problems working with Cassandra 3.x, but has been tested with 2.1.x because this is the version used by 
SDC.

### Example

`docker run -d --name workflow-cassandra cassandra:2.1` 

## 2. Database Initialization

**WARNING**: *This step must be executed only once.* 

`docker run -d -e CS_HOST=<cassandra-host> -e CS_PORT=<cassandra-port> -e CS_AUTHENTICATE=true/false
-e CS_USER=<cassandra-user> -e CS_PASSWORD=<cassandra-password> nexus3.onap.org:10001/onap/workflow-init:latest`

### Environment Variables

- CS_HOST &mdash; Cassandra hostname or IP address.

- CS_PORT &mdash; Cassandra port. If not specified, the default of 9042 will be used.

- CS_AUTHENTICATE &mdash; whether password authentication must be used to connect to Cassandra. A *false* will be 
assumed if this variable is not specified.

- CS_USER &mdash; Cassandra username if CS_AUTHENTICATE is *true*.

- CS_PASSWORD &mdash; Cassandra password if CS_AUTHENTICATE is *true*.

### Example

Assuming you have created a dedicated Cassandra container as described in Database section, and the access to it is not 
protected with a password, the following command will initialize the database:

`docker run -d -e CS_HOST=$(docker inspect workflow-cassandra --format={{.NetworkSettings.IPAddress}})  
nexus3.onap.org:10001/onap/workflow-init:latest`

## 3. Backend

`docker run -d -e CS_HOSTS=<cassandra-hosts> -e CS_PORT=<cassandra-port> -e CS_AUTHENTICATE=true/false
-e CS_USER=<cassandra-user> -e CS_PASSWORD=<cassandra-password> -e JAVA_OPTIONS=<jvm-options> 
nexus3.onap.org:10001/onap/workflow-backend:latest`

### Environment Variables

- CS_HOSTS &mdash; comma-separated list of Cassandra hostnames or IP addresses.

- CS_PORT &mdash; Cassandra port. If not specified, the default of 9042 will be used.

- CS_AUTHENTICATE &mdash; whether password authentication must be used to connect to Cassandra. A *false* will be 
assumed if this variable is not specified.

- CS_USER &mdash; Cassandra username if CS_AUTHENTICATE is *true*.

- CS_PASSWORD &mdash; Cassandra password if CS_AUTHENTICATE is *true*.

- JAVA_OPTIONS &mdash; optionally, JVM (Java Virtual Machine) arguments.

### Example

Assuming you have a dedicated Cassandra container as described in Database section, and the access to it is not 
protected with a password. The following command will start a backend container:

`docker run -d --name workflow-backend -e CS_HOST=$(docker inspect workflow-cassandra 
--format={{.NetworkSettings.IPAddress}}) -e JAVA_OPTIONS="-Xmx128m -Xms128m -Xss1m" 
nexus3.onap.org:10001/onap/workflow-backend:latest`

## 4. Frontend

`docker run -d -e BACKEND=http://<backend-host>:<backend-port> -e JAVA_OPTIONS=<jvm-options>
nexus3.onap.org:10001/onap/workflow-frontend:latest`

- BACKEND &mdash; root endpoint of the RESTful APIs exposed by a workflow backend server.

- JAVA_OPTIONS &mdash; optionally, JVM (Java Virtual Machine) arguments.

### Example

`docker run -d --name workflow-frontend 
-e BACKEND=http://$(docker inspect workflow-backend --format={{.NetworkSettings.IPAddress}}):8080 
-e JAVA_OPTIONS="-Xmx64m -Xms64m -Xss1m" -p 9088:8080 nexus3.onap.org:10001/onap/workflow-frontend:latest`

Notice that port 8080 of the frontend container has been 
[mapped]( https://docs.docker.com/config/containers/container-networking/#published-ports) to port 9088 of the host 
machine. This makes the Workflow Designer Web application accessible from the outside world via the host machine's 
IP address/hostname.

# As SDC Plugin

In order to run as an SDC pluggable designer, Workflow Designer must be added to SDC configuration as described in
[Generic plugin support](https://wiki.onap.org/display/DW/Generic+Designer+Support). 

If you are deploying SDC using a standard procedure (OOM or the 
[SDC shell script](https://wiki.onap.org/display/DW/Deploying+SDC+on+a+Linux+VM+for+Development)), 
the easiest way to configure the Workflow plugin is to edit the *default_attributes/Plugins/WORKFLOW* 
section of *AUTO.json*.

### Plugin Source

The main endpoint to load Workflow Designer Web application is defined by `"pluginSourceUrl": "http://<host>:<port>"`.

Keep in mind that the URL **must be accessible from a user's browser**. In most cases, `<host>` will be the hostname or
IP address of the machine that runs Docker engine, and `<port>` will be a host port to which you have published port 
8080 of the Workflow frontend container.

### Plugin Discovery

In order to check the availability of a plugin, SDC uses `"pluginDiscoveryUrl"`. For Workflow the value is 
`http://<host>:<port>/ping`.

### Example

Let's assume that hostname of the machine that runs Docker containers with the Workflow application is 
*workflow.example.com*, and port 8080 of the Workflow frontend is mapped to 9088 on the host. In this case the corresponding 
section of *AUTO.json* will look like below:

```
"Plugins": {
    "WORKFLOW": {
        "workflow_discovery_url": "http://workflow.example.com:9088/ping",
        "workflow_source_url": "http://workflow.example.com:9088"
    }
},
```
