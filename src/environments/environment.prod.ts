export const environment = {  // tslint:disable-line:ext-variable-name
  production: true,
  API_URL: '/api',
  MQTT_BROKER_URL: 'wss://io.adafruit.com:443/mqtt/',
  locationOutdatedThreshold: 900000,
  refreshTimeout: 300000,
  // refreshTimeout: 30000,
  snackbarDefaultTimeout: 5000,
  mapBackgroundUrl: '/assets/map.jpg',
  sentryDsn: 'https://ffefcdedb2c3409a99c1e740056a54e2@sentry.io/5169978',
};
