import { HttpHeaders } from '@angular/common/http';

let token = window.localStorage.getItem('AIO_TOKEN');

if (!token) {
    console.warn('Development token not found in local storage!');
}

export let aioHeaders;

if (token) {
    aioHeaders = new HttpHeaders({
        'X-AIO-Key': token
    });
}
