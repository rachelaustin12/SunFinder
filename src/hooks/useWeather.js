import { useState, useEffect } from "react";

// Fetches current weather for a set of pubs using Open-Meteo (free, no API key)
export function useWeather(pubs) {
  const [weatherMap, setWeatherMap] = useState({});
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);

  useEffect(() => {
    if (!pubs || pubs.length === 0) {
      setWeatherMap({});
      return;
    }

    const pubsWithCoords = pubs.filter(p => p.lat && p.lng);
    if (pubsWithCoords.length === 0) return;

    setIsLoadingWeather(true);

    // Deduplicate by rounding coords to 2dp (nearby pubs share weather)
    const uniqueCoords = {};
    pubsWithCoords.forEach(pub => {
      const key = `${pub.lat.toFixed(2)},${pub.lng.toFixed(2)}`;
      if (!uniqueCoords[key]) uniqueCoords[key] = { lat: pub.lat, lng: pub.lng, key };
    });

    const fetches = Object.values(uniqueCoords).map(({ lat, lng, key }) =>
      fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,precipitation_probability,weather_code&timezone=auto&forecast_days=1`
      )
        .then(r => r.json())
        .then(data => ({
          key,
          temp: Math.round(data.current?.temperature_2m ?? null),
          precipitation_probability: data.current?.precipitation_probability ?? null,
          weather_code: data.current?.weather_code ?? null,
        }))
        .catch(() => ({ key, temp: null, precipitation_probability: null }))
    );

    Promise.all(fetches).then(results => {
      const map = {};
      results.forEach(r => { map[r.key] = r; });

      // Map back to pub name keys
      const pubWeather = {};
      pubsWithCoords.forEach(pub => {
        const key = `${pub.lat.toFixed(2)},${pub.lng.toFixed(2)}`;
        pubWeather[`${pub.name}||${pub.address}`] = map[key] || null;
      });

      setWeatherMap(pubWeather);
      setIsLoadingWeather(false);
    });
  }, [pubs]);

  const getWeather = (pub) => weatherMap[`${pub.name}||${pub.address}`] || null;

  return { getWeather, isLoadingWeather };
}