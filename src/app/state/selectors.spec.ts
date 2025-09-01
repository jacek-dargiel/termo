/**
 * Unit tests for selectors
 * Auto-generated empty scaffold - add tests below.
 */

import * as selectors from './selectors';
import { Measurment } from './measurment/measurment.model';
import { Location } from './location/location.model';

describe('state selectors', () => {
	test('selectMeasurmentsByLocation groups measurments by feed_key and returns empty arrays for missing locations', () => {
			const locationIDs: string[] = ['loc1', 'loc2', 'loc3'];
			const measurments: Measurment[] = [
				{ id: 'm1', value: 10, created_at: new Date(), feed_id: 1, feed_key: 'loc1' },
				{ id: 'm2', value: 5, created_at: new Date(), feed_id: 2, feed_key: 'loc2' },
				{ id: 'm3', value: 7, created_at: new Date(), feed_id: 1, feed_key: 'loc1' },
			];

			const result = selectors.selectMeasurmentsByLocation.projector(locationIDs, measurments);

			expect(result).toEqual<Record<string, Measurment[]>>({
				loc1: [measurments[0], measurments[2]],
				loc2: [measurments[1]],
				loc3: [],
			});
	});

	test('selectLastMeasurmentsByLocation picks measurment by latest ID mapping', () => {
			const locationIDs: string[] = ['loc1', 'loc2'];
			const latestMeasIDs: Record<string, string> = { loc1: 'm1', loc2: 'm2' };
			const measEntities: Record<string, Measurment> = {
				m1: { id: 'm1', value: 11, created_at: new Date(), feed_id: 1, feed_key: 'loc1' },
				m2: { id: 'm2', value: 22, created_at: new Date(), feed_id: 2, feed_key: 'loc2' },
			};

			const result = selectors.selectLastMeasurmentsByLocation.projector(locationIDs, latestMeasIDs, measEntities);

			expect(result).toEqual<Record<string, Measurment>>({ loc1: measEntities.m1, loc2: measEntities.m2 });
	});

	test('selectMinimalMeasurmentsByLocation returns smallest measurment (by value) per location or undefined', () => {
			const todaysMeas: Record<string, Measurment[]> = {
				loc1: [
					{ id: 'a', value: 10, created_at: new Date(), feed_id: 1, feed_key: 'loc1' },
					{ id: 'b', value: 2, created_at: new Date(), feed_id: 1, feed_key: 'loc1' },
				],
				loc2: [],
			};

			const result = selectors.selectMinimalMeasurmentsByLocation.projector(todaysMeas);

			expect(result.loc1).toEqual(expect.objectContaining({ id: 'b', value: 2 }));
			expect(result.loc2).toBeUndefined();
	});

	test('selectLocationsMappedWithKeyMeasurmentValues maps locations to include last/minimal values', () => {
			const locations: Location[] = [
				{ id: 'loc1', name: 'L1', mapPosition: { x: 0, y: 0 }, updatedAt: new Date() },
				{ id: 'loc2', name: 'L2', mapPosition: { x: 1, y: 1 }, updatedAt: new Date() },
			];

			const lastByLocation: Record<string, Measurment | undefined> = {
				loc1: { id: 'm1', value: 100, created_at: new Date(), feed_id: 1, feed_key: 'loc1' },
				loc2: { id: 'm2', value: 200, created_at: new Date(), feed_id: 2, feed_key: 'loc2' },
			};

			const minimalByLocation: Record<string, Measurment | undefined> = {
				loc1: { id: 'm3', value: 10, created_at: new Date(), feed_id: 1, feed_key: 'loc1' },
				loc2: undefined,
			};

			const result = selectors.selectLocationsMappedWithKeyMeasurmentValues.projector(
				locations,
				lastByLocation,
				minimalByLocation,
			);

			expect(result).toHaveLength(2);
			expect(result[0]).toEqual(expect.objectContaining({ id: 'loc1', lastMeasurmentValue: 100, minimalMeasurmentValue: 10 }));
			expect(result[1]).toEqual(expect.objectContaining({ id: 'loc2', lastMeasurmentValue: 200, minimalMeasurmentValue: null }));
	});
});
