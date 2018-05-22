import { HttpHeaders } from '@angular/common/http';
import { environment } from 'environments/environment';

let token = window.localStorage.getItem('AIO_TOKEN');

export let aioHeaders;

if (token) {
    aioHeaders = new HttpHeaders({
        'X-AIO-Key': token
    });
}
