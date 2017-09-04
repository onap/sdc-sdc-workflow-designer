/*******************************************************************************
 * Copyright (c) 2017 ZTE Corporation.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * and the Apache License 2.0 which both accompany this distribution,
 * and are available at http://www.eclipse.org/legal/epl-v10.html
 * and http://www.apache.org/licenses/LICENSE-2.0
 *
 * Contributors:
 *     ZTE - initial API and implementation and/or initial documentation
 *******************************************************************************/

export class SwaggerParameter {
    public description: string;
    public position: string;  // in path, query, header, body, form
    public name: string;
    public required: boolean;
    public type: string;

    // if position is body
    public schema: SwaggerSchemaObject;

    constructor(options: any) {
        this.description = options.description;
        this.position = options.in;
        this.name = options.name;
        this.required = options.required;
        this.type = options.type;
        if (this.position === 'body') {
            this.schema = getSchemaObject(options.schema);
        }
    }
}

export class SwaggerHeader {
    public description: string;

    constructor(options: any) {
        this.description = options.description;
    }
}

export class SwaggerResponse {
    public description: string;
    public schema: SwaggerSchemaObject;
    public headers: any;

    constructor({description, schema, headers}) {
        this.description = description;

        if (schema) {
            this.schema = getSchemaObject(schema);
        }

        if (headers) {
            this.headers = {};
            for (const key in headers) {
                this.headers[key] = new SwaggerHeader(headers[key]);
            }
        }
    }
}

export class SwaggerMethod {
    public consumes: string[];
    public description: string;
    public operationId: string;
    public parameters: SwaggerParameter[];
    public produces: string[];
    public responses: any;
    public summary: string;
    public tags: string[];

    constructor({ consumes, description, operationId, parameters, produces, responses, summary, tags }) {
        this.consumes = consumes;
        this.description = description;
        this.operationId = operationId;
        this.parameters = parameters.map(param => new SwaggerParameter(param));
        this.produces = produces;
        this.responses = this.initResponses(responses);
        this.summary = summary;
        this.tags = tags;
    }

    private initResponses(responses: any): any {
        const responseObjs = {};
        for (const key in responses) {
            responseObjs[key] = new SwaggerResponse(responses[key]);
        }

        return responseObjs;
    }
}

export class SwaggerInfo {
    public title: string;
    public version: string;

    constructor({ title, version }) {
        this.title = title;
        this.version = version;
    }
}

export class SwaggerTag {
    public name: string;

    constructor({name}) {
        this.name = name;
    }
}

export class Swagger {
    public basePath: string;
    public definitions: any;
    public info: SwaggerInfo;
    public paths: any;
    public swagger: string;
    public tags: SwaggerTag[];

    constructor({basePath, definitions, info, paths, swagger, tags}) {
        this.basePath = basePath;
        this.definitions = this.initDefinitions(definitions);
        this.info = new SwaggerInfo(info);
        this.paths = this.initPaths(paths);
        this.swagger = swagger;
        this.tags = tags.map(tag => new SwaggerTag(tag));
    }

    private initPaths(paths: any): any {
        const pathObjs = {};
        for (const key in paths) {
            pathObjs[key] = this.initPath(paths[key]);
        }
        return pathObjs;
    }

    private initPath(path: any): any {
        const pathObj = {};

        for (const key in path) {
            pathObj[key] = new SwaggerMethod(path[key]);
        }

        return pathObj;
    }

    private initDefinitions(definitions: any): any {
        const definitionObjs = {};
        for (const key in definitions) {
            definitionObjs[key] = getSchemaObject(definitions[key]);
        }
        return definitionObjs;
    }
}

export function getSchemaObject(definition: any) {
    if (definition.$ref) {
        return new SwaggerReferenceObject(definition);
    } else if (definition.type === 'array') {
        return new SwaggerModelArray(definition);
    } else if (definition.type === 'object') {
        if (definition.properties) {
            return new SwaggerModelSimple(definition);
        } else if (definition.additionalProperties) {
            return new SwaggerModelMap(definition);
        } else {
            return new SwaggerModel();
        }
    } else {
        return new SwaggerPrimitiveObject(definition);
    }
}

export class SwaggerSchemaObject {

}

export class SwaggerReferenceObject extends SwaggerSchemaObject {
    public $ref: string;

    constructor({ $ref }) {
        super();
        this.$ref = $ref;
    }
}

export class SwaggerPrimitiveObject extends SwaggerSchemaObject {
    public collectionFormat: string;
    public defaultValue: any;
    public enumValues: any[];
    public exclusiveMaximum: boolean;
    public exclusiveMinimum: boolean;
    public format: string;
    public maximum: number;
    public maxLength: number;
    public minimum: number;
    public minLength: number;
    public multipleOf: number;
    public pattern: string;
    public type: string;

    constructor(options: any) {
        super();
        this.collectionFormat = options.collectionFormat;
        this.defaultValue = options.default;
        this.enumValues = options.enum;
        this.exclusiveMaximum = options.exclusiveMaximum;
        this.exclusiveMinimum = options.exclusiveMinimum;
        this.format = options.format;
        this.maximum = options.maximum;
        this.maxLength = options.maxLength;
        this.minimum = options.minimum;
        this.minLength = options.minLength;
        this.multipleOf = options.multipleOf;
        this.pattern = options.pattern;
        this.type = options.type;
    }
}

export class SwaggerModel extends SwaggerSchemaObject {
    public type = 'object';
}

export class SwaggerModelSimple extends SwaggerModel {
    public properties = {};
    public required = [];

    constructor(options: any) {
        super();
        this.required = options.required;
        for (const key in options.properties) {
            this.properties[key] = getSchemaObject(options.properties[key]);
        }
    }
}

export class SwaggerModelMap extends SwaggerModel {
    public additionalProperties: SwaggerSchemaObject;

    constructor(options: any) {
        super();
        this.additionalProperties = getSchemaObject(options.additionalProperties);
    }
}

export class SwaggerModelArray extends SwaggerSchemaObject {
    public type = 'array';
    public items: SwaggerSchemaObject;

    constructor(options: any) {
        super();
        this.items = getSchemaObject(options.items);
    }
}
