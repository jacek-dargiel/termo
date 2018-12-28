import { TestBed } from '@angular/core/testing';

import { MQTTClientService } from './mqtt.service';

describe('MqttService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MQTTClientService = TestBed.get(MQTTClientService);
    expect(service).toBeTruthy();
  });
});
