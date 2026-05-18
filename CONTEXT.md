# Termo

Monitors temperature from weather stations via Adafruit IO, displaying them on a map and chart.

## Language

**Location**:
A weather station that produces temperature measurements.
_Avoid_: Station, sensor, feed, tunel

**Measurement**:
A single temperature reading produced by a Location, consisting of a value and a timestamp.
_Avoid_: Reading, data point, feed data, AIOFeedData

**Feed**:
An Adafruit IO data stream that delivers measurements for a Location. An API-level concept, not a domain concept.
_Avoid_: Channel, stream

**Refresh Timer**:
A mechanism that periodically re-fetches measurements for all locations. Runs on a configurable interval, pauses when the browser tab is hidden, and exposes a countdown for the progress bar.
_Avoid_: Polling, interval, auto-refresh

**Outdated**:
A Location whose most recent Measurement is older than the configurable threshold (15 minutes). Displayed to users as a warning.
_Avoid_: Stale, expired

**Last Measurement**:
The most recent Measurement (by timestamp) for a given Location.
_Avoid_: Latest reading, current value

**Minimum Measurement**:
The lowest-temperature Measurement for a given Location within the last 12 hours.
_Avoid_: Min value, low reading

## Relationships

- A **Location** produces many **Measurements**
- A **Feed** maps 1:1 to a **Location** in the Adafruit IO API
- A **Location** has one **Last Measurement** and one **Minimum Measurement**
- A Location is **Outdated** when its last Measurement is older than the threshold
- The **Refresh Timer** triggers a fetch of Measurements for all Locations

## Example dialogue

> **Dev:** "When the Refresh Timer fires, do we consider a Location Outdated immediately?"
> **Domain expert:** "No — a Location becomes Outdated only when its Last Measurement is older than 15 minutes, regardless of when the Refresh Timer last fired."
> **Dev:** "So a Location could be up-to-date even if the Refresh Timer hasn't fired recently?"
> **Domain expert:** "Correct. Outdated is a property of the Measurement data, not of the Refresh Timer."
> **Dev:** "And the Minimum Measurement — that's always from the last 12 hours?"
> **Domain expert:** "Yes. If a Location has no Measurements in the last 12 hours, it has no Minimum Measurement at all."
