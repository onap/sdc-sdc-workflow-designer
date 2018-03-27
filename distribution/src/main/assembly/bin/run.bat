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
title sdc-workflow-designer

set RUNHOME=%~dp0
echo ### RUNHOME: %RUNHOME%
echo ### Starting sdc-workflow-designer
set main_path=%RUNHOME%..\
cd /d %main_path%
set JAVA="%JAVA_HOME%\bin\java.exe"
set port=12345
set jvm_opts=-Xms50m -Xmx128m
set jvm_opts=%jvm_opts% -Xdebug -Xnoagent -Djava.compiler=NONE -Xrunjdwp:transport=dt_socket,address=%port%,server=y,suspend=n
set class_path=%main_path%;%main_path%sdc-workflow-designer.jar
echo ### jvm_opts: %jvm_opts%
echo ### class_path: %class_path%

%JAVA% -classpath %class_path% %jvm_opts% org.onap.sdc.workflowdesigner.WorkflowDesignerApp server %main_path%conf/workflow-designer.yml

IF ERRORLEVEL 1 goto showerror
exit
:showerror
echo WARNING: Error occurred during startup or Server abnormally stopped by way of killing the process,Please check!
echo After checking, press any key to close 
pause
exit