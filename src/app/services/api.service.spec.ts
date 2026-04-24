import { HttpHeaders, HttpParams, provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { environment } from 'environments/environment';

import { ApiService } from './api.service';

interface FeedItem {
  id: number;
  label: string;
}

describe('ApiService', () => {
  let service: ApiService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ApiService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(ApiService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
    vi.restoreAllMocks();
  });

  it('creates an instance', () => {
    expect(service).toBeTruthy();
  });

  it('prefixes requests with environment.API_URL and performs GET', () => {
    let actual: FeedItem | undefined;

    service.get<FeedItem>('/feeds/current').subscribe(response => {
      actual = response;
    });

    const req = httpTesting.expectOne(`${environment.API_URL}/feeds/current`);

    expect(req.request.method).toBe('GET');

    const payload: FeedItem = { id: 7, label: 'room' };
    req.flush(payload);

    expect(actual).toEqual(payload);
  });

  it('forwards HttpClient options (params and headers)', () => {
    const params = new HttpParams().set('limit', '25');
    const headers = new HttpHeaders({ 'X-Test-Header': 'true' });

    service.get<{ ok: boolean }>('/feeds/history', { params, headers }).subscribe();

    const req = httpTesting.expectOne(request =>
      request.url === `${environment.API_URL}/feeds/history`
      && request.method === 'GET'
    );

    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('limit')).toBe('25');
    expect(req.request.headers.get('X-Test-Header')).toBe('true');

    req.flush({ ok: true });
  });

  it('warns when API response is an empty array', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    service.get<FeedItem[]>('/feeds/public').subscribe();

    const req = httpTesting.expectOne(`${environment.API_URL}/feeds/public`);
    req.flush([]);

    expect(warnSpy).toHaveBeenCalledOnce();
    expect(warnSpy).toHaveBeenCalledWith('API response is empty. Is this AIO feed public?');
  });

  it('does not warn when API response is a non-empty array', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    service.get<FeedItem[]>('/feeds/public').subscribe();

    const req = httpTesting.expectOne(`${environment.API_URL}/feeds/public`);
    req.flush([{ id: 1, label: 'kitchen' } satisfies FeedItem]);

    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('does not warn when API response is not an array', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    service.get<{ status: string }>('/feeds/status').subscribe();

    const req = httpTesting.expectOne(`${environment.API_URL}/feeds/status`);
    req.flush({ status: 'ok' });

    expect(warnSpy).not.toHaveBeenCalled();
  });
});
