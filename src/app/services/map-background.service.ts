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
      const image = new Image();
      image.onload = () => {
        const dimentions: Dimentions = {
          width: image.width,
          height: image.height,
        };
        observer.next(dimentions);
        observer.complete();
      };
      image.onerror = () => {
        observer.error(new Error(`Failed to load map background: ${url}`));
      };
      image.src = url;
    });
  }
}
