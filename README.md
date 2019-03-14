Introduction
============

Workflow Designer is a [pluggable SDC designer](https://wiki.onap.org/display/DW/Generic+Designer+Support) that allows
a user to design a workflow, save it, and attach it to a SDC service as an artifact. Workflow Designer also manages
the definitions of activities, which can be later used as parts of the designed workflows.

Components
==========

The designer is comprised of the following deployment units:

- Designer backend is the core component. It exposes RESTful APIs for managing workflow and activity data. The backend
is agnostic to the type of a workflow artifact &mdash; its main concerns are workflow inputs and outputs, and metadata.
One of the APIs enables to attach a certified workflow artifact to a SDC service, therefore the designer must be able
to call an API on SDC. In order to do so, the location of a SDC server, and
[SDC consumer](https://wiki.onap.org/display/DW/Consumer+creation) credentials are required.

- Designer frontend serves static content of a Web application for creating and managing workflows, and forwards API
requests to the backend. The static content includes JavaScript, images, CSS, etc. A major part of the Web application
is Workflow Composition View &mdash; a graphical interface for arranging a workflow sequence. The Web application also
produces a workflow artifact that will be sent to the backend, saved along with other data, and later used by a
service. The architecture allows for different implementations of the frontend component. For example, a different
technology can be used for the Composition View, which will probably also result in a different type of the artifacts
(e.g. Bpmn.io vs. Camunda).

- Cassandra database is used by the designer backend as the main storage for workflow data. A dedicated instance of
Cassandra can be deployed, or an existing cluster may be used.

- Database initialization scripts run once per deployment to create the necessary Cassandra keyspaces and tables,
pre-populate data, etc.

Deployment on Docker
====================

The procedure below describes manual deployment on plain Docker for development or a demo.

## 1. Database

Create a dedicated instance of Cassandra. This step is optional if you already have a Cassandra cluster.
The designer is not expected to have problems working with Cassandra 3.x, but has been tested with 2.1.x because this
is the version used by SDC.

An easy way to spin up a Cassandra instance is using a Cassandra Docker image as described in the
[official documentation](https://hub.docker.com/_/cassandra/).

### Example

`docker run -d --name workflow-cassandra cassandra:2.1`

## 2. Database Initialization

**WARNING**: *This step must be executed only once.*

Workflow Designer requires two Cassandra namespaces:

- WORKFLOW
- ZUSAMMEN_WORKFLOW

By default, these keyspaces are configured to use a simple replication strategy (`'class' : 'SimpleStrategy'`)
and the replication factor of one (`'replication_factor' : 1`). In order to override this configuration, override
the *create_keyspaces.cql* file at the root of the initialization container using
[Docker volume mapping](https://docs.docker.com/storage/volumes/). Include `IF NOT EXISTS` clause in the keyspace
creation statements to prevent accidental data loss.

`docker run -ti -e CS_HOST=<cassandra-host> -e CS_PORT=<cassandra-port> -e CS_AUTHENTICATE=true/false
-e CS_USER=<cassandra-user> -e CS_PASSWORD=<cassandra-password> nexus3.onap.org:10001/onap/workflow-init:latest`

### Environment Variables

- CS_HOST &mdash; Cassandra hostname or IP address.

- CS_PORT &mdash; Cassandra Thrift client port. If not specified, the default of 9160 will be used.

- CS_AUTHENTICATE &mdash; whether password authentication must be used to connect to Cassandra. A *false* will be
assumed if this variable is not specified.

- CS_USER &mdash; Cassandra username if CS_AUTHENTICATE is *true*.

- CS_PASSWORD &mdash; Cassandra password if CS_AUTHENTICATE is *true*.

### Example

Assuming you have created a dedicated Cassandra container as described in Database section, and the access to it is not
protected with a password, the following command will initialize the database:

`docker run -d --name workflow-init
-e CS_HOST=$(docker inspect workflow-cassandra --format={{.NetworkSettings.IPAddress}})
nexus3.onap.org:10001/onap/workflow-init:latest`

### Troubleshooting

In order to see if the Workflow Designer was successfully initialized, make sure the console does not contain error
messages. You can also see the logs of the initialization container using `docker logs workflow-init` command.

## 3. Backend

`docker run -d -e SDC_PROTOCL=http/https -e SDC_ENDPOINT=<sdc-host>:<sdc-port> -e SDC_USER=<sdc-username>
-e SDC_PASSWORD=<sdc-password> -e CS_HOSTS=<cassandra-hosts> -e CS_PORT=<cassandra-port>
-e CS_AUTHENTICATE=true/false -e CS_USER=<cassandra-user> -e CS_PASSWORD=<cassandra-password>
-e CS_SSL_ENABLED=true/false -e CS_TRUST_STORE_PATH=<cassandra-truststore-path> 
-e CS_TRUST_STORE_PASSWORD=<cassandra-truststore-password> -e SERVER_SSL_ENABLED=true/false 
-e SERVER_SSL_KEY_PASSWORD=<ssl_key_password> -e SERVER_SSL_KEYSTORE_PATH=<ssl_keystore_path> 
-e SERVER_SSL_KEYSTORE_TYPE=<ssl_keystore_type> -e JAVA_OPTIONS=<jvm-options> 
nexus3.onap.org:10001/onap/workflow-backend:latest`

### Environment Variables

- SDC_PROTOCOL &mdash; protocol to be used for calling SDC APIs (http or https).

- SDC_ENDPOINT &mdash; the base path of SDC external API, in the format `host:port`, where *host* is a SDC backend
server, and *port* is usually 8080.

- SDC_USER &mdash; Workflow consumer username

- SDC_PASSWORD &mdash; Workflow consumer password

- CS_HOSTS &mdash; comma-separated list of Cassandra hostnames or IP addresses.

- CS_PORT &mdash; CQL native client port. If not specified, the default of 9042 will be used.

- CS_AUTHENTICATE &mdash; whether password authentication must be used to connect to Cassandra. A *false* will be
assumed if this variable is not specified.

- CS_USER &mdash; Cassandra username if CS_AUTHENTICATE is *true*.

- CS_PASSWORD &mdash; Cassandra password if CS_AUTHENTICATE is *true*.

- CS_SSL_ENABLED &mdash; whether ssl authentication must be used to connect to Cassandra. A *false* will be
assumed if this variable is not specified.

- CS_TRUST_STORE_PATH &mdash; Cassandra Truststore path if CS_SSL_ENABLED is *true*.

- CS_TRUST_STORE_PASSWORD &mdash; Cassandra Truststore password if CS_SSL_ENABLED is *true*.

- SERVER_SSL_ENABLED &mdash; whether ssl authentication must be used to connect to application. A *false* will be
assumed if this variable is not specified.

- SERVER_SSL_KEY_PASSWORD &mdash; SSL key password if SERVER_SSL_ENABLED is *true*.

- SERVER_SSL_KEYSTORE_PATH &mdash; SSL Keystore path if SERVER_SSL_ENABLED is *true*.

- SERVER_SSL_KEYSTORE_TYPE &mdash; SSL Keystore type if SERVER_SSL_ENABLED is *true*.

- JAVA_OPTIONS &mdash; optionally, JVM (Java Virtual Machine) arguments.

### Example

Assuming you have a dedicated Cassandra container as described in Database section, and the access to it is not
protected with a password. The following command will start a backend container without SSL support:

`docker run -d --name workflow-backend -e SDC_PROTOCOL=http
-e SDC_ENDPOINT=$(docker inspect sdc-BE --format={{.NetworkSettings.IPAddress}}):8080
-e CS_HOSTS=$(docker inspect workflow-cassandra --format={{.NetworkSettings.IPAddress}})
-e SDC_USER=workflow -e SDC_PASSWORD=<secret> -e JAVA_OPTIONS="-Xmx128m -Xms128m -Xss1m"
nexus3.onap.org:10001/onap/workflow-backend:latest`

### Troubleshooting

In order to verify that the Workflow Designer backend has started successfully, check the logs of the
backend container. For example, by running `docker logs workflow-backend`. The logs must not contain any
error messages.

Application logs are located in the */var/log/ONAP/workflow-designer/backend* directory of a workflow backend
container. For example, you can view the audit log by running
`docker exec -ti workflow-backend less /var/log/ONAP/workflow-designer/backend/audit.log`.

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

### Troubleshooting

In order to check if the Workflow Designer frontend has successfully started, look at the logs of the
frontend container. For example, by running `docker logs workflow-frontend`. The logs should not contain
error messages.

Workflow frontend does not have backend logic, therefore there are no application logs.

Deployment Using Docker Compose
===============================

[Docker Compose](https://docs.docker.com/compose/) further simplifies the deployment of Workflow Designer.
The Docker Compose files can be find in the workflow designer Git repository, under _docker-compose_ directory.

> In order to use this deployment method, you need to install Docker Compose as described on
[Install Docker Compose](https://docs.docker.com/compose/install/) official page.

## 1. Cassandra Database

Instantiation of a Cassandra database is not part of the the Docker Compose service. You may already have a running
instance of Cassandra you want to use. It can be in a Docker container, on a VM, or a physical machine.

If you want to spin up a Cassandra database alongside the Workflow Designer service for development purposes,
use the following command:

`docker-compose -p workflow -f cassandra.yml up -d`

> Note, that since the database was created under the same project (`-p workflow`), but as a separate service, it will
keep running when you shut down the workflow designer service. This will cause an error message
_ERROR: network workflow_default id <......> has active endpoints_.

## 2. Environment Variables

Edit _.env_ file located in _docker-compose_ directory. Here is a brief overview of some variables.

- IMAGE_TAG &mdash; enables to try other versions of the Docker images

- REGISTRY &mdash; allows to use any Docker registry; leave it blank for locally built images

- CS_HOST &mdash; Cassandra host name or IP address. Keep in mind that the host must be accessible from the
[Docker Compose network](https://docs.docker.com/compose/networking/) created for the workflow service.
Use `CS_HOST=cassandra` if you created the database as described in the previous section.

- SDC_HOST &mdash; usually, IP address of the Docker host (if you are using the SDC deploy script).

- CASSANDRA_INIT_PORT &mdash; Cassandra Thrift port, usually 9160.

- CASSANDRA_PORT &mdash; Cassandra CQL native client port, usually 9042.

- BACKEND_DEBUG_PORT &mdash; *host* port used to debug the backend server (see below).

- FRONTEND_DEBUG_PORT &mdash; *host* port used to debug the frontend server (see below).

- FRONTEND_PORT &mdash; *host* port Workflow Designer UI will be accessible at.

> Other variables are described in _Deployment on Docker_ section.

## 3. Starting Workflow Designer Service

Assuming the database is up and running, execute the following in the command line:

`docker-compose -p workflow up -d`.

It is easy to restart or recreate the entire service or a selected component using Docker Compose commands, for example
to pick up new versions of the Docker images. Keep in mind that the database may remain unchanged, so that the new
service will continue to work with old data.

For example, you can restart just the frontend by issuing the command:

`docker-compose -p workflow restart workflow-frontend`

Keep in mind that changes to the _docker-compose.yml_ configuration or environment variables
[will not be reflected](https://docs.docker.com/compose/reference/restart/) when using `restart`. For that, you will
need to recreate the container (e.g. to change the image version):

`docker-compose -p workflow up -d --no-deps workflow-frontend`

For more advanced features and commands, please refer to
[Docker Compose documentation](https://docs.docker.com/compose/).

## 4. Stopping Workflow Designer Service

You can shut down the entire stack of Workflow Designer components using
`docker-compose -p workflow down`.

## 5. Starting Workflow Designer in Debug Mode

It is possible to start the service in debug mode, when both the front-end and the back-end are accessible from a
remote debugger at mapped host ports. Run:

`docker-compose -p workflow -f docker-compose.yml -f debug.yml up -d`.

SDC Plugin Configuration
========================

In order to run as an SDC pluggable designer, Workflow Designer must be added to SDC configuration as described in
[Generic plugin support](https://wiki.onap.org/display/DW/Generic+Designer+Support).

If you are deploying SDC using a standard procedure (OOM or the
[SDC shell script](https://wiki.onap.org/display/DW/Deploying+SDC+on+a+Linux+VM+for+Development)),
the easiest way to configure the Workflow plugin is to edit the *plugins-configuration.yaml*.

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
*workflow.example.com*, and port 8080 of the Workflow frontend is mapped to 9088 on the host. In this case the
corresponding section of *plugins-configuration.yaml* will look like below:

```

- pluginId: WORKFLOW
     pluginDiscoveryUrl: "http://workflow.example.com:9088/ping"
     pluginSourceUrl: "http://workflow.example.com:9088"
     pluginStateUrl: "workflowDesigner"
     pluginDisplayOptions:
        tab:
            displayName: "WORKFLOW"
            displayRoles: ["DESIGNER", "TESTER"]

```

In a development or demo environment, Workflow Designer will run on the same host as SDC, so that its IP address will
be the one of the Docker host.