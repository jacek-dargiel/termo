import { test, expect, Route } from '@playwright/test';

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


});
