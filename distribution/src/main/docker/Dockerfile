FROM ubuntu:16.04

MAINTAINER "Lv Bo" <lv.bo163@zte.com.cn>

EXPOSE 8080

#install openjdk-1.8
#RUN sed -i 's#http://archive.ubuntu.com#http://mirrors.163.com#g' /etc/apt/sources.list
RUN apt-get update
RUN apt-get install -y openjdk-8-jdk

RUN apt-get -y upgrade


# Install specific system libraries to fix CVE vulnerabilities
RUN echo "deb http://archive.ubuntu.com/ubuntu/ artful main restricted" >> /etc/apt/sources.list && \
    echo "deb http://security.ubuntu.com/ubuntu/ artful-security main restricted" >> /etc/apt/sources.list && \
    echo "deb http://archive.ubuntu.com/ubuntu/ bionic main restricted" >> /etc/apt/sources.list && \
    apt-get -y update

# krb5 1.16-2build1
#   For CVE-2017-15088 CVE-2017-11462
# libvorbis 1.3.5-4ubuntu0.2
#   For CVE-2017-14632 CVE-2017-14160
# libx11 2:1.6.4-3
#    For CVE-2016-7943 CVE-2016-7942
# libxtst 1.2.3-1
#    For CVE-2016-7951
# ncurses 6.1-1ubuntu1
#    For CVE-2017-10685 CVE-2017-10684
# libsqllite3-0 3.22.0-1
#   For CVE-2017-10989
# libtiff5 4.0.8-5ubuntu0.1
#   For CVE-2017-9117 CVE-2016-9540 CVE-2016-9539 CVE-2016-9538 CVE-2016-9537 CVE-2016-9536 CVE-2016-9535 CVE-2016-9534 CVE-2016-9533 CVE-2015-8668 CVE-2015-7554 CVE-2016-6223 CVE-2017-5563 CVE-2016-3621 CVE-2016-8331
# shadow 1:4.5-1ubuntu1
#   For CVE-2017-12424
# perl-base 5.26.0-8ubuntu1.1
#   For CVE-2015-8608 CVE-2017-12883
# openssl 1.1.0g-2ubuntu3
#   For CVE-2016-6303 CVE-2016-2182 CVE-2016-2177 CVE-2016-2176
# zlib1g 1:1.2.11.dfsg-0ubuntu2
#   For CVE-2016-9843 CVE-2016-9841 CVE-2016-9842 CVE-2016-9840

RUN apt-get -y install \
    libkrb5-3=1.16-2build1 krb5-locales=1.16-2build1 \
    libvorbis0a=1.3.5-4ubuntu0.2 \
    libx11-6=2:1.6.4-3 libx11-data=2:1.6.4-3 libx11-doc=2:1.6.4-3 libx11-xcb1=2:1.6.4-3 \
    libxtst6=2:1.2.3-1 \
    ncurses-base=6.1-1ubuntu1 ncurses-bin=6.1-1ubuntu1 libncurses5=6.1-1ubuntu1 libncursesw5=6.1-1ubuntu1 \
    libsqlite3-0=3.22.0-1 \
    libtiff5=4.0.8-5ubuntu0.1 \
    passwd=1:4.5-1ubuntu1 \
    perl-base=5.26.0-8ubuntu1.1 \
    zlib1g=1:1.2.11.dfsg-0ubuntu2


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
RUN chmod 755 /home/sdc-workflow-designer/bin/*.sh

ENTRYPOINT /home/sdc-workflow-designer/bin/run.sh

