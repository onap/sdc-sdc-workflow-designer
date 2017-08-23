@echo off

rem Copyright (c) 2017 ZTE Corporation.
rem All rights reserved. This program and the accompanying materials
rem are made available under the terms of the Eclipse Public License v1.0
rem and the Apache License 2.0 which both accompany this distribution,
rem and are available at http://www.eclipse.org/legal/epl-v10.html
rem and http://www.apache.org/licenses/LICENSE-2.0
rem
rem Contributors:
rem     ZTE - initial API and implementation and/or initial documentation


echo npm install
npm install

echo npm build
npm run build
