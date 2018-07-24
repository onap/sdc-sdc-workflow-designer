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

echo %1 | findstr %2 >NUL
echo ERRORLEVEL=%ERRORLEVEL%
IF ERRORLEVEL 1 goto findend
for /f "tokens=1" %%a in (%1) do (  
    echo kill %1
    taskkill /F /pid %%a
)
:findend