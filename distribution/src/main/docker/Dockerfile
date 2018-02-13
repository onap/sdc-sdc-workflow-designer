FROM ubuntu:16.04

MAINTAINER "Lv Bo" <lv.bo163@zte.com.cn>

EXPOSE 8080

#install openjdk-1.8
#RUN sed -i 's#http://archive.ubuntu.com#http://mirrors.163.com#g' /etc/apt/sources.list
RUN apt-get update
RUN apt-get install -y openjdk-8-jdk

#configure the JDK
RUN sed -i 's|#networkaddress.cache.ttl=-1|networkaddress.cache.ttl=10|' /usr/lib/jvm/java-8-openjdk-amd64/jre/lib/security/java.security
ENV JAVA_HOME /usr/lib/jvm/java-8-openjdk-amd64
ENV PATH $PATH:/usr/lib/jvm/java-8-openjdk-amd64/jre/bin:/usr/lib/jvm/java-8-openjdk-amd64/bin
ENV CLASSPATH .:${JAVA_HOME}/lib:${JRE_HOME}/lib
ENV JRE_HOME ${JAVA_HOME}/jre

#add workflow designer related resources to the docker image
RUN mkdir /home/sdc-workflow-designer
WORKDIR /home/sdc-workflow-designer
ADD sdc-workflow-designer-*-linux64.tar.gz /home/sdc-workflow-designer/
RUN chmod 755 /home/sdc-workflow-designer/*.sh

ENTRYPOINT /home/sdc-workflow-designer/bin/run.sh

