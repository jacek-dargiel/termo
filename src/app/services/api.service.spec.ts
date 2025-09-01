import { TestBed, inject } from '@angular/core/testing';

import { ApiService } from './api.service';
import { empty } from 'rxjs';
import { HttpClient } from '@angular/common/http';

class MockClient {
  get = jest.fn(() => empty());
}

describe('ApiService', () => {
  let client;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ApiService,
        { provide: HttpClient, useClass: MockClient },
      ]
    });
  client = TestBed.inject(HttpClient);
  });

  it('should be created', inject([ApiService], (service: ApiService) => {
    expect(service).toBeTruthy();
  }));
  it('should pass to the HttpClient', inject([ApiService], (service: ApiService) => {
    let someSampleOptions = { option: 1 };
    service.get('/example/url', someSampleOptions );
    expect(client.get).toHaveBeenCalledWith('/api/example/url', someSampleOptions);
  }));
});
