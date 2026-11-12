require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

const connectionString = process.env.DATABASE_URL || process.env.DATABASE_URL_UNPOOLED;
if (!connectionString) {
  console.log('Build seed skipped: DATABASE_URL not set in build environment.');
  process.exit(0);
}

const sql = neon(connectionString);

const DEFAULT_CITIES = [
  { name: 'Belgrade', region: 'Serbia', lat: 44.8176, lon: 20.4633 },
  { name: 'Vienna', region: 'Austria', lat: 48.2082, lon: 16.3738 },
  { name: 'Zurich', region: 'Switzerland', lat: 47.3769, lon: 8.5417 },
  { name: 'Tokyo', region: 'Japan', lat: 35.6762, lon: 139.6503 },
  { name: 'New York', region: 'United States', lat: 40.7128, lon: -74.0060 }
];

async function seed() {
  console.log('Checking database table setup...');
  await sql`
    CREATE TABLE IF NOT EXISTS weather_records (
      id SERIAL PRIMARY KEY,
      city_name VARCHAR(120) NOT NULL,
      region VARCHAR(120),
      latitude DOUBLE PRECISION NOT NULL,
      longitude DOUBLE PRECISION NOT NULL,
      temperature DOUBLE PRECISION,
      apparent_temperature DOUBLE PRECISION,
      weather_code INT,
      weather_description VARCHAR(100),
      humidity INT,
      wind_speed DOUBLE PRECISION,
      wind_direction DOUBLE PRECISION,
      pressure DOUBLE PRECISION,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_weather_city ON weather_records(city_name);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_weather_created ON weather_records(created_at DESC);`;

  console.log('Seeding initial weather records for default cities...');
  for (const city of DEFAULT_CITIES) {
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m&timezone=auto`;
      const res = await fetch(url);
      if (!res.ok) continue;
      const data = await res.json();
      const cur = data.current;

      await sql`
        INSERT INTO weather_records (
          city_name, region, latitude, longitude,
          temperature, apparent_temperature, weather_code,
          weather_description, humidity, wind_speed,
          wind_direction, pressure
        ) VALUES (
          ${city.name}, ${city.region}, ${city.lat}, ${city.lon},
          ${cur.temperature_2m}, ${cur.apparent_temperature}, ${cur.weather_code},
          ${'Live conditions'}, ${cur.relative_humidity_2m}, ${cur.wind_speed_10m},
          ${cur.wind_direction_10m}, ${cur.surface_pressure}
        );
      `;
      console.log(`Seeded: ${city.name}`);
    } catch (err) {
      console.warn(`Could not seed ${city.name}:`, err.message);
    }
  }

  const countResult = await sql`SELECT count(*)::int as total FROM weather_records;`;
  console.log(`Database populated! Total records in DB: ${countResult[0].total}`);
}

seed().catch(err => {
  console.warn('Seed step completed with warning:', err.message);
});
