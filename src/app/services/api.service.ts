import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'environments/environment';
import { tap } from 'rxjs/operators';
import { isEmpty } from '../helpers/lodash';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  token = window.localStorage.getItem('AIO_TOKEN');

  constructor(
    private http: HttpClient,
  ) { }

  get<T>(url, options = {}) {
    if (this.token) {
      let aioHeaders = new HttpHeaders({
        'X-AIO-Key': this.token,
      });
      options['headers'] = aioHeaders;
    }
    return this.http.get<T>(`${environment.API_URL}${url}`, options)
      .pipe(
        tap(response => {
          if (isEmpty(response) && !this.token) {
            // tslint:disable-next-line:max-line-length
            console.warn('API response is empty. This might be caused by an unauthorized request. Set `AIO_TOKEN` key in local storage to use it for authorization.');
          }
        })
      );
  }
}
