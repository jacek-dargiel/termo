// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  API_URL: '/api',
  locationOutdatedThreshold: 900000,  // 15 min === 90000 ms
  refreshTimeout: 300000,             // 5 min === 30000 ms
  snackbarDefaultTimeout: 5000,
  mapBackgroundUrl: '/assets/map.jpg',
  feedDataLimit: 1000,
  // refreshTimeout: 30000,
  sentryDsn: 'https://ffefcdedb2c3409a99c1e740056a54e2@sentry.io/5169978',
};

/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
