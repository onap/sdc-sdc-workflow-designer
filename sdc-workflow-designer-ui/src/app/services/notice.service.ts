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

import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

import { Notice } from '../model/notice';
import { NoticeType } from '../model/notice-type.enum';

/**
 * NotifyService
 * display notify infos.
 */
@Injectable()
export class NoticeService {
    public showNotice = new Subject<Notice>();
    public showNotice$ = this.showNotice.asObservable();
    constructor() { }

    public success(content: string, timeout: number = 5000) {
        this.addNotice(NoticeType.success, content, timeout);
    }

    public info(content: string, timeout: number = 10000) {
        this.addNotice(NoticeType.info, content, timeout);
    }

    public warn(content: string, timeout: number = 30000) {
        this.addNotice(NoticeType.warning, content, timeout);
    }

    public error(content: string, timeout: number = 0) {
        this.addNotice(NoticeType.danger, content, timeout);
    }

    /**
     * showNotify
     * @param type
     * @param content
     */
    private addNotice(type: NoticeType, content: string, timeout: number = 0): void {
        const notice = new Notice(type, content, timeout);
        this.showNotice.next(notice);
    }
}
