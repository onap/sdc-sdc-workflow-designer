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
export interface SwaggerSchema {
    $ref?: string;
    format?: string;
    title?: string;
    description?: string;
    default?: any;
    multipleOf?: number;//https://tools.ietf.org/html/draft-fge-json-schema-validation-00#section-5.1.1.
    maximum?: number;
    exclusiveMaximum?: boolean;
    minimum?: number;
    exclusiveMinimum?: boolean;
    maxLength?: number;//integer;
    minLength?: number;//integer;
    pattern?: string;//https://tools.ietf.org/html/draft-fge-json-schema-validation-00#section-5.2.3.
    maxItems?: number;//integer;
    minItems?: number;//integer;
    uniqueItems?: boolean;
    maxProperties?: number;//integer;
    minPropertiesnumber?: number;//integer;
    required?: boolean | string[];
    enum?: any[];
    type?: string;
    items?: SwaggerSchema | SwaggerSchema[];
    allOf?: any;//every property is a SwaggerSchema;
    properties?: any;//every property is a SwaggerSchema;
    additionalProperties?: any;//every property is a SwaggerSchema;//boolean | SwaggerSchema;
}
