/*******************************************************************************
 * Copyright (c) 2018 ZTE Corporation.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * and the Apache License 2.0 which both accompany this distribution,
 * and are available at http://www.eclipse.org/legal/epl-v10.html
 * and http://www.apache.org/licenses/LICENSE-2.0
 *
 * Contributors:
 *     ZTE - initial API and implementation and/or initial documentation
 *******************************************************************************/
export interface SwaggerItems {
    $ref?: string;
    type?: string;
    format?: string;
    items?: SwaggerItems;
    collectionFormat?: string;//Default value is csv
    default?: any;
    maximum?: number;
    exclusiveMaximum?: boolean;
    minimum?: number;
    exclusiveMinimum?: boolean;
    maxLength?: number;//integer
    minLength?: number;//integer
    pattern?: string;
    maxItems?: number;//integer
    minItems?: number;//integer
    uniqueItems?: boolean;
    enum?: any[];
    multipleOf?: number;
}
