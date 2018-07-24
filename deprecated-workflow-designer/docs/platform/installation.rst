.. This work is licensed under a Creative Commons Attribution 4.0 International License.

Installation
------------

Install docker
^^^^^^^^^^^^^^^^^^^^^^^

sudo apt-add-repository 'deb https://apt.dockerproject.org/repo ubuntu-xenial main'

sudo apt-key adv --keyserver hkp://p80.pool.sks-keyservers.net:80 --recv-keys 58118E89F3A912897C070ADBF76221572C52609D

sudo apt-get update

apt-cache policy docker-engine

sudo apt-get install -y docker-engine

docker ps

Run sdc-workflow-designer docker
^^^^^^^^^^^^^^^^^^^^^^^

Login the ONAP docker registry first: sudo docker login -u docker -p docker nexus3.onap.org:10001

sudo docker run -p  9519:8080 -d --net=host --name sdc-workflow-designer nexus3.onap.org:10001/onap/sdc/sdc-workflow-designer

Check status of Workflow designer
^^^^^^^^^^^^^^^^^^^^^^^

Visit workflow designer web ui:

http://127.0.0.1:9527/