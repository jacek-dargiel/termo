import { TestBed, inject } from '@angular/core/testing';

import { ApiService } from './api.service';
import { of } from 'rxjs';
import { HttpClient } from '@angular/common/http';

class MockClient {
  get() {
    return of();
  }
}

describe('ApiService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ApiService,
        { provide: HttpClient, useClass: MockClient },
      ]
    });
  });

  it('should be created', inject([ApiService], (service: ApiService) => {
    expect(service).toBeTruthy();
  }));
});
