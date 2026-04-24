/**
 * Fetches current weather for given lat/lng using Open-Meteo (free, no API key).
 * Returns { temperature, precipitation_probability }
 */
export async function fetchWeather(lat, lng) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,precipitation_probability&timezone=auto`;
  const res = await fetch(url);
  const data = await res.json();
  return {
    temperature: Math.round(data.current.temperature_2m),
    precipitation_probability: data.current.precipitation_probability ?? 0,
  };
}