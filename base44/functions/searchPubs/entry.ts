import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const PLACES_API_KEY = Deno.env.get("GOOGLE_PLACES_API_KEY");
const PHOTO_BASE = "https://maps.googleapis.com/maps/api/place/photo";

async function geocodeText(text) {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(text)}&key=${PLACES_API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.results?.length > 0) {
    const loc = data.results[0].geometry.location;
    return { lat: loc.lat, lng: loc.lng };
  }
  return null;
}

async function searchNearbyPubs(lat, lng) {
  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=1500&type=bar&keyword=pub+garden+beer+garden&key=${PLACES_API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.results || [];
}

function getPhotoUrl(photoReference, maxWidth = 600) {
  if (!photoReference) return null;
  return `${PHOTO_BASE}?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${PLACES_API_KEY}`;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const { lat, lng, text, hour, dateStr } = await req.json();

    // Resolve coordinates
    let resolvedLat = lat;
    let resolvedLng = lng;
    if (text && (!lat || !lng)) {
      const coords = await geocodeText(text);
      if (coords) {
        resolvedLat = coords.lat;
        resolvedLng = coords.lng;
      }
    }

    if (!resolvedLat || !resolvedLng) {
      return Response.json({ error: "Could not resolve location" }, { status: 400 });
    }

    // Get pubs from Google Places
    const places = await searchNearbyPubs(resolvedLat, resolvedLng);

    if (places.length === 0) {
      return Response.json({ pubs: [], location_name: text || `${resolvedLat}, ${resolvedLng}`, weather_summary: "" });
    }

    // Build a simplified list for the AI to enrich with sun data
    const pubList = places.slice(0, 12).map(p => ({
      name: p.name,
      address: p.vicinity,
      rating: p.rating || null,
      lat: p.geometry.location.lat,
      lng: p.geometry.location.lng,
      place_id: p.place_id,
      image_url: p.photos?.[0]?.photo_reference
        ? getPhotoUrl(p.photos[0].photo_reference)
        : null,
      google_maps_url: `https://www.google.com/maps/place/?q=place_id:${p.place_id}`,
    }));

    // Ask AI to enrich with sun status
    const timeStr = `${String(hour).padStart(2, "0")}:00`;
    const locationStr = text || `latitude ${resolvedLat}, longitude ${resolvedLng}`;

    const aiResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are a local sun expert. The date is ${dateStr} and the time is ${timeStr}.

Here is a list of real pubs near ${locationStr}:
${JSON.stringify(pubList.map(p => ({ name: p.name, address: p.address, lat: p.lat, lng: p.lng })), null, 2)}

For each pub above, determine:
- sun_status: "full_sun", "partial_sun", or "shade" based on the garden orientation, time of day, and season
- sun_hours: estimated sun window e.g. "Until ~6:30pm" or "2pm–5pm"
- description: 1-2 sentences about why this pub garden is good for sunshine
- dog_friendly: boolean guess
- wheelchair_accessible: boolean guess
- dietary_options: array from ["vegan", "vegetarian", "gluten-free", "halal"]

Also provide:
- location_name: friendly area name
- weather_summary: brief current weather/sun conditions for the area

Return ONLY the enriched pub data in the JSON schema. Keep the same order as the input list.`,
      response_json_schema: {
        type: "object",
        properties: {
          location_name: { type: "string" },
          weather_summary: { type: "string" },
          pubs: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                sun_status: { type: "string", enum: ["full_sun", "partial_sun", "shade"] },
                sun_hours: { type: "string" },
                description: { type: "string" },
                dog_friendly: { type: "boolean" },
                wheelchair_accessible: { type: "boolean" },
                dietary_options: { type: "array", items: { type: "string" } }
              }
            }
          }
        }
      },
      model: "gemini_3_flash"
    });

    // Merge AI enrichment with Places data
    const enriched = (aiResult.pubs || []).map((aiPub, i) => {
      const place = pubList[i] || {};
      return {
        ...place,
        name: place.name || aiPub.name,
        sun_status: aiPub.sun_status || "partial_sun",
        sun_hours: aiPub.sun_hours || "",
        description: aiPub.description || "",
        dog_friendly: aiPub.dog_friendly ?? false,
        wheelchair_accessible: aiPub.wheelchair_accessible ?? false,
        dietary_options: aiPub.dietary_options || [],
      };
    });

    return Response.json({
      pubs: enriched,
      location_name: aiResult.location_name || locationStr,
      weather_summary: aiResult.weather_summary || "",
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});