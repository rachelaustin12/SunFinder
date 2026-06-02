import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { lat, lng, text, hour, dateStr } = await req.json();

    const locationStr = text || (lat && lng ? `${lat}, ${lng}` : null);
    if (!locationStr) {
      return Response.json({ error: "No location provided" }, { status: 400 });
    }

    const timeStr = `${String(hour).padStart(2, "0")}:00`;

    const aiResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are a local pub expert and sun specialist for the UK. The date is ${dateStr} and the time is ${timeStr}.

Find 8-10 real pubs with outdoor beer gardens or terraces near: "${locationStr}"

For each pub provide:
- name: the real pub name
- address: real street address
- rating: estimated Google-style rating (3.5–5.0)
- lat: latitude (accurate)
- lng: longitude (accurate)
- google_maps_url: https://www.google.com/maps/search/?api=1&query=<pub+name+and+address+url+encoded>
- sun_status: "full_sun", "partial_sun", or "shade" at ${timeStr} on ${dateStr}
- sun_hours: estimated sun window e.g. "Until ~6:30pm" or "2pm–5pm"
- description: 1-2 sentences about the pub garden and its sun exposure
- dog_friendly: boolean
- wheelchair_accessible: boolean
- dietary_options: array from ["vegan", "vegetarian", "gluten-free", "halal"]
- image_url: null

Also provide:
- location_name: friendly short area name (e.g. "Shoreditch, London")
- weather_summary: brief weather/sun conditions for this area on ${dateStr}

Only include pubs that genuinely have outdoor seating. Return real, well-known pubs where possible.`,
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
                address: { type: "string" },
                rating: { type: "number" },
                lat: { type: "number" },
                lng: { type: "number" },
                google_maps_url: { type: "string" },
                sun_status: { type: "string", enum: ["full_sun", "partial_sun", "shade"] },
                sun_hours: { type: "string" },
                description: { type: "string" },
                dog_friendly: { type: "boolean" },
                wheelchair_accessible: { type: "boolean" },
                dietary_options: { type: "array", items: { type: "string" } },
                image_url: { type: "string" }
              }
            }
          }
        }
      },
      model: "gemini_3_flash"
    });

    return Response.json({
      pubs: aiResult.pubs || [],
      location_name: aiResult.location_name || locationStr,
      weather_summary: aiResult.weather_summary || "",
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});