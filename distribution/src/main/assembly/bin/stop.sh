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
HOME=`cd $DIRNAME/; pwd`
Main_Class="org.onap.sdc.workflowdesigner.WorkflowDesignerApp"

echo ================== sdc-workflow-designer info =============================================
echo HOME=$HOME
echo Main_Class=$Main_Class
echo ===============================================================================
cd $HOME; pwd

echo @WORK_DIR@ $HOME

function save_service_pid(){
    service_pid=`ps -ef | grep $Main_Class | grep -v grep | awk '{print $2}'`
    echo @service_pid@ $service_pid
}

function kill_service_process(){
    ps -p $service_pid
    if [ $? == 0 ]; then
        kill -9 $service_pid
    fi
}

save_service_pid;
echo @C_CMD@ kill -9 $service_pid
kill_service_process;