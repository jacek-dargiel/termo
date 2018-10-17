import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'environments/environment';
import { tap } from 'rxjs/operators';
import { isEmpty } from '../helpers/lodash';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(
    private http: HttpClient,
  ) { }

  get<T>(url, options = {}) {
    return this.http.get<T>(`${environment.API_URL}${url}`, options)
      .pipe(
        tap(response => {
          if (isEmpty(response)) {
            console.warn('API response is empty. Is this AIO feed public?');
          }
        })
      );
  }
}
