#!/bin/sh

# adding support for https
HTTPS_ENABLED=${IS_HTTPS:-"false"}
CLIENT_AUTH=${IS_CLIENT_AUTH:-"false"}
if [ "$HTTPS_ENABLED" = "true" ]
then
    echo "enable ssl"

    java -jar "${JETTY_HOME}/start.jar" --add-to-start=https,ssl \
        jetty.sslContext.keyStorePath=$KEYSTORE_PATH \
        jetty.sslContext.keyStorePassword=$KEYSTORE_PASS \
	    jetty.sslContext.keyManagerPassword=$KEYSTORE_PASS \
        jetty.sslContext.trustStorePath=$TRUSTSTORE_PATH \
        jetty.sslContext.trustStorePassword=$TRUSTSTORE_PASS

    echo "setting SSL environment variable"

    SSL_JAVA_OPTS=" -DkeystorePath=$JETTY_BASE/$KEYSTORE_PATH -DkeystorePassword=$KEYSTORE_PASS -DkeyManagerPassword=$KEYSTORE_PASS -DtruststorePath=$JETTY_BASE/$KEYSTORE_PATH -DtruststorePassword=$TRUSTSTORE_PASS -DsslTrustAll=$TRUST_ALL"

    echo $SSL_JAVA_OPTS

else
    echo "no ssl required"
fi
java $JAVA_OPTIONS -DproxyTo=$BACKEND -DbasicAuth=$BASIC_AUTH_CREDENTIAL $SSL_JAVA_OPTS -jar $JETTY_HOME/start.jar

