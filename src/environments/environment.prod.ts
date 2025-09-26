import ms from 'ms';

export const environment = {
  production: true,
  API_URL: '/api',
  locationOutdatedThreshold: ms('15m'),
  refreshTimeout: ms('5m'),
  feedDataLimit: 1000,
  snackbarDefaultTimeout: ms('5s'),
  mapBackgroundUrl: '/assets/map.jpg',
  sentryDsn: 'https://ffefcdedb2c3409a99c1e740056a54e2@sentry.io/5169978',
};
