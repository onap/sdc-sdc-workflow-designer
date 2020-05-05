#!/bin/sh

HTTPS_ENABLED=${SERVER_SSL_ENABLED:-"false"}
if [ "$HTTPS_ENABLED" = "true" ]
then
    echo "HTTPS is enabled. Configuring keystore."
    KEYSTORE=${SERVER_SSL_KEYSTORE_PATH}
    if [ -f "$KEYSTORE" ]; then
        echo "$KEYSTORE exist"
    else
        echo "Copying default keystore"
        KEYSTORE_DIR=${KEYSTORE%/*}
        mkdir -p $KEYSTORE_DIR
        cp /keystore $KEYSTORE_DIR
        chmod 755 $KEYSTORE
    fi

    TRUSTSTORE=${SERVER_SSL_TRUSTSTORE_PATH}
    if [ -f "$TRUSTSTORE" ]; then
        echo "$TRUSTSTORE exist"
    else
        echo "Copying default truststore"
        TRUSTSTORE_DIR=${TRUSTSTORE%/*}
        mkdir -p $TRUSTSTORE_DIR
        cp /truststore $TRUSTSTORE_DIR
        chmod 755 $TRUSTSTORE
    fi
else
  echo "HTTPS is disabled."
fi
java ${JAVA_OPTIONS} -jar /app.jar ${SPRING_BOOT_OPTIONS}