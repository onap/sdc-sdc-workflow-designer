#!/bin/sh

# adding support for https
HTTPS_ENABLED=${IS_HTTPS:-"false"}

if [ "$HTTPS_ENABLED" = "true" ]
then
    echo "enable ssl"
    if [ -z "$KEYSTORE_PATH" ]; then
        java -jar "${JETTY_HOME}/start.jar" --add-to-start=https,ssl \
            jetty.sslContext.keyStorePath=$KEYSTORE_PATH \
            jetty.sslContext.keyStorePassword=$KEYSTORE_PASSWORD \
            jetty.sslContext.keyStoreType=$KEYSTORE_TYPE \
            jetty.sslContext.trustStorePath=$TRUSTSTORE_PATH \
            jetty.sslContext.trustStorePassword=$TRUSTSTORE_PASSWORD \
            jetty.sslContext.trustStoreType=$TRUSTSTORE_TYPE \
     else
         echo "Using jetty default SSL"
         java -jar "${JETTY_HOME}/start.jar" --add-to-start=https,ssl
     fi
else
    echo "no ssl required"
fi

java -DproxyTo=$BACKEND $JAVA_OPTIONS -jar $JETTY_HOME/start.jar