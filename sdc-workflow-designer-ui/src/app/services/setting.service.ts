import { Injectable } from '@angular/core';
import { Observable } from "rxjs";

import { HttpService } from '../util/http.service';

@Injectable()
export class SettingService {

  constructor(private http: HttpService) { }

  public getSetting(): Observable<any> {
    const options: any = {
      headers: {
        Accept: 'application/json',
      }
    };
    // return this.http.get('assets/global-setting.json', options);
    return this.http.get('/api/setting', options);
  }

}
