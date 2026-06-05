import { useState, useEffect } from "react";

const STORAGE_KEY = "sunny_spots_favourites";

export function useFavourites() {
  const [favourites, setFavourites] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favourites));
  }, [favourites]);

  const isFavourite = (pub) =>
    favourites.some((f) => f.name === pub.name && f.address === pub.address);

  const toggleFavourite = (pub) => {
    setFavourites((prev) =>
      isFavourite(pub)
        ? prev.filter((f) => !(f.name === pub.name && f.address === pub.address))
        : [...prev, pub]
    );
  };

  const removeFavourite = (pub) => {
    setFavourites((prev) =>
      prev.filter((f) => !(f.name === pub.name && f.address === pub.address))
    );
  };

  const updateFavourite = (pub, updates) => {
    setFavourites((prev) =>
      prev.map((f) =>
        f.name === pub.name && f.address === pub.address ? { ...f, ...updates } : f
      )
    );
  };

  const clearAllFavourites = () => setFavourites([]);

  return { favourites, isFavourite, toggleFavourite, removeFavourite, updateFavourite, clearAllFavourites };
}