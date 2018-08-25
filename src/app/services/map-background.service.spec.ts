import { TestBed, inject } from '@angular/core/testing';

import { MapBackgroundService } from './map-background.service';

describe('MapBackgroundService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MapBackgroundService]
    });
  });

  it('should be created', inject([MapBackgroundService], (service: MapBackgroundService) => {
    expect(service).toBeTruthy();
  }));
});
