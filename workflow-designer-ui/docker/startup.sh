#!/bin/sh
# adding support for https
HTTPS_ENABLED=${IS_HTTPS:-"false"}

if [ "$HTTPS_ENABLED" = "true" ]
then
    echo "enable ssl"
    if [ -n "$KEYSTORE_PATH" ]
    then
        
        keystore_pass="!ppJ.JvWn0hGh)oVF]([Kv)^"
        truststore_pass="].][xgtze]hBhz*wy]}m#lf*"

        java -jar "${JETTY_HOME}/start.jar" --add-to-start=https,ssl \
            jetty.sslContext.keyStorePath=$KEYSTORE_PATH \
            jetty.sslContext.keyStorePassword=${KEYSTORE_PASS:-$keystore_pass} \
            jetty.sslContext.trustStorePath=$TRUSTSTORE_PATH \
            jetty.sslContext.trustStorePassword=${TRUSTSTORE_PASS:-$truststore_pass} \
     else
         echo "Using jetty default SSL"
         java -jar "${JETTY_HOME}/start.jar" --add-to-start=https,ssl
     fi
else
    echo "no ssl required"
fi

java -DproxyTo=$BACKEND $JAVA_OPTIONS -jar $JETTY_HOME/start.jar

