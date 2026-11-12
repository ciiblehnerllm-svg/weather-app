/**
 * AuraWeather - Git Worktree Edition
 * Real-time atmospheric forecast with dynamic canvas animations, 24h hourly & 7-day forecast.
 */

// State Management
const state = {
  currentUnit: 'C', // 'C' or 'F'
  currentData: null,
  currentLocation: {
    name: 'Belgrade',
    region: 'Serbia',
    latitude: 44.8176,
    longitude: 20.4633
  },
  favorites: [
    { name: 'Belgrade', region: 'Serbia', latitude: 44.8176, longitude: 20.4633 },
    { name: 'Vienna', region: 'Austria', latitude: 48.2082, longitude: 16.3738 },
    { name: 'Zurich', region: 'Switzerland', latitude: 47.3769, longitude: 8.5417 },
    { name: 'Tokyo', region: 'Japan', latitude: 35.6762, longitude: 139.6503 },
    { name: 'New York', region: 'United States', latitude: 40.7128, longitude: -74.0060 }
  ],
  canvasAnimId: null,
  canvasParticles: []
};

// SVG Weather Icons
const WeatherIcons = {
  clearDay: `<svg viewBox="0 0 100 100" class="w-icon"><defs><linearGradient id="sunGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#fde047"/><stop offset="100%" stop-color="#f59e0b"/></linearGradient></defs><circle cx="50" cy="50" r="22" fill="url(#sunGrad)"/><g stroke="#fbbf24" stroke-width="3" stroke-linecap="round"><line x1="50" y1="12" x2="50" y2="20"/><line x1="50" y1="80" x2="50" y2="88"/><line x1="12" y1="50" x2="20" y2="50"/><line x1="80" y1="50" x2="88" y2="50"/><line x1="23" y1="23" x2="29" y2="29"/><line x1="71" y1="71" x2="77" y2="77"/><line x1="23" y1="77" x2="29" y2="71"/><line x1="71" y1="29" x2="77" y2="23"/></g></svg>`,
  clearNight: `<svg viewBox="0 0 100 100" class="w-icon"><defs><linearGradient id="moonGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#f8fafc"/><stop offset="100%" stop-color="#94a3b8"/></linearGradient></defs><path d="M62 25 A28 28 0 1 0 75 75 A32 32 0 0 1 62 25 Z" fill="url(#moonGrad)"/><circle cx="70" cy="30" r="1.5" fill="#fef08a"/><circle cx="78" cy="46" r="1" fill="#fef08a"/><circle cx="34" cy="22" r="1.5" fill="#fef08a"/></svg>`,
  partlyCloudyDay: `<svg viewBox="0 0 100 100" class="w-icon"><circle cx="40" cy="40" r="18" fill="#f59e0b"/><path d="M35 72h40a15 15 0 0 0 0-30 22 22 0 0 0-42-2 16 16 0 0 0-6 32Z" fill="#e2e8f0" stroke="#cbd5e1" stroke-width="2"/><path d="M30 68h40a15 15 0 0 0 0-30 22 22 0 0 0-42-2 16 16 0 0 0-6 32Z" fill="#ffffff"/></svg>`,
  partlyCloudyNight: `<svg viewBox="0 0 100 100" class="w-icon"><path d="M48 24 A20 20 0 1 0 60 55 A24 24 0 0 1 48 24 Z" fill="#cbd5e1"/><path d="M35 75h42a14 14 0 0 0 0-28 20 20 0 0 0-38-3 15 15 0 0 0-4 31Z" fill="#64748b"/><path d="M30 70h42a14 14 0 0 0 0-28 20 20 0 0 0-38-3 15 15 0 0 0-4 31Z" fill="#94a3b8"/></svg>`,
  cloudy: `<svg viewBox="0 0 100 100" class="w-icon"><path d="M32 74h44a16 16 0 0 0 0-32 23 23 0 0 0-44-3 17 17 0 0 0-6 35Z" fill="#94a3b8"/><path d="M26 68h44a16 16 0 0 0 0-32 23 23 0 0 0-44-3 17 17 0 0 0-6 35Z" fill="#cbd5e1"/></svg>`,
  rain: `<svg viewBox="0 0 100 100" class="w-icon"><path d="M28 58h46a16 16 0 0 0 0-32 23 23 0 0 0-44-3 17 17 0 0 0-6 35Z" fill="#94a3b8"/><g stroke="#38bdf8" stroke-width="3" stroke-linecap="round"><line x1="36" y1="68" x2="30" y2="82"/><line x1="52" y1="68" x2="46" y2="82"/><line x1="68" y1="68" x2="62" y2="82"/></g></svg>`,
  snow: `<svg viewBox="0 0 100 100" class="w-icon"><path d="M28 58h46a16 16 0 0 0 0-32 23 23 0 0 0-44-3 17 17 0 0 0-6 35Z" fill="#cbd5e1"/><g fill="#bae6fd"><circle cx="34" cy="74" r="3"/><circle cx="50" cy="80" r="3"/><circle cx="66" cy="74" r="3"/><circle cx="42" cy="88" r="2.5"/><circle cx="58" cy="88" r="2.5"/></g></svg>`,
  thunderstorm: `<svg viewBox="0 0 100 100" class="w-icon"><path d="M28 54h46a16 16 0 0 0 0-32 23 23 0 0 0-44-3 17 17 0 0 0-6 35Z" fill="#475569"/><polygon points="48,56 38,72 48,72 44,90 58,68 49,68" fill="#facc15"/></svg>`,
  fog: `<svg viewBox="0 0 100 100" class="w-icon"><path d="M30 50h40a14 14 0 0 0 0-28 20 20 0 0 0-38-2 15 15 0 0 0-4 30Z" fill="#94a3b8" opacity="0.6"/><g stroke="#cbd5e1" stroke-width="3" stroke-linecap="round"><line x1="22" y1="62" x2="78" y2="62"/><line x1="28" y1="72" x2="72" y2="72"/><line x1="34" y1="82" x2="66" y2="82"/></g></svg>`
};

// Weather Code Mapping
function interpretWeatherCode(code, isDay = 1) {
  if (code === 0) {
    return {
      description: isDay ? 'Clear Sky' : 'Clear Night',
      category: 'clear',
      icon: isDay ? WeatherIcons.clearDay : WeatherIcons.clearNight,
      themeClass: isDay ? 'theme-clear-day' : 'theme-clear-night'
    };
  }
  if (code === 1 || code === 2) {
    return {
      description: isDay ? 'Mainly Sunny' : 'Partly Cloudy',
      category: 'partly-cloudy',
      icon: isDay ? WeatherIcons.partlyCloudyDay : WeatherIcons.partlyCloudyNight,
      themeClass: isDay ? 'theme-clear-day' : 'theme-clear-night'
    };
  }
  if (code === 3) {
    return {
      description: 'Overcast Clouds',
      category: 'cloudy',
      icon: WeatherIcons.cloudy,
      themeClass: 'theme-clouds'
    };
  }
  if (code >= 45 && code <= 48) {
    return {
      description: 'Foggy Conditions',
      category: 'fog',
      icon: WeatherIcons.fog,
      themeClass: 'theme-clouds'
    };
  }
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) {
    return {
      description: code >= 65 || code === 82 ? 'Heavy Rain' : 'Showers & Rain',
      category: 'rain',
      icon: WeatherIcons.rain,
      themeClass: 'theme-rain'
    };
  }
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) {
    return {
      description: 'Snowfall',
      category: 'snow',
      icon: WeatherIcons.snow,
      themeClass: 'theme-snow'
    };
  }
  if (code >= 95) {
    return {
      description: 'Thunderstorm',
      category: 'thunderstorm',
      icon: WeatherIcons.thunderstorm,
      themeClass: 'theme-thunderstorm'
    };
  }
  return {
    description: 'Cloudy',
    category: 'cloudy',
    icon: WeatherIcons.cloudy,
    themeClass: 'theme-clouds'
  };
}

// Temperature Conversion
function toDisplayTemp(celsius) {
  if (celsius === null || celsius === undefined || isNaN(celsius)) return '--';
  const val = state.currentUnit === 'F' ? (celsius * 9) / 5 + 32 : celsius;
  return Math.round(val);
}

// Wind speed conversion
function toDisplayWind(kmh) {
  if (kmh === null || kmh === undefined || isNaN(kmh)) return { speed: '--', unit: 'km/h' };
  if (state.currentUnit === 'F') {
    return { speed: Math.round(kmh * 0.621371), unit: 'mph' };
  }
  return { speed: Math.round(kmh), unit: 'km/h' };
}

// Beaufort scale calculator
function getBeaufortScale(kmh) {
  if (kmh < 1) return 'Calm';
  if (kmh <= 5) return 'Light air';
  if (kmh <= 11) return 'Light breeze';
  if (kmh <= 19) return 'Gentle breeze';
  if (kmh <= 28) return 'Moderate breeze';
  if (kmh <= 38) return 'Fresh breeze';
  if (kmh <= 49) return 'Strong breeze';
  if (kmh <= 61) return 'Near gale';
  return 'Gale force';
}

// Wind compass label
function getCompassDirection(deg) {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round((deg % 360) / 22.5) % 16;
  return directions[index];
}

// UV Index Evaluation
function evaluateUV(uv) {
  if (uv < 3) return { cat: 'Low', advice: 'Minimal protection needed' };
  if (uv < 6) return { cat: 'Moderate', advice: 'Wear sunglasses & hat' };
  if (uv < 8) return { cat: 'High', advice: 'Sunscreen SPF 30+ recommended' };
  if (uv < 11) return { cat: 'Very High', advice: 'Seek shade during midday' };
  return { cat: 'Extreme', advice: 'Avoid sun exposure around noon' };
}

// Smart Wardrobe & Lifestyle Engine
function generateSmartAdvice(tempC, weatherCode, windSpeed, rainProb) {
  const tips = [];

  if (rainProb > 40 || [51, 53, 55, 61, 63, 65, 80, 81, 82, 95].includes(weatherCode)) {
    tips.push('Carry an umbrella or raincoat today');
  }

  if (tempC < 0) {
    tips.push('Heavy winter coat, scarf & gloves essential');
  } else if (tempC < 10) {
    tips.push('Warm layers and jacket recommended');
  } else if (tempC < 18) {
    tips.push('Light jacket or sweater is ideal');
  } else if (tempC < 26) {
    tips.push('Comfortable T-shirt weather');
  } else {
    tips.push('Light breathable clothes & stay hydrated');
  }

  if (windSpeed > 30) {
    tips.push('Breezy conditions, windbreaker recommended');
  }

  return tips.join(' • ');
}

// Fetch live weather data from Open-Meteo
async function fetchWeather(lat, lon, cityName, region) {
  showLoadingState();
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,relative_humidity_2m,dew_point_2m,precipitation_probability,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max&timezone=auto&forecast_days=7`;

    const res = await fetch(url);
    if (!res.ok) throw new Error('Weather API request failed');
    const data = await res.json();

    state.currentData = data;
    state.currentLocation = { name: cityName, region: region, latitude: lat, longitude: lon };

    renderWeather();
    updateFavoritesUI();
    hideToast();
  } catch (err) {
    console.error('Fetch error:', err);
    showToast('Unable to fetch live forecast. Showing offline demo data.');
    useDemoData(cityName, region, lat, lon);
  }
}

// Fallback demo data if offline
function useDemoData(name, region, lat, lon) {
  const now = new Date();
  const times = [];
  const temps = [];
  const codes = [];
  const rains = [];

  for (let i = 0; i < 24; i++) {
    const d = new Date(now.getTime() + i * 3600000);
    times.push(d.toISOString().slice(0, 16));
    temps.push(16 + Math.sin(i / 3) * 6);
    codes.push(i % 5 === 0 ? 1 : 2);
    rains.push(Math.round(Math.random() * 20));
  }

  const dailyDates = [];
  const dailyMax = [];
  const dailyMin = [];
  const dailyCodes = [];
  const sunrises = [];
  const sunsets = [];

  for (let d = 0; d < 7; d++) {
    const dayDate = new Date(now.getTime() + d * 86400000);
    dailyDates.push(dayDate.toISOString().slice(0, 10));
    dailyMax.push(20 - d * 0.5);
    dailyMin.push(11 - d * 0.3);
    dailyCodes.push(d === 2 ? 61 : d % 2 === 0 ? 0 : 2);
    sunrises.push(`${dayDate.toISOString().slice(0, 10)}T06:35`);
    sunsets.push(`${dayDate.toISOString().slice(0, 10)}T16:42`);
  }

  state.currentData = {
    current: {
      temperature_2m: 17.5,
      relative_humidity_2m: 58,
      apparent_temperature: 16.8,
      is_day: 1,
      precipitation: 0,
      weather_code: 1,
      surface_pressure: 1018,
      wind_speed_10m: 14.2,
      wind_direction_10m: 135
    },
    hourly: {
      time: times,
      temperature_2m: temps,
      relative_humidity_2m: Array(24).fill(60),
      dew_point_2m: temps.map(t => t - 6),
      precipitation_probability: rains,
      weather_code: codes
    },
    daily: {
      time: dailyDates,
      weather_code: dailyCodes,
      temperature_2m_max: dailyMax,
      temperature_2m_min: dailyMin,
      sunrise: sunrises,
      sunset: sunsets,
      uv_index_max: [4.2, 4.0, 2.5, 3.8, 4.5, 4.1, 3.9]
    }
  };

  state.currentLocation = { name, region, latitude: lat, longitude: lon };
  renderWeather();
  updateFavoritesUI();
}

function showLoadingState() {
  document.getElementById('currentCity').textContent = 'Updating...';
  document.getElementById('localTime').textContent = 'Fetching meteorological models...';
}

// Render full forecast interface
function renderWeather() {
  if (!state.currentData) return;

  const { current, hourly, daily } = state.currentData;
  const loc = state.currentLocation;
  const weatherInfo = interpretWeatherCode(current.weather_code, current.is_day);

  // Update theme background class
  document.body.className = weatherInfo.themeClass;
  setupAtmosphericCanvas(weatherInfo.category, current.is_day);

  // Header & City
  const displayName = loc.region ? `${loc.name}, ${loc.region}` : loc.name;
  document.getElementById('currentCity').textContent = displayName;

  const now = new Date();
  document.getElementById('localTime').textContent = now.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  document.getElementById('heroConditionBadge').textContent = weatherInfo.description;
  document.getElementById('mainTemp').textContent = toDisplayTemp(current.temperature_2m);
  document.getElementById('heroFeelsLike').textContent = `${toDisplayTemp(current.apparent_temperature)}°`;
  document.getElementById('heroTempMax').textContent = `${toDisplayTemp(daily.temperature_2m_max[0])}°`;
  document.getElementById('heroTempMin').textContent = `${toDisplayTemp(daily.temperature_2m_min[0])}°`;

  // Hero Icon
  document.getElementById('heroIconContainer').innerHTML = weatherInfo.icon;

  // Narrative & Tips
  const precipProb = hourly.precipitation_probability ? hourly.precipitation_probability[0] : 0;
  document.getElementById('weatherNarrative').textContent = `${weatherInfo.description} with humidity at ${current.relative_humidity_2m}%.`;
  document.getElementById('tipText').textContent = generateSmartAdvice(current.temperature_2m, current.weather_code, current.wind_speed_10m, precipProb);

  // Metrics
  const wind = toDisplayWind(current.wind_speed_10m);
  document.getElementById('windSpeed').textContent = wind.speed;
  document.getElementById('windUnit').textContent = wind.unit;
  document.getElementById('compassNeedle').style.transform = `rotate(${current.wind_direction_10m}deg)`;
  document.getElementById('windDirectionText').textContent = `${getCompassDirection(current.wind_direction_10m)} (${Math.round(current.wind_direction_10m)}°)`;
  document.getElementById('windBeaufort').textContent = getBeaufortScale(current.wind_speed_10m);

  // Humidity & Dew point
  document.getElementById('humidityVal').textContent = current.relative_humidity_2m;
  document.getElementById('humidityBar').style.width = `${current.relative_humidity_2m}%`;
  const dewPoint = hourly.dew_point_2m ? hourly.dew_point_2m[0] : current.temperature_2m - 7;
  document.getElementById('dewPointText').textContent = `Dew point ${toDisplayTemp(dewPoint)}°`;

  // UV Index
  const uv = daily.uv_index_max ? daily.uv_index_max[0] : 3.0;
  const uvEval = evaluateUV(uv);
  document.getElementById('uvVal').textContent = Number(uv).toFixed(1);
  document.getElementById('uvCategory').textContent = uvEval.cat;
  document.getElementById('uvAdvice').textContent = uvEval.advice;
  document.getElementById('uvIndicator').style.left = `${Math.min(95, (uv / 11) * 100)}%`;

  // Pressure & Rain
  document.getElementById('pressureVal').textContent = Math.round(current.surface_pressure);
  document.getElementById('precipProb').textContent = `${precipProb}%`;
  document.getElementById('pressureStatus').textContent = current.surface_pressure < 1005 ? 'Low pressure system' : current.surface_pressure > 1022 ? 'High pressure, stable air' : 'Normal atmospheric pressure';

  // Sun Arc & Daylight
  const sunriseRaw = daily.sunrise[0];
  const sunsetRaw = daily.sunset[0];
  const sunriseStr = sunriseRaw ? sunriseRaw.slice(11, 16) : '06:00';
  const sunsetStr = sunsetRaw ? sunsetRaw.slice(11, 16) : '18:00';
  document.getElementById('sunriseTime').textContent = sunriseStr;
  document.getElementById('sunsetTime').textContent = sunsetStr;

  calculateSunPosition(sunriseRaw, sunsetRaw);

  // Render 24H Hourly
  renderHourlyForecast(hourly);

  // Render 7-Day Forecast
  render7DayForecast(daily);

  // Asynchronously record forecast snapshot to Neon DB
  recordWeatherToNeon(loc, current, weatherInfo);
}

// Calculate sun arc progress
function calculateSunPosition(sunriseISO, sunsetISO) {
  if (!sunriseISO || !sunsetISO) return;
  const sunrise = new Date(sunriseISO).getTime();
  const sunset = new Date(sunsetISO).getTime();
  const now = Date.now();

  const totalDaylightMs = sunset - sunrise;
  const daylightHours = (totalDaylightMs / (1000 * 60 * 60)).toFixed(1);
  document.getElementById('daylightLength').textContent = `${daylightHours} hrs daylight`;

  const orb = document.getElementById('sunPositionOrb');
  if (now <= sunrise) {
    orb.setAttribute('cx', '20');
    orb.setAttribute('cy', '90');
    orb.style.opacity = '0.3';
  } else if (now >= sunset) {
    orb.setAttribute('cx', '220');
    orb.setAttribute('cy', '90');
    orb.style.opacity = '0.3';
  } else {
    orb.style.opacity = '1';
    const progress = (now - sunrise) / totalDaylightMs; // 0 to 1
    const x = 20 + progress * 200;
    // Quadratic arc calculation: M 20 90 Q 120 10 220 90
    // B(t) = (1-t)^2 * P0 + 2(1-t)t * P1 + t^2 * P2
    const t = progress;
    const y = Math.pow(1 - t, 2) * 90 + 2 * (1 - t) * t * 10 + Math.pow(t, 2) * 90;
    orb.setAttribute('cx', x.toFixed(1));
    orb.setAttribute('cy', y.toFixed(1));
  }
}

// Render Hourly Forecast Cards
function renderHourlyForecast(hourly) {
  const container = document.getElementById('hourlyContainer');
  container.innerHTML = '';

  const nowIsoHour = new Date().toISOString().slice(0, 13);
  let startIndex = hourly.time.findIndex(t => t.startsWith(nowIsoHour));
  if (startIndex === -1) startIndex = 0;

  const hoursToShow = 24;
  for (let i = 0; i < hoursToShow; i++) {
    const idx = startIndex + i;
    if (idx >= hourly.time.length) break;

    const timeStr = hourly.time[idx];
    const hourDate = new Date(timeStr);
    const hourLabel = i === 0 ? 'Now' : hourDate.toLocaleTimeString('en-US', { hour: 'numeric' });
    const isDay = hourDate.getHours() >= 6 && hourDate.getHours() < 20 ? 1 : 0;
    const wInfo = interpretWeatherCode(hourly.weather_code[idx], isDay);
    const rain = hourly.precipitation_probability ? hourly.precipitation_probability[idx] : 0;

    const hourCard = document.createElement('div');
    hourCard.className = `hourly-item ${i === 0 ? 'current-hour' : ''}`;
    hourCard.innerHTML = `
      <span class="hour-time-label">${hourLabel}</span>
      <div class="hourly-icon-wrap">${wInfo.icon}</div>
      <span class="hour-temp-val">${toDisplayTemp(hourly.temperature_2m[idx])}°</span>
      <span class="hour-rain-chance">${rain > 0 ? rain + '%' : ''}</span>
    `;
    container.appendChild(hourCard);
  }
}

// Render 7-Day Extended Forecast
function render7DayForecast(daily) {
  const container = document.getElementById('forecastList');
  container.innerHTML = '';

  const globalMax = Math.max(...daily.temperature_2m_max);
  const globalMin = Math.min(...daily.temperature_2m_min);
  const range = (globalMax - globalMin) || 1;

  for (let i = 0; i < daily.time.length; i++) {
    const dayDate = new Date(`${daily.time[i]}T12:00:00`);
    const isToday = i === 0;
    const dayName = isToday ? 'Today' : dayDate.toLocaleDateString('en-US', { weekday: 'short' });
    const wInfo = interpretWeatherCode(daily.weather_code[i], 1);

    const min = daily.temperature_2m_min[i];
    const max = daily.temperature_2m_max[i];

    // Compute range bar percentages
    const leftPercent = Math.max(0, ((min - globalMin) / range) * 100);
    const widthPercent = Math.max(10, ((max - min) / range) * 100);

    const row = document.createElement('div');
    row.className = 'forecast-row';
    row.innerHTML = `
      <span class="forecast-day ${isToday ? 'today' : ''}">${dayName}</span>
      <div class="forecast-icon">${wInfo.icon}</div>
      <div class="temp-bar-container">
        <div class="temp-bar-fill" style="left: ${leftPercent}%; width: ${widthPercent}%;"></div>
      </div>
      <div class="forecast-temps">
        <span class="forecast-min">${toDisplayTemp(min)}°</span>
        <span class="forecast-max">${toDisplayTemp(max)}°</span>
      </div>
    `;
    container.appendChild(row);
  }
}

// City Geocoding & Autocomplete Search
let searchDebounce = null;
const searchInput = document.getElementById('cityInput');
const searchResults = document.getElementById('searchResults');
const clearSearchBtn = document.getElementById('clearSearchBtn');

searchInput.addEventListener('input', () => {
  const query = searchInput.value.trim();
  clearSearchBtn.hidden = query.length === 0;
  clearTimeout(searchDebounce);

  if (query.length < 2) {
    searchResults.hidden = true;
    return;
  }

  searchDebounce = setTimeout(() => performCitySearch(query), 300);
});

clearSearchBtn.addEventListener('click', () => {
  searchInput.value = '';
  clearSearchBtn.hidden = true;
  searchResults.hidden = true;
  searchInput.focus();
});

document.addEventListener('click', (e) => {
  if (!e.target.closest('.search-container')) {
    searchResults.hidden = true;
  }
});

async function performCitySearch(query) {
  searchResults.hidden = false;
  searchResults.innerHTML = '<div class="search-empty-state">Searching global weather databases...</div>';

  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=6&language=en&format=json`;
    const res = await fetch(url);
    const data = await res.json();

    if (!data.results || data.results.length === 0) {
      searchResults.innerHTML = '<div class="search-empty-state">No matching cities found. Try another spelling.</div>';
      return;
    }

    searchResults.innerHTML = '';
    data.results.forEach(item => {
      const btn = document.createElement('button');
      btn.className = 'search-item';
      btn.type = 'button';
      const region = [item.admin1, item.country].filter(Boolean).join(', ');
      btn.innerHTML = `
        <div>
          <div class="search-item-main">${item.name}</div>
          <div class="search-item-sub">${region}</div>
        </div>
        <span class="search-item-sub">${item.elevation ? Math.round(item.elevation) + 'm' : ''}</span>
      `;
      btn.addEventListener('click', () => {
        searchResults.hidden = true;
        searchInput.value = '';
        clearSearchBtn.hidden = true;
        fetchWeather(item.latitude, item.longitude, item.name, region);
      });
      searchResults.appendChild(btn);
    });
  } catch (err) {
    searchResults.innerHTML = '<div class="search-empty-state">Unable to search cities offline.</div>';
  }
}

// Favorites Management
function initFavorites() {
  const saved = localStorage.getItem('aura_weather_favs');
  if (saved) {
    try {
      state.favorites = JSON.parse(saved);
    } catch (e) {
      console.warn('Could not parse saved favorites');
    }
  }
  updateFavoritesUI();
}

function updateFavoritesUI() {
  const container = document.getElementById('favoritesList');
  container.innerHTML = '';

  const isCurrentPinned = state.favorites.some(
    f => f.name.toLowerCase() === state.currentLocation.name.toLowerCase()
  );
  const pinBtn = document.getElementById('pinCurrentBtn');
  pinBtn.classList.toggle('pinned', isCurrentPinned);
  pinBtn.title = isCurrentPinned ? 'Remove from pinned' : 'Pin to favorites';

  state.favorites.forEach(city => {
    const chip = document.createElement('button');
    const isActive = city.name.toLowerCase() === state.currentLocation.name.toLowerCase();
    chip.className = `favorite-chip ${isActive ? 'active' : ''}`;
    chip.textContent = city.name;
    chip.addEventListener('click', () => {
      fetchWeather(city.latitude, city.longitude, city.name, city.region);
    });
    container.appendChild(chip);
  });
}

document.getElementById('pinCurrentBtn').addEventListener('click', () => {
  const cur = state.currentLocation;
  const index = state.favorites.findIndex(f => f.name.toLowerCase() === cur.name.toLowerCase());
  if (index >= 0) {
    state.favorites.splice(index, 1);
  } else {
    state.favorites.push({
      name: cur.name,
      region: cur.region,
      latitude: cur.latitude,
      longitude: cur.longitude
    });
  }
  localStorage.setItem('aura_weather_favs', JSON.stringify(state.favorites));
  updateFavoritesUI();
});

// Unit Toggle (°C / °F)
const celsiusBtn = document.getElementById('celsiusBtn');
const fahrenheitBtn = document.getElementById('fahrenheitBtn');

celsiusBtn.addEventListener('click', () => {
  if (state.currentUnit === 'C') return;
  state.currentUnit = 'C';
  celsiusBtn.classList.add('active');
  fahrenheitBtn.classList.remove('active');
  celsiusBtn.setAttribute('aria-pressed', 'true');
  fahrenheitBtn.setAttribute('aria-pressed', 'false');
  renderWeather();
});

fahrenheitBtn.addEventListener('click', () => {
  if (state.currentUnit === 'F') return;
  state.currentUnit = 'F';
  fahrenheitBtn.classList.add('active');
  celsiusBtn.classList.remove('active');
  fahrenheitBtn.setAttribute('aria-pressed', 'true');
  celsiusBtn.setAttribute('aria-pressed', 'false');
  renderWeather();
});

// Geolocation ("My Location")
document.getElementById('locateBtn').addEventListener('click', () => {
  if (!navigator.geolocation) {
    showToast('Geolocation is not supported by your browser.');
    return;
  }
  showLoadingState();
  navigator.geolocation.getCurrentPosition(
    pos => {
      fetchWeather(pos.coords.latitude, pos.coords.longitude, 'Local Position', 'GPS');
    },
    err => {
      showToast('Could not access GPS location. Searching default city.');
      fetchWeather(state.currentLocation.latitude, state.currentLocation.longitude, state.currentLocation.name, state.currentLocation.region);
    },
    { timeout: 8000 }
  );
});

// Refresh Button
document.getElementById('refreshBtn').addEventListener('click', () => {
  fetchWeather(state.currentLocation.latitude, state.currentLocation.longitude, state.currentLocation.name, state.currentLocation.region);
});

// Toast notification banner
function showToast(msg) {
  const banner = document.getElementById('toastBanner');
  document.getElementById('toastMsg').textContent = msg;
  banner.hidden = false;
}

function hideToast() {
  document.getElementById('toastBanner').hidden = true;
}

document.getElementById('toastDismiss').addEventListener('click', hideToast);

// ==========================================
// Dynamic HTML5 Atmospheric Canvas Animation
// ==========================================
const canvas = document.getElementById('weatherCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function setupAtmosphericCanvas(category, isDay) {
  if (state.canvasAnimId) cancelAnimationFrame(state.canvasAnimId);
  state.canvasParticles = [];

  const count = category === 'rain' ? 120 : category === 'snow' ? 80 : category === 'clear' && !isDay ? 70 : 30;

  for (let i = 0; i < count; i++) {
    state.canvasParticles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 2 + 1,
      speedY: category === 'rain' ? Math.random() * 8 + 8 : category === 'snow' ? Math.random() * 1.5 + 0.5 : Math.random() * 0.2,
      speedX: category === 'rain' ? -1 : category === 'snow' ? Math.sin(i) * 0.5 : 0,
      opacity: Math.random() * 0.8 + 0.2,
      twinkleSpeed: Math.random() * 0.02 + 0.01
    });
  }

  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    state.canvasParticles.forEach(p => {
      if (category === 'rain') {
        ctx.strokeStyle = `rgba(186, 230, 253, ${p.opacity * 0.6})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - 3, p.y + 12);
        ctx.stroke();

        p.y += p.speedY;
        p.x += p.speedX;
        if (p.y > canvas.height) {
          p.y = -10;
          p.x = Math.random() * canvas.width;
        }
      } else if (category === 'snow') {
        ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity * 0.8})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();

        p.y += p.speedY;
        p.x += Math.sin(p.y * 0.02) * 0.8;
        if (p.y > canvas.height) {
          p.y = -5;
          p.x = Math.random() * canvas.width;
        }
      } else if (!isDay) {
        // Twinkling night stars
        p.opacity += Math.sin(Date.now() * p.twinkleSpeed) * 0.02;
        const boundedOpacity = Math.max(0.1, Math.min(0.9, p.opacity));
        ctx.fillStyle = `rgba(254, 240, 138, ${boundedOpacity})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 0.8, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    state.canvasAnimId = requestAnimationFrame(loop);
  }

  loop();
}

// Initial Boot
initFavorites();
fetchWeather(state.currentLocation.latitude, state.currentLocation.longitude, state.currentLocation.name, state.currentLocation.region);

// ==========================================
// Neon Database Integration (/api/weather)
// ==========================================
async function recordWeatherToNeon(loc, current, weatherInfo) {
  try {
    const payload = {
      cityName: loc.name,
      region: loc.region || '',
      latitude: loc.latitude,
      longitude: loc.longitude,
      temperature: current.temperature_2m,
      apparentTemperature: current.apparent_temperature,
      weatherCode: current.weather_code,
      weatherDescription: weatherInfo.description,
      humidity: current.relative_humidity_2m,
      windSpeed: current.wind_speed_10m,
      windDirection: current.wind_direction_10m,
      pressure: current.surface_pressure
    };

    const res = await fetch('/api/weather', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      const data = await res.json();
      console.log('Recorded weather to Neon DB:', data);
    }
  } catch (err) {
    // Graceful fallback: when running locally without Vercel CLI serverless runner
    console.debug('Neon DB record skipped (backend not active locally):', err.message);
  }
}
