import { HttpHeaders } from '@angular/common/http';
import { environment } from 'environments/environment';

let token = (<any>environment).AIO_TOKEN || window.localStorage.getItem('AIO_TOKEN');

export const aioHeaders = new HttpHeaders({
    'X-AIO-Key': token
});
