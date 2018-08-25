import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

interface Dimentions {
  width: number;
  height: number;
}

@Injectable({
  providedIn: 'root'
})
export class MapBackgroundService {
  constructor() { }

  getImageDimentions(url: string): Observable<Dimentions> {
    return new Observable<Dimentions>(observer => {
      let image = new Image();
      image.onload = () => {
        let dimentions: Dimentions = {
          width: image.width,
          height: image.height,
        };
        observer.next(dimentions);
        observer.complete();
      };
      image.onerror = error => {
        observer.error(error);
      };
      image.src = url;
    });
  }
}
