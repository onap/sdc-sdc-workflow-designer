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

import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BroadcastService } from './services/broadcast.service';
import { LOCATION_INITIALIZED } from '@angular/common';
import { AuthService } from './services/auth.service';
import { RestService } from './services/rest.service';
import { ToscaService } from './services/tosca.service';

/**
 * main component
 */
@Component({
    selector: 'workflow',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
    public isAuthorized = false;
    public toscaLoaded = false;
    public restLoaded = false;
    public typeLoaded = true;

    constructor(translate: TranslateService, private authService: AuthService,
        private broadcastService: BroadcastService, toscaService: ToscaService,
        restService: RestService) {
        // Init the I18n function.
        // this language will be used as a fallback when a translation isn't found in the current language
        translate.setDefaultLang('en');
        // the lang to use, if the lang isn't available, it will use the current loader to get them
        const topWin: any = window.top;
        let browserLang = '';
        if (topWin.getLanguage && typeof topWin.getLanguage == 'function') {
            browserLang = topWin.getLanguage() || '';
        } else {
            // browserLang = translate.getBrowserCultureLang() || '';
            // by default, window.navigator.languages will return a language list with the users prefered language as the first one.
            // then, browserLang may with the result of translate.getBrowserCultureLang().
            // but chrome version 57 not implement this functional. The first is not the user's prefered.
            // So, browserLang can only use window.navigator.language as the user's prefered language.
            browserLang = window.navigator.language;
        }
        translate.use(browserLang);
    }

    public ngOnInit() {
        // this.broadcastService.openRight$.subscribe(hasRight => {
        //     this.isAuthorized = hasRight;
        // });
        this.isAuthorized = true;
        this.broadcastService.updateModelToscaConfig$.subscribe(tosca => {
            this.toscaLoaded = true;
        });
        this.broadcastService.updateModelRestConfig$.subscribe(swagger => {
            this.restLoaded = true;
        });
        this.broadcastService.updateNodeTypeConfig$.subscribe(type => {
            this.typeLoaded = true;
        });
    }
}
