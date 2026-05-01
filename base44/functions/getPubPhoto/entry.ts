Deno.serve(async (req) => {
  try {
    const url = new URL(req.url);
    
    // Try to get params from query string first, then body
    let pubName = url.searchParams.get("pubName");
    let pubAddress = url.searchParams.get("pubAddress");

    if (!pubName && req.method === "POST") {
      const contentType = req.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const body = await req.json();
        pubName = body.pubName;
        pubAddress = body.pubAddress;
      }
    }

    if (!pubName) {
      return Response.json({ photo_url: null, reason: "no pubName" });
    }

    const apiKey = Deno.env.get("GOOGLE_MAPS_API_KEY");
    if (!apiKey) {
      return Response.json({ photo_url: null, reason: "no api key" });
    }

    const textQuery = `${pubName} ${pubAddress || ""}`.trim();

    const searchRes = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "places.id,places.photos"
      },
      body: JSON.stringify({ textQuery })
    });

    const searchData = await searchRes.json();

    const photoName = searchData.places?.[0]?.photos?.[0]?.name;

    if (!photoName) {
      return Response.json({ photo_url: null, reason: "no photo found", apiStatus: searchData.error?.message });
    }

    const photoUrl = `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=800&key=${apiKey}`;

    return Response.json({ photo_url: photoUrl });
  } catch (error) {
    return Response.json({ error: error.message, photo_url: null }, { status: 500 });
  }
});