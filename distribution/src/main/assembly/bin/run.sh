#
# Copyright (c) 2017 ZTE Corporation.
# All rights reserved. This program and the accompanying materials
# are made available under the terms of the Eclipse Public License v1.0
# and the Apache License 2.0 which both accompany this distribution,
# and are available at http://www.eclipse.org/legal/epl-v10.html
# and http://www.apache.org/licenses/LICENSE-2.0
#
# Contributors:
#     ZTE - initial API and implementation and/or initial documentation
#

DIRNAME=`dirname $0`
RUNHOME=`cd $DIRNAME/; pwd`
echo @RUNHOME@ $RUNHOME

echo @JAVA_HOME@ $JAVA_HOME
JAVA="$JAVA_HOME/bin/java"
echo @JAVA@ $JAVA
main_path=$RUNHOME/../
cd $main_path
JAVA_OPTS="-Xms50m -Xmx128m"
port=12345
JAVA_OPTS="$JAVA_OPTS -Xdebug -Xnoagent -Djava.compiler=NONE -Xrunjdwp:transport=dt_socket,address=$port,server=y,suspend=n"
echo @JAVA_OPTS@ $JAVA_OPTS

class_path="$main_path/:$main_path/sdc-workflow-designer.jar"
echo @class_path@ $class_path

"$JAVA" $JAVA_OPTS -classpath "$class_path" org.onap.sdc.workflowdesigner.WorkflowDesignerApp server "$main_path/conf/workflow-designer.yml"

