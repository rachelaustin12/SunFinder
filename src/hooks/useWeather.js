import { useState, useEffect } from "react";

// Fetches weather for a set of pubs using Open-Meteo (free, no API key).
// If targetDate is provided (YYYY-MM-DD string) and is not today, fetches the hourly forecast for that date.
export function useWeather(pubs, targetDate = null) {
  const [weatherMap, setWeatherMap] = useState({});
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);
  const [dayForecast, setDayForecast] = useState(null); // { low, high, precipitation_probability, weather_code }

  useEffect(() => {
    if (!pubs || pubs.length === 0) {
      setWeatherMap({});
      setDayForecast(null);
      return;
    }

    const pubsWithCoords = pubs.filter(p => p.lat && p.lng);
    if (pubsWithCoords.length === 0) return;

    setIsLoadingWeather(true);

    // Use first pub coords as representative location for day forecast
    const refPub = pubsWithCoords[0];
    const todayStr = new Date().toISOString().split("T")[0];
    const dateStr = targetDate || todayStr;
    const isFuture = dateStr !== todayStr;

    // Build URL — for future dates use hourly; for today use current
    const forecastUrl = isFuture
      ? `https://api.open-meteo.com/v1/forecast?latitude=${refPub.lat}&longitude=${refPub.lng}&hourly=temperature_2m,precipitation_probability,weather_code,uv_index&timezone=auto&start_date=${dateStr}&end_date=${dateStr}`
      : `https://api.open-meteo.com/v1/forecast?latitude=${refPub.lat}&longitude=${refPub.lng}&current=temperature_2m,precipitation_probability,weather_code,uv_index&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto&forecast_days=1`;

    // Deduplicate by rounding coords to 2dp (nearby pubs share weather)
    const uniqueCoords = {};
    pubsWithCoords.forEach(pub => {
      const key = `${pub.lat.toFixed(2)},${pub.lng.toFixed(2)}`;
      if (!uniqueCoords[key]) uniqueCoords[key] = { lat: pub.lat, lng: pub.lng, key };
    });

    const pubFetches = Object.values(uniqueCoords).map(({ lat, lng, key }) =>
      fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,precipitation_probability,weather_code,uv_index&timezone=auto&forecast_days=1`
      )
        .then(r => r.json())
        .then(data => ({
          key,
          temp: Math.round(data.current?.temperature_2m ?? null),
          precipitation_probability: data.current?.precipitation_probability ?? null,
          weather_code: data.current?.weather_code ?? null,
          uv_index: data.current?.uv_index ?? null,
        }))
        .catch(() => ({ key, temp: null, precipitation_probability: null, uv_index: null }))
    );

    const dayFetch = fetch(forecastUrl)
      .then(r => r.json())
      .then(data => {
        if (isFuture && data.hourly) {
          const temps = data.hourly.temperature_2m || [];
          const precs = data.hourly.precipitation_probability || [];
          const codes = data.hourly.weather_code || [];
          return {
            low: Math.round(Math.min(...temps)),
            high: Math.round(Math.max(...temps)),
            precipitation_probability: Math.round(Math.max(...precs)),
            weather_code: codes[12] ?? codes[0] ?? null, // midday code
          };
        } else if (data.daily) {
          return {
            low: Math.round(data.daily.temperature_2m_min?.[0] ?? null),
            high: Math.round(data.daily.temperature_2m_max?.[0] ?? null),
            precipitation_probability: data.daily.precipitation_probability_max?.[0] ?? null,
            weather_code: data.current?.weather_code ?? null,
          };
        }
        return null;
      })
      .catch(() => null);

    Promise.all([Promise.all(pubFetches), dayFetch]).then(([pubResults, forecast]) => {
      const map = {};
      pubResults.forEach(r => { map[r.key] = r; });

      const pubWeather = {};
      pubsWithCoords.forEach(pub => {
        const key = `${pub.lat.toFixed(2)},${pub.lng.toFixed(2)}`;
        pubWeather[`${pub.name}||${pub.address}`] = map[key] || null;
      });

      setWeatherMap(pubWeather);
      setDayForecast(forecast);
      setIsLoadingWeather(false);
    });
  }, [pubs, targetDate]);

  const getWeather = (pub) => weatherMap[`${pub.name}||${pub.address}`] || null;

  return { getWeather, isLoadingWeather, dayForecast };
}