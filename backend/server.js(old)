const express = require("express");
const app = express();
const PORT = 3000;

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});

// --------------------
// Reverse geocode (unchanged)
// --------------------
async function reverseGeocode(lat, lon) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
    const res = await fetch(url, { headers: { "User-Agent": "weather-dashboard" } });
    const data = await res.json();
    const city  = data.address?.city || data.address?.town || data.address?.village || data.address?.county;
    const state = data.address?.state;
    return [city, state].filter(Boolean).join(", ") || "Unknown";
  } catch {
    return "Unknown";
  }
}

// --------------------
// Open-Meteo WMO weather code → tomorrow.io-style code
// (so the frontend icon/label maps still work unchanged)
// --------------------
function wmoToCode(wmo) {
  if (wmo === 0)               return 1000; // Clear
  if (wmo === 1)               return 1100; // Mostly Clear
  if (wmo === 2)               return 1101; // Partly Cloudy
  if (wmo === 3)               return 1001; // Cloudy/Overcast
  if ([45,48].includes(wmo))   return 2000; // Fog
  if ([51,53].includes(wmo))   return 4000; // Drizzle
  if (wmo === 55)              return 4001; // Heavy Drizzle → Rain
  if ([61,63].includes(wmo))   return 4200; // Light/Moderate Rain
  if (wmo === 65)              return 4201; // Heavy Rain
  if ([71,73].includes(wmo))   return 5100; // Light/Moderate Snow
  if (wmo === 75)              return 5101; // Heavy Snow
  if (wmo === 77)              return 5001; // Snow Grains → Flurries
  if ([80,81].includes(wmo))   return 4200; // Light Rain Showers
  if (wmo === 82)              return 4201; // Heavy Rain Showers
  if ([85,86].includes(wmo))   return 5000; // Snow Showers
  if ([95,96,99].includes(wmo))return 8000; // Thunderstorm
  return 1000;
}

// --------------------
// CURRENT WEATHER — Open-Meteo current conditions
// --------------------
app.get("/weather", async (req, res) => {
  const lat = req.query.lat || "33.829";
  const lon = req.query.lon || "-90.0012";
  console.log(`[weather] lat=${lat} lon=${lon}`);

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      `&current=temperature_2m,apparent_temperature,dewpoint_2m,relative_humidity_2m,wind_speed_10m` +
      `&temperature_unit=celsius&wind_speed_unit=ms&timezone=auto`;

    const response = await fetch(url);
    const raw = await response.json();

    if (!raw?.current) {
      console.warn("[weather] Bad response:", JSON.stringify(raw));
      return res.status(502).json({ error: "Bad response from Open-Meteo", detail: raw });
    }

    const c = raw.current;
    const location = await reverseGeocode(lat, lon);
    console.log(`[weather] OK — ${location}, temp=${c.temperature_2m}`);

    res.json({
      location,
      lat,
      lon,
      temperature:  c.temperature_2m,
      feelsLike:    c.apparent_temperature,
      dewPoint:     c.dewpoint_2m,
      humidity:     c.relative_humidity_2m,
      windSpeed:    c.wind_speed_10m
    });
  } catch (err) {
    console.error("[weather] Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// --------------------
// 7-DAY FORECAST — Open-Meteo daily forecast
// --------------------
app.get("/forecast", async (req, res) => {
  const lat = req.query.lat || "33.829";
  const lon = req.query.lon || "-90.0012";
  console.log(`[forecast] lat=${lat} lon=${lon}`);

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      `&daily=temperature_2m_max,temperature_2m_min,weathercode` +
      `&temperature_unit=celsius&timezone=auto&forecast_days=7`;

    const response = await fetch(url);
    const raw = await response.json();

    if (!raw?.daily?.time) {
      console.warn("[forecast] Bad response:", JSON.stringify(raw));
      return res.status(502).json({ error: "Bad response from Open-Meteo", detail: raw });
    }

    const d = raw.daily;
    const days = d.time.map((time, i) => ({
      time,
      max:         d.temperature_2m_max[i],
      min:         d.temperature_2m_min[i],
      weatherCode: wmoToCode(d.weathercode[i])  // convert to tomorrow.io codes so frontend works unchanged
    }));

    console.log(`[forecast] OK — ${days.length} days`);
    res.json(days);
  } catch (err) {
    console.error("[forecast] Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// --------------------
// START
// --------------------
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
  console.log(`Using Open-Meteo — no API key required, no rate limits`);
});
