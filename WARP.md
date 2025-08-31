# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Termo is an Angular-based temperature monitoring application that displays real-time weather data from Adafruit IO feeds. The app visualizes temperature measurements on an interactive map and provides historical charts for selected locations.

## Development Commands

### Basic Operations
- `npm start` - Start development server with proxy configuration for Adafruit IO API
- `npm run build` - Production build with AOT compilation
- `npm run lint` - Run ESLint on TypeScript and HTML files
- `npm run deploy` - Full deployment pipeline (lint → build → post-deploy)

### Analysis & Debugging
- `npm run get-stats` - Generate bundle statistics for analysis
- `npm run bundle-analyze` - Open webpack bundle analyzer with build stats
- `ng test` - Run unit tests (Karma configuration in `src/karma.conf.js`)
- `ng e2e` - Run end-to-end tests

### Environment Setup
The app uses environment variables for configuration. Development proxy routes `/api/*` to `https://io.adafruit.com/api/v2/przemekd/*` (see `proxy.conf.json`).

## Architecture Overview

### State Management (NgRx)
The application follows a strict NgRx pattern with:

**Feature States:**
- `location` - Manages weather station locations with map positions and metadata
- `measurment` - Handles temperature measurements with Entity Store pattern

**Key Patterns:**
- Entity adapters for normalized state management of locations and measurements
- Facade pattern for component-store communication (e.g., `ChartFacade`, `MapFacade`)
- Effects-driven side effects for API calls and state synchronization

### Component Architecture
**Container/Presentational Pattern:**
- **Containers** (`src/app/containers/`): Smart components that connect to NgRx state
  - `chart/` - Historical temperature visualization
  - `header/` - App header with refresh functionality  
  - `map/` - Interactive location map display

- **Components** (`src/app/components/`): Dumb presentational components
  - `map-location/` - Individual location markers on map
  - `refresh-button/` - Reusable refresh control
  - `spinner/`, `snackbar/` - UI feedback components

### Services & Data Flow
- `LocationService` - Fetches and transforms location data from Adafruit IO feeds
- `MeasurmentService` - Handles temperature measurement data with pagination
- `ApiService` - Base HTTP client with environment-based URL configuration
- `ErrorHandlingService` + `SentryErrorHandler` - Global error monitoring

### External Integrations
- **Adafruit IO API** - Primary data source for weather measurements
- **Sentry** - Error tracking and performance monitoring
- **Netlify** - Deployment platform with serverless function proxying
- **@swimlane/ngx-charts** - Chart visualization library

## Key Configuration Points

### Environment Variables
- `API_URL` - Base path for API calls (proxied in development)
- `feedDataLimit` - Maximum measurements to fetch (default: 1000)
- `locationOutdatedThreshold` - Milliseconds before location considered stale (15 min)
- `refreshTimeout` - Auto-refresh interval (5 min)

### Map Integration
Location markers are positioned using JSON coordinates stored in Adafruit IO feed descriptions. The `parseMapPosition()` method in `LocationService` handles coordinate extraction.

### State Synchronization
The app maintains consistency between location updates and measurement data through cross-reducer actions. When measurements are fetched, the location reducer updates the corresponding location's `updatedAt` timestamp.

## Testing Strategy
- Snapshot testing for components (`__snapshots__/` directories)
- Unit tests follow Angular testing patterns with TestBed
- Jest configuration available (`jestGlobalMocks.ts`, `setupJest.ts`)

## Deployment Notes
- Production builds use AOT compilation and optimization
- Sentry releases are created automatically during deployment
- Environment variable substitution happens at build time via `envsub`
- Netlify redirects proxy API calls to avoid CORS issues in production
