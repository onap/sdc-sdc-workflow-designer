# Steps to run workflow docker

1\. Create a directory on host machine to hold configuration file.\

2\. Copy the provided application.properties in this newly created directory and populate real environment value of Cassandra to which workflow service needs to be connected.\

3\. Execute below commands to start docker containers.

# 1. Start workflow be init container\

docker run -d --name &lt;CONTAINER_NAME&gt; -e CS_HOST=&lt;CS_HOST_IP&gt; -e CS_PORT=&lt;CS_PORT&gt; -e CS_USER=&lt;CS_USER&gt; -e CS_PASSWORD=&lt;CS_PASSWORD&gt; &lt;IMAGE_NAME&gt;\

# 2. Start workflow be container\

docker run -d --name &lt;CONTAINER_NAME&gt; -e JAVA_OPTIONS="-Xmx128m -Xms128m -Xss1m" -v &lt;CONFIG_FILE_DIRECTORY_PATH&gt;:/etc/onap/workflow/be/config -p &lt;PORT_TO_HOST_SERVICE&gt;:8080 &lt;IMAGE_NAME&gt;

# Example Commands\

docker run -d --name sdc-wfd-BE-init -e CS_HOST=10.247.41.19 -e CS_USER=test_user -e CS_PORT=9160 -e CS_PASSWORD=test_password onap/workflow-be-init:1.3.0-SNAPSHOT\

docker run -d --name sdc-wfd-BE -v /data/environments:/etc/onap/workflow/be/config -p 8091:8080 onap/workflow-be:1.3.0-SNAPSHOT