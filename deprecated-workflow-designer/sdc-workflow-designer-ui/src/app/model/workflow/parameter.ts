/**
 * Copyright (c) 2017 ZTE Corporation.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * and the Apache License 2.0 which both accompany this distribution,
 * and are available at http://www.eclipse.org/legal/epl-v10.html
 * and http://www.apache.org/licenses/LICENSE-2.0
 *
 * Contributors:
 *     ZTE - initial API and implementation and/or initial documentation
 */

import { ValueSource } from '../value-source.enum';
import { ValueType } from '../value-type.enum';

export class Parameter {
    constructor(public name: string, public value: any, public valueSource: string,
        public type = ValueType[ValueType.string], public required = false,
        public show = true, public errorMsg = '') {
    }
}
