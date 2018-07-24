@REM
@REM Copyright (c) 2017 ZTE Corporation.
@REM All rights reserved. This program and the accompanying materials
@REM are made available under the terms of the Eclipse Public License v1.0
@REM and the Apache License 2.0 which both accompany this distribution,
@REM and are available at http://www.eclipse.org/legal/epl-v10.html
@REM and http://www.apache.org/licenses/LICENSE-2.0
@REM
@REM Contributors:
@REM     ZTE - initial API and implementation and/or initial documentation
@REM

@echo off
title stopping sdc-workflow-designer

set HOME=%~dp0
set Main_Class="org.onap.sdc.workflowdesigner.WorkflowDesignerApp"

echo ================== sdc-workflow-designer info =============================================
echo HOME=$HOME
echo Main_Class=%Main_Class%
echo ===============================================================================

echo ### Stopping sdc-workflow-designer
cd /d %HOME%

for /f "delims=" %%i in ('"%JAVA_HOME%\bin\jcmd"') do (
  call find_kill_process "%%i" %Main_Class%
)
exit