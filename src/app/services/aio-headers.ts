import { HttpHeaders } from '@angular/common/http';

let token = window.localStorage.getItem('AIO_TOKEN');

export let aioHeaders;

if (token) {
    aioHeaders = new HttpHeaders({
        'X-AIO-Key': token
    });
}
