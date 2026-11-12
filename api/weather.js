import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const connectionString = process.env.DATABASE_URL || process.env.DATABASE_URL_UNPOOLED;
  if (!connectionString) {
    return res.status(500).json({ error: 'DATABASE_URL environment variable is not configured' });
  }

  const sql = neon(connectionString);

  // POST: Record weather data for a city search
  if (req.method === 'POST') {
    try {
      const {
        cityName,
        region = '',
        latitude,
        longitude,
        temperature,
        apparentTemperature,
        weatherCode,
        weatherDescription = '',
        humidity,
        windSpeed,
        windDirection,
        pressure
      } = req.body || {};

      if (!cityName || latitude === undefined || longitude === undefined) {
        return res.status(400).json({ error: 'cityName, latitude and longitude are required' });
      }

      const rows = await sql`
        INSERT INTO weather_records (
          city_name, region, latitude, longitude,
          temperature, apparent_temperature, weather_code,
          weather_description, humidity, wind_speed,
          wind_direction, pressure
        ) VALUES (
          ${cityName}, ${region}, ${Number(latitude)}, ${Number(longitude)},
          ${temperature !== undefined ? Number(temperature) : null},
          ${apparentTemperature !== undefined ? Number(apparentTemperature) : null},
          ${weatherCode !== undefined ? Number(weatherCode) : null},
          ${weatherDescription},
          ${humidity !== undefined ? Number(humidity) : null},
          ${windSpeed !== undefined ? Number(windSpeed) : null},
          ${windDirection !== undefined ? Number(windDirection) : null},
          ${pressure !== undefined ? Number(pressure) : null}
        )
        RETURNING id, city_name, created_at;
      `;

      return res.status(201).json({ success: true, record: rows[0] });
    } catch (error) {
      console.error('Error saving weather to Neon:', error);
      return res.status(500).json({ error: 'Failed to record weather data', details: error.message });
    }
  }

  // GET: Fetch recent weather queries & search history
  if (req.method === 'GET') {
    try {
      const limit = Math.min(Number(req.query.limit) || 10, 50);
      const rows = await sql`
        SELECT id, city_name, region, latitude, longitude,
               temperature, weather_code, weather_description,
               humidity, wind_speed, created_at
        FROM weather_records
        ORDER BY created_at DESC
        LIMIT ${limit};
      `;

      return res.status(200).json({ success: true, count: rows.length, records: rows });
    } catch (error) {
      console.error('Error querying Neon:', error);
      return res.status(500).json({ error: 'Failed to fetch weather records', details: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
