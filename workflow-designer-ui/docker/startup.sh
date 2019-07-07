#!/bin/sh

# adding support for https
HTTPS_ENABLED=${IS_HTTPS:-"false"}
CLIENT_AUTH=${IS_CLIENT_AUTH:-"false"}
if [ "$HTTPS_ENABLED" = "true" ]
then
    echo "enable ssl"

    if [ -f etc/keystore ]; then
        echo "$KEYSTORE_PATH exist"
    else
        echo "Copying default keystore"
	mkdir etc
        cp /keystore $JETTY_BASE/etc/keystore
    fi

    if [ -f  etc/truststore ]; then
        echo "$TRUSTSTORE_PATH exist"
    else
        echo "Copying default truststore"
	mkdir etc
        cp /truststore $JETTY_BASE/etc/truststore
    fi

    java -jar "${JETTY_HOME}/start.jar" --add-to-start=https,ssl \
        jetty.sslContext.keyStorePath=etc/keystore \
        jetty.sslContext.keyStorePassword=$KEYSTORE_PASSWORD \
        jetty.sslContext.keyStoreType=$KEYSTORE_TYPE \
	    jetty.sslContext.keyManagerPassword=$KEYMANAGER_PASSWORD \
        jetty.sslContext.trustStorePath=etc/truststore \
        jetty.sslContext.trustStorePassword=$TRUSTSTORE_PASSWORD \
        jetty.sslContext.trustStoreType=$TRUSTSTORE_TYPE \
        jetty.sslContext.needClientAuth=$CLIENT_AUTH

        echo "setting SSL environment variable"
        SSL_JAVA_OPTS=" -DkeystorePath=$JETTY_BASE/etc/keystore -DkeystorePassword=$KEYSTORE_PASSWORD -DkeyManagerPassword=$KEYMANAGER_PASSWORD -DkeystoreType=$KEYSTORE_TYPE -DtruststorePath=$JETTY_BASE/etc/truststore -DtruststorePassword=$TRUSTSTORE_PASSWORD -DtruststoreType=$TRUSTSTORE_TYPE -DsslTrustAll=$TRUST_ALL"

        #seeing if we need t set the cypher for include
        if [ ! -z "$KEYSTORE_CYPHER" ]; then
            echo  "adding cypher data"
            sed 's/REPLACE_CYPHER/$KEYSTORE_CYPHER/' /tweak-ssl.xml > etc/tweak-ssl.xml
            echo "etc/tweak-ssl.xml" >> $JETTY_BASE/start.ini
        fi
else
    echo "no ssl required"
fi

java $JAVA_OPTIONS -DproxyTo=$BACKEND $SSL_JAVA_OPTS -jar $JETTY_HOME/start.jar