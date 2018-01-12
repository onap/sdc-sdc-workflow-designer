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
export class WorkflowUtil {
    public static deepClone(source: any) {
        if (source === null || typeof source !== 'object') {
            return source;
        } else {
            if (source instanceof Array) {
                const target = [];
                source.forEach(item => target.push(WorkflowUtil.deepClone(item)));
                return target;
            } else {
                const target = {};
                for (const key in source) {
                    target[key] = WorkflowUtil.deepClone(source[key]);
                }
                return target;
            }
        }
    }
}
