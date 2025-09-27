import { test, expect, Route } from '@playwright/test';
import { getUnixTime, subMilliseconds, subMinutes } from 'date-fns';

import { environment } from '../src/environments/environment';
import { AIOFeed } from '../src/app/interfaces';

test.describe('Location loading', () => {
  test('renders the correct number of map locations on load', async ({ page }) => {
    await page.route('**/groups/tunele/feeds', async route => {
      const feeds: Partial<AIOFeed>[] = [
        {
          key: 'temperatura.gorny_tunel',
          name: 'Górny Tunel',
          description: JSON.stringify({ x: 0.25, y: 0.75 }),
          updated_at: '2018-09-19T22:10:00Z',
        },
        {
          key: 'temperatura.dolny_tunel',
          name: 'Dolny Tunel',
          description: JSON.stringify({ x: 0.5, y: 0.5 }),
          updated_at: '2018-09-19T22:10:00Z',
        },
        {
          key: 'temperatura.baza',
          name: 'Baza',
          description: JSON.stringify({ x: 0.8, y: 0.2 }),
          updated_at: '2018-09-19T22:10:00Z',
        },
      ];
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(feeds) });
    });

    await page.route('**/feeds/**/data', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    });

    await page.goto('/');

    await expect(page.locator('termo-map-location')).toHaveCount(3);
  });

  test('shows loading spinners while measurements load', async ({ page }) => {
    test.slow();
    await page.route('**/groups/tunele/feeds', async route => {
      const feeds: Partial<AIOFeed>[] = [
        {
          key: 'temperatura.gorny_tunel',
          name: 'Górny Tunel',
          description: JSON.stringify({ x: 0.25, y: 0.75 }),
          updated_at: '2018-09-19T22:10:00Z',
        },
        {
          key: 'temperatura.dolny_tunel',
          name: 'Dolny Tunel',
          description: JSON.stringify({ x: 0.5, y: 0.5 }),
          updated_at: '2018-09-19T22:10:00Z',
        },
        {
          key: 'temperatura.baza',
          name: 'Baza',
          description: JSON.stringify({ x: 0.8, y: 0.2 }),
          updated_at: '2018-09-19T22:10:00Z',
        },
      ];
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(feeds) });
    });

    const pendingMeasurementRoutes: Route[] = [];
    await page.route('**/feeds/**/data', async route => {
      pendingMeasurementRoutes.push(route);
    });

    await page.goto('/');

    await expect(page.locator('termo-map-location termo-spinner')).toHaveCount(3);

    await Promise.all(
      pendingMeasurementRoutes.splice(0).map(route =>
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) })
      )
    );
  });

  test('displays name, temperature and minimal temperature for a mocked location', async ({ page }) => {
    const now = new Date();
    const previous = subMinutes(now, 1);
    await page.route('api/groups/tunele/feeds', async route => {
      const feeds: Partial<AIOFeed>[] = [
        {
          key: 'temperature.feed_1234',
          name: 'Feed name goes here',
          description: JSON.stringify({ x: 0.25, y: 0.75 }),
          updated_at: now.toISOString(),
        }
      ];
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(feeds) });
    });

    await page.route('api/feeds/**/data?*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: '123',
            value: '23.45',
            feed_id: 1234,
            feed_key: 'temperature.feed_1234',
            created_at: now.toISOString(),
            created_epoch: Math.floor(now.getTime() / 1000)
          },
          {
            id: '124',
            value: '21.50',
            feed_id: 1234,
            feed_key: 'temperature.feed_1234',
            created_at: previous.toISOString(),
            created_epoch: Math.floor(previous.getTime() / 1000)
          }
        ])
      });
    });

    await page.goto('/');

    // Wait for any spinners to disappear
    await page.waitForSelector('termo-spinner', { state: 'detached' });

    const locationCard = page.getByRole('group', { name: 'location-card' });
    await expect(locationCard).toHaveCount(1);
    await expect(locationCard).toBeVisible();

    const locationName = locationCard.getByRole('heading');
    await expect(locationName).toContainText('Feed name goes here');

    const temperature = locationCard.getByTestId('location-temperature')
    expect(temperature).toBeVisible();
    await expect(temperature).toHaveText(/23[.,]45/);

    const minTemp = locationCard.getByTestId('location-minimal-value')
    await expect(minTemp).toBeVisible();
    await expect(minTemp).toContainText(/21[.,]50/);
  });

  test('displays "outdated" warnings for old data', async ({ page }) => {
    const now = new Date();
    const notOverdue = subMilliseconds(now, environment.locationOutdatedThreshold * 0.9);
    const overdue    = subMilliseconds(now, environment.locationOutdatedThreshold * 1.1);

    await page.route('api/groups/tunele/feeds', async route => {
      const feeds: Partial<AIOFeed>[] = [
        {
          key: 'temperature.feed_1234',
          name: 'Feed new',
          description: JSON.stringify({ x: 0.25, y: 0.75 }),
          updated_at: now.toISOString(),
        },
        {
          key: 'temperature.feed_5678',
          name: 'Feed not overdue',
          description: JSON.stringify({ x: 0.5, y: 0.5 }),
          updated_at: notOverdue.toISOString(),
        },
        {
          key: 'temperature.feed_9012',
          name: 'Feed overdue',
          description: JSON.stringify({ x: 0.75, y: 0.25 }),
          updated_at: overdue.toISOString(),
        },
      ];
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(feeds) });

    });
    await page.route('api/feeds/**/data', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    });

    await page.goto('/');

    // Wait for any spinners to disappear
    await page.waitForSelector('termo-spinner', { state: 'detached' });

    const locationCards = page.getByRole('group', { name: 'location-card' });
    await expect(locationCards).toHaveCount(3);

    for (let locationCard of await locationCards.all()) {
      await expect(locationCard).toBeVisible();
    }

    const feedNew = locationCards.filter({ has: page.getByRole('heading', { name: 'Feed new' }) });
    await expect(feedNew.getByTestId('location-outdated')).not.toBeVisible();

    const feedNotOverdue = locationCards.filter({ has: page.getByRole('heading', { name: 'Feed not overdue' }) });
    await expect(feedNotOverdue.getByTestId('location-outdated')).not.toBeVisible();

    const feedOverdue = locationCards.filter({ has: page.getByRole('heading', { name: 'Feed overdue' }) });
    await expect(feedOverdue.getByTestId('location-outdated')).toBeVisible();
    await expect(feedOverdue.getByTestId('location-outdated')).toContainText('Opóźnione:');
  });

  test('shows a chart with time axis and line after clicking a non-overdue location', async ({ page }) => {
    const now = new Date();
    const previous = subMinutes(now, 1);

    await page.route('**/groups/tunele/feeds', async route => {
      const feeds = [
        {
          key: 'temperature.fresh',
          name: 'Fresh Location',
          description: JSON.stringify({ x: 0.5, y: 0.5 }),
          updated_at: now.toISOString(),
        },
      ];
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(feeds) });
    });

    await page.route('api/feeds/**/data?*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: '1',
            value: '10',
            feed_id: 1,
            feed_key: 'temperature.fresh',
            created_at: now.toISOString(),
            created_epoch: getUnixTime(now)
          },
          {
            id: '2',
            value: '15',
            feed_id: 1,
            feed_key: 'temperature.fresh',
            created_at: previous.toISOString(),
            created_epoch: getUnixTime(previous)
          }
        ])
      });
    });

    await page.goto('/');

    // Wait for any spinners to disappear
    await page.waitForSelector('termo-spinner', { state: 'detached' });

    const locationCard = page.locator('termo-map-location');
    await locationCard.click();

    const svg = page.locator('ngx-charts-line-chart svg');
    await expect(svg).toBeVisible();

    // Check for time axis ticks
    const timeLabels = await svg.locator('.axis.x .tick text');
    const tickCount = await timeLabels.count();
    expect(tickCount).toBeGreaterThan(1);

    for (const tick of await timeLabels.all()) {
      await expect(tick).toContainText(/\d{2}:\d{2}/);  // Matches HH:MM format
    }

    // Check for line path presence
    const lineElement = svg.locator('.line-series path');
    await expect(lineElement).toBeVisible();
  });
});

test.describe('Refreshing data', () => {
  test('clicking the refresh button fetches new data', async ({ page }) => {
    const date2 = new Date();
    const date1 = subMinutes(date2, 1);
    await page.route('**/groups/tunele/feeds', async route => {
      const feeds = [
        {
          key: 'temperature.fresh',
          name: 'Fresh Location',
          description: JSON.stringify({ x: 0.5, y: 0.5 }),
          updated_at: date1.toISOString(),
        },
      ];
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(feeds) });
    });
    let feedRequestCount = 0;
    const dataPoints = [
      {
        id: '1',
        value: '10',
        feed_id: 1,
        feed_key: 'temperature.fresh',
        created_at: date1.toISOString(),
        created_epoch: getUnixTime(date1)
      },
      {
        id: '2',
        value: '15',
        feed_id: 1,
        feed_key: 'temperature.fresh',
        created_at: date2.toISOString(),
        created_epoch: getUnixTime(date2)
      }
    ]
    await page.route('api/feeds/**/data?*', async route => {
      feedRequestCount++;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(dataPoints.slice(0, feedRequestCount))
      });
    });

    await page.goto('/');

    // Wait for any spinners to disappear
    await page.waitForSelector('termo-spinner', { state: 'detached' });

    const locationCard = page.locator('termo-map-location');
    await expect(locationCard).toBeVisible();

    const temperature = locationCard.getByTestId('location-temperature')
    const minimal = locationCard.getByTestId('location-minimal-value')
    await expect(temperature).toBeVisible();
    await expect(temperature).toHaveText('10.00');
    await expect(minimal).toBeVisible();
    await expect(minimal).toHaveText('10.00');

    const refreshButton = page.getByRole('button', { name: 'Odśwież' });
    await refreshButton.click();

    await expect(temperature).toHaveText('15.00');
    await expect(minimal).toHaveText('10.00');
  });

  test('data is auto-refreshed when predefined time passes', async ({ page }) => {
    await page.clock.install();
    const date2 = new Date();
    const date1 = subMinutes(date2, 1);
    await page.route('**/groups/tunele/feeds', async route => {
      const feeds = [
        {
          key: 'temperature.fresh',
          name: 'Fresh Location',
          description: JSON.stringify({ x: 0.5, y: 0.5 }),
          updated_at: date1.toISOString(),
        },
      ];
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(feeds) });
    });
    let feedRequestCount = 0;
    const dataPoints = [
      {
        id: '1',
        value: '10',
        feed_id: 1,
        feed_key: 'temperature.fresh',
        created_at: date1.toISOString(),
        created_epoch: getUnixTime(date1)
      },
      {
        id: '2',
        value: '15',
        feed_id: 1,
        feed_key: 'temperature.fresh',
        created_at: date2.toISOString(),
        created_epoch: getUnixTime(date2)
      }
    ]
    await page.route('api/feeds/**/data?*', async route => {
      feedRequestCount++;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(dataPoints.slice(0, feedRequestCount))
      });
    });

    await page.goto('/');

    // Wait for any spinners to disappear
    await page.waitForSelector('termo-spinner', { state: 'detached' });

    const locationCard = page.locator('termo-map-location');
    await expect(locationCard).toBeVisible();

    const temperature = locationCard.getByTestId('location-temperature')
    const minimal = locationCard.getByTestId('location-minimal-value')
    await expect(temperature).toBeVisible();
    await expect(temperature).toHaveText('10.00');
    await expect(minimal).toBeVisible();
    await expect(minimal).toHaveText('10.00');

    // Advance clock just before the refresh timeout
    await page.clock.runFor(environment.refreshTimeout - 1000);
    await expect(temperature).toHaveText('10.00');
    await expect(minimal).toHaveText('10.00');

    // Advance clock to exceed the refresh timeout
    await page.clock.runFor(2000);
    await expect(temperature).toHaveText('15.00');
    await expect(minimal).toHaveText('10.00');
  });

});
