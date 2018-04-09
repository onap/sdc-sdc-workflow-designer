FROM ubuntu:16.04

MAINTAINER "Lv Bo" <lv.bo163@zte.com.cn>

EXPOSE 8080

#install openjdk-1.8
#RUN sed -i 's#http://archive.ubuntu.com#http://mirrors.163.com#g' /etc/apt/sources.list
RUN apt-get update
RUN apt-get install -y openjdk-8-jdk

RUN apt-get -y upgrade && apt-get -y install wget


# Install specific system libraries to fix CVE vulnerabilities

# krb5 1.16-2build1
#   For CVE-2017-15088 CVE-2017-11462
RUN wget https://launchpad.net/ubuntu/+source/krb5/1.16-2build1/+build/14312192/+files/libkrb5support0_1.16-2build1_amd64.deb && wget https://launchpad.net/ubuntu/+source/krb5/1.16-2build1/+build/14312192/+files/libk5crypto3_1.16-2build1_amd64.deb && dpkg -i libk5crypto3_1.16-2build1_amd64.deb libkrb5support0_1.16-2build1_amd64.deb
RUN wget https://launchpad.net/ubuntu/+source/krb5/1.16-2build1/+build/14312192/+files/krb5-locales_1.16-2build1_all.deb && dpkg -i krb5-locales_1.16-2build1_all.deb
RUN wget https://launchpad.net/ubuntu/+source/krb5/1.16-2build1/+build/14312192/+files/libkrb5-3_1.16-2build1_amd64.deb && dpkg -i libkrb5-3_1.16-2build1_amd64.deb
RUN wget https://launchpad.net/ubuntu/+source/krb5/1.16-2build1/+build/14312192/+files/libgssapi-krb5-2_1.16-2build1_amd64.deb && dpkg -i libgssapi-krb5-2_1.16-2build1_amd64.deb

# libvorbis 1.3.2-1.3ubuntu1.2
#   For CVE-2017-14632 CVE-2017-14160
RUN wget https://launchpad.net/~ubuntu-security-proposed/+archive/ubuntu/ppa/+build/14481066/+files/libvorbis0a_1.3.2-1.3ubuntu1.2_amd64.deb && dpkg -i libvorbis0a_1.3.2-1.3ubuntu1.2_amd64.deb
RUN wget https://launchpad.net/~ubuntu-security-proposed/+archive/ubuntu/ppa/+build/14481066/+files/libvorbisenc2_1.3.2-1.3ubuntu1.2_amd64.deb && dpkg -i libvorbisenc2_1.3.2-1.3ubuntu1.2_amd64.deb

# libx11 1.6.4-3
#    For CVE-2016-7943 CVE-2016-7942
RUN wget https://launchpad.net/ubuntu/+source/libx11/2:1.6.4-3/+build/12396404/+files/libx11-6_1.6.4-3_amd64.deb && dpkg -i libx11-6_1.6.4-3_amd64.deb
RUN wget https://launchpad.net/ubuntu/+source/libx11/2:1.6.4-3/+build/12396404/+files/libx11-data_1.6.4-3_all.deb && dpkg -i libx11-data_1.6.4-3_all.deb
RUN wget https://launchpad.net/ubuntu/+source/libx11/2:1.6.4-3/+build/12396404/+files/libx11-dev_1.6.4-3_amd64.deb && dpkg -i libx11-dev_1.6.4-3_amd64.deb
RUN wget https://launchpad.net/ubuntu/+source/libx11/2:1.6.4-3/+build/12396404/+files/libx11-doc_1.6.4-3_all.deb && dpkg -i libx11-doc_1.6.4-3_all.deb
RUN wget https://launchpad.net/ubuntu/+source/libx11/2:1.6.4-3/+build/12396404/+files/libx11-xcb1_1.6.4-3_amd64.deb && dpkg -i libx11-xcb1_1.6.4-3_amd64.deb

# libxtst 1.2.3-1
#    For CVE-2016-7951
RUN wget https://launchpad.net/ubuntu/+source/libxtst/2:1.2.3-1/+build/11525872/+files/libxtst6_1.2.3-1_amd64.deb && dpkg -i libxtst6_1.2.3-1_amd64.deb

# ncurses 6.1-1ubuntu1
#    For CVE-2017-10685 CVE-2017-10684
RUN wget https://launchpad.net/ubuntu/+source/ncurses/6.1-1ubuntu1/+build/14341521/+files/libtinfo5_6.1-1ubuntu1_amd64.deb && dpkg -i libtinfo5_6.1-1ubuntu1_amd64.deb
RUN wget https://launchpad.net/ubuntu/+source/ncurses/6.1-1ubuntu1/+build/14341521/+files/libncurses5_6.1-1ubuntu1_amd64.deb && dpkg -i libncurses5_6.1-1ubuntu1_amd64.deb
RUN wget https://launchpad.net/ubuntu/+source/ncurses/6.1-1ubuntu1/+build/14341521/+files/libncursesw5_6.1-1ubuntu1_amd64.deb && dpkg -i libncursesw5_6.1-1ubuntu1_amd64.deb
RUN wget https://launchpad.net/ubuntu/+source/ncurses/6.1-1ubuntu1/+build/14341521/+files/ncurses-base_6.1-1ubuntu1_all.deb && dpkg -i ncurses-base_6.1-1ubuntu1_all.deb
RUN wget https://launchpad.net/ubuntu/+source/ncurses/6.1-1ubuntu1/+build/14341521/+files/ncurses-bin_6.1-1ubuntu1_amd64.deb && dpkg -i ncurses-bin_6.1-1ubuntu1_amd64.deb

# libsqllite3-0 3.22.0-1
#   For CVE-2017-10989
RUN wget https://launchpad.net/ubuntu/+source/sqlite3/3.22.0-1/+build/14264231/+files/libsqlite3-0_3.22.0-1_amd64.deb && dpkg -i libsqlite3-0_3.22.0-1_amd64.deb

# zlib1g 1.2.11.dfsg-0ubuntu2
#   For CVE-2016-9843 CVE-2016-9841 CVE-2016-9842 CVE-2016-9840
RUN wget https://launchpad.net/ubuntu/+source/zlib/1:1.2.11.dfsg-0ubuntu2/+build/13260038/+files/zlib1g_1.2.11.dfsg-0ubuntu2_amd64.deb && dpkg -i zlib1g_1.2.11.dfsg-0ubuntu2_amd64.deb


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

