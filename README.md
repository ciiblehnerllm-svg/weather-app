# AuraWeather — Git Worktree Edition

A modern, responsive atmospheric weather forecasting application built inside an isolated Git worktree on branch `weather-app`.

## Architecture & Worktree Setup
This repository uses Git Worktrees to isolate work without interfering with Codex's active workspace on `main`:
- **Main Worktree (Branch: `main`)**: Contains Codex's active code (`codex free pokusaj 2`). Untouched and preserved.
- **Secondary Worktree (Branch: `weather-app`)**: Contains AuraWeather located in `weather-app-worktree/`.

## Features
- **Live Meteorological Data**: Powered by [Open-Meteo](https://open-meteo.com/) (Worldwide coverage, zero API keys required).
- **Dynamic Atmospheric Canvas**: Real-time particle effects matching current conditions (falling raindrops, gentle snowfall, twinkling stars for clear night, glowing sunbeams).
- **Comprehensive Weather Metrics**:
  - Temperature & Apparent "Feels like" temperature
  - 24-Hour Hourly forecast with conditions and rain probabilities
  - 7-Day Extended forecast with min-max temperature range gradient bars
  - Wind speed & direction with rotating live compass & Beaufort scale rating
  - Humidity & Dew point calculation
  - UV Index meter with color-coded warning category
  - Atmospheric pressure (hPa) & precipitation chance
  - Sun & Daylight tracker with real-time astronomical arc position calculation
- **Global Search & Autocomplete**: Search any city or town worldwide with debounce and instant geocoding.
- **Favorites & Pinned Locations**: Pin favorite cities to quick-access chips (stored in `localStorage`).
- **One-Click Unit Toggle**: Seamlessly switch between Celsius (°C, km/h) and Fahrenheit (°F, mph).
- **Offline Resilience & Fallback**: Automatic demo data simulation if offline or when API is unreachable.
- **Zero Build Tools Required**: Pure standard modern ES6+ JavaScript, Semantic HTML5, and CSS3 Glassmorphism design.

## How to Run
Open `index.html` directly in any web browser, or serve with any static HTTP server:
```bash
# Using Python
python -m http.server 8000

# Or simply double-click index.html
```
