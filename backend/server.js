const express = require("express");
const app = express();
const PORT = 3000;

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});

// --------------------
// REVERSE GEOCODE
// --------------------
async function reverseGeocode(lat, lon) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
    const res = await fetch(url, { headers: { "User-Agent": "weather-dashboard-v3" } });
    const data = await res.json();
    const city  = data.address?.city || data.address?.town || data.address?.village || data.address?.county;
    const state = data.address?.state;
    return [city, state].filter(Boolean).join(", ") || "Unknown";
  } catch { return "Unknown"; }
}

// --------------------
// WMO CODE → INTERNAL CODE
// --------------------
function wmoToCode(wmo) {
  const map = {
    0:1000, 1:1100, 2:1101, 3:1001,
    45:2000, 48:2000,
    51:4000, 53:4000, 55:4001,
    61:4200, 63:4200, 65:4201,
    71:5100, 73:5100, 75:5101, 77:5001,
    80:4200, 81:4200, 82:4201,
    85:5000, 86:5000,
    95:8000, 96:8000, 99:8000
  };
  return map[wmo] ?? 1000;
}

// --------------------
// CURRENT WEATHER
// --------------------
app.get("/weather", async (req, res) => {
  const lat = req.query.lat || "33.829";
  const lon = req.query.lon || "-90.0012";
  console.log(`[weather] lat=${lat} lon=${lon}`);
  try {
    const fields = [
      "temperature_2m",
      "apparent_temperature",
      "dewpoint_2m",
      "relative_humidity_2m",
      "wind_speed_10m",
      "wind_direction_10m",
      "surface_pressure",
      "visibility",
      "weather_code",
      "uv_index"
    ].join(",");

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      `&current=${fields}&temperature_unit=celsius&wind_speed_unit=ms&timezone=auto`;

    const response = await fetch(url);
    const raw = await response.json();

    // Log exactly what Open-Meteo returned so we can see null fields
    console.log("[weather] raw current:", JSON.stringify(raw?.current));

    if (!raw?.current) {
      return res.status(502).json({ error: "Bad response from Open-Meteo", detail: raw });
    }

    const c = raw.current;

    // Guard every field individually so one null doesn't break the whole response
    const location = await reverseGeocode(lat, lon);
    console.log(`[weather] OK — ${location}, temp=${c.temperature_2m}, feelsLike=${c.apparent_temperature}`);

    res.json({
      location,
      lat,
      lon,
      temperature:   c.temperature_2m       ?? null,
      feelsLike:     c.apparent_temperature  ?? null,
      dewPoint:      c.dewpoint_2m           ?? null,
      humidity:      c.relative_humidity_2m  ?? null,
      windSpeed:     c.wind_speed_10m        ?? null,
      windDirection: c.wind_direction_10m    ?? null,
      pressure:      c.surface_pressure      ?? null,
      visibility:    c.visibility            ?? null,
      uvIndex:       c.uv_index             ?? null,
      weatherCode:   wmoToCode(c.weather_code ?? 0)
    });
  } catch (err) {
    console.error("[weather] Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// --------------------
// 7-DAY FORECAST
// --------------------
app.get("/forecast", async (req, res) => {
  const lat = req.query.lat || "33.829";
  const lon = req.query.lon || "-90.0012";
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      `&daily=temperature_2m_max,temperature_2m_min,weathercode,precipitation_probability_max,sunrise,sunset` +
      `&temperature_unit=celsius&timezone=auto&forecast_days=7`;

    const response = await fetch(url);
    const raw = await response.json();
    if (!raw?.daily?.time) return res.status(502).json({ error: "Bad response", detail: raw });

    const d = raw.daily;
    res.json(d.time.map((time, i) => ({
      time,
      max:        d.temperature_2m_max[i],
      min:        d.temperature_2m_min[i],
      weatherCode: wmoToCode(d.weathercode[i]),
      precipProb: d.precipitation_probability_max[i],
      sunrise:    d.sunrise[i],
      sunset:     d.sunset[i]
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --------------------
// HOURLY FORECAST (next 24h)
// --------------------
app.get("/hourly", async (req, res) => {
  const lat = req.query.lat || "33.829";
  const lon = req.query.lon || "-90.0012";
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      `&hourly=temperature_2m,precipitation_probability,weather_code,wind_speed_10m` +
      `&temperature_unit=celsius&wind_speed_unit=ms&timezone=auto&forecast_days=2`;

    const response = await fetch(url);
    const raw = await response.json();
    if (!raw?.hourly?.time) return res.status(502).json({ error: "Bad response", detail: raw });

    const h = raw.hourly;
    const timezone = raw.timezone; // e.g. "America/Chicago"
    const utcOffsetSeconds = raw.utc_offset_seconds; // e.g. -18000

    const now = new Date();

    // Find current hour index using UTC offset to compare correctly
    const nowUtc = now.getTime();
    let startIndex = 0;
    for (let i = 0; i < h.time.length; i++) {
      // Open-Meteo times are local — convert to UTC for comparison
      const localMs = new Date(h.time[i]).getTime() - (utcOffsetSeconds * 1000) + (now.getTimezoneOffset() * 60 * 1000);
      if (localMs <= nowUtc) startIndex = i;
      else break;
    }

    const hours = h.time.slice(startIndex, startIndex + 24).map((time, i) => ({
      time,
      temperature: h.temperature_2m[startIndex + i],
      precipProb:  h.precipitation_probability[startIndex + i],
      weatherCode: wmoToCode(h.weather_code[startIndex + i]),
      windSpeed:   h.wind_speed_10m[startIndex + i]
    }));

    // FIX: send timezone along so the frontend can format times correctly
    res.json({ timezone, hours });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --------------------
// WEATHER ALERTS (NWS - US only, fails silently)
// --------------------
app.get("/alerts", async (req, res) => {
  const lat = req.query.lat || "33.829";
  const lon = req.query.lon || "-90.0012";
  try {
    const response = await fetch(
      `https://api.weather.gov/alerts/active?point=${lat},${lon}`,
      { headers: { "User-Agent": "weather-dashboard (weather@local.dev)" }, signal: AbortSignal.timeout(5000) }
    );
    if (!response.ok) return res.json({ alerts: [] });
    const raw = await response.json();
    res.json({
      alerts: (raw.features || []).map(f => ({
        event:    f.properties.event,
        headline: f.properties.headline,
        severity: f.properties.severity,
        urgency:  f.properties.urgency,
        expires:  f.properties.expires
      }))
    });
  } catch { res.json({ alerts: [] }); }
});

// --------------------
// START
// --------------------
app.listen(PORT, () => console.log(`Backend running on port ${PORT} — Open-Meteo, no API key needed`));
