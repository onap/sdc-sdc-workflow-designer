FROM ubuntu:16.04

MAINTAINER "Lv Bo" <lv.bo163@zte.com.cn>

EXPOSE 8080

#install openjdk-1.8
#RUN sed -i 's#http://archive.ubuntu.com#http://mirrors.163.com#g' /etc/apt/sources.list
RUN apt-get update
RUN apt-get install -y openjdk-8-jdk

RUN apt-get -y upgrade


# Upgrade specific system libraries to fix CVE vulnerabilities
RUN echo "deb http://archive.ubuntu.com/ubuntu/ bionic main restricted" >> /etc/apt/sources.list && \
    echo "deb http://security.ubuntu.com/ubuntu/ bionic-security main restricted" >> /etc/apt/sources.list && \
    apt-get -y update

# krb5 1.16-2build1
#   CVE-2017-15088 CVE-2017-11462
# libvorbis 1.3.5-4.2
#   CVE-2017-14632 CVE-2017-14160
# libx11 2:1.6.4-3
#    CVE-2016-7943 CVE-2016-7942
# libxtst 1.2.3-1
#    CVE-2016-7951
# ncurses 6.1-1ubuntu1
#    CVE-2017-10685 CVE-2017-10684
# libsqllite3-0 3.22.0-1
#   CVE-2017-10989
# libtiff5 4.0.9-5
#   CVE-2017-9117 CVE-2016-9540 CVE-2016-9539 CVE-2016-9538 CVE-2016-9537 CVE-2016-9536 CVE-2016-9535 CVE-2016-9534 CVE-2016-9533 CVE-2015-8668 CVE-2015-7554 CVE-2016-6223 CVE-2017-5563 CVE-2016-3621 CVE-2016-8331
# shadow 1:4.5-1ubuntu1
#   CVE-2017-12424
# perl-base 5.26.1-6
#   CVE-2015-8608 CVE-2017-12883
# openssl 1.1.0g-2ubuntu4
#   CVE-2016-6303 CVE-2016-2182 CVE-2016-2177 CVE-2016-2176
# zlib1g 1:1.2.11.dfsg-0ubuntu2
#   CVE-2016-9843 CVE-2016-9841 CVE-2016-9842 CVE-2016-9840
# libdb5.3
#   CVE-2016-3418 CVE-2016-0694 CVE-2016-0692 CVE-2016-0689 CVE-2016-0682
# libcairo2
#   CVE-2017-9814
# libc-bin libc6 multiarch-support
#   CVE-2018-6485
# libgtk2.0-0 libgtk2.0-bin libgtk2.0-common
#   CVE-2014-1949
# libgcrypt20
#   CVE-2017-0379
# libxi6
#   CVE-2016-7946 CVE-2016-7945
# libxml2
#   CVE-2016-9318
# libpcre3
#   CVE-2017-6004

RUN apt-get -y --only-upgrade install \
    libkrb5-3 krb5-locales \
    libvorbis0a \
    libx11-6 libx11-data libx11-doc libx11-xcb1 \
    libxtst6 \
    ncurses-base ncurses-bin libncurses5 libncursesw5 \
    libsqlite3-0 \
    libtiff5 \
    passwd \
    perl-base \
    openssl \
    zlib1g \
    libdb5.3 \
    libcairo2 \
    libc-bin libc6 multiarch-support \
    libgtk2.0-0 libgtk2.0-bin libgtk2.0-common \
    libgcrypt20 \
    libxi6 \
    libxml2 \
    libpcre3

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

