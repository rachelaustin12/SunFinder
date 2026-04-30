import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { stops } = await req.json();

    if (!stops || stops.length < 2) {
      return Response.json({ error: 'Need at least 2 stops' }, { status: 400 });
    }

    const apiKey = Deno.env.get("GOOGLE_MAPS_API_KEY");

    const toWaypoint = (s) => s.lat && s.lng ? `${s.lat},${s.lng}` : encodeURIComponent(s.address || s.name);

    const origin = toWaypoint(stops[0]);
    const destination = toWaypoint(stops[stops.length - 1]);
    const waypoints = stops.slice(1, -1).map(toWaypoint).join("|");

    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}${waypoints ? `&waypoints=${waypoints}` : ""}&mode=walking&key=${apiKey}`;

    const res = await fetch(url);
    const data = await res.json();

    if (data.status !== "OK") {
      return Response.json({ error: data.status }, { status: 400 });
    }

    // Sum up the duration of all legs
    const totalSeconds = data.routes[0].legs.reduce((acc, leg) => acc + leg.duration.value, 0);
    const totalMinutes = Math.round(totalSeconds / 60);

    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    const durationText = hours > 0 ? `${hours}h ${mins}m` : `${mins} min`;

    return Response.json({ durationText, totalMinutes });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});