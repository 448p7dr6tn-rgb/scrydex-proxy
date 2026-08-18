// Vercel serverless function.
// Deployed, this becomes: https://<your-project>.vercel.app/api/scrydex
//
// The overlay calls THIS instead of api.scrydex.com directly. This function
// runs on Vercel's server, not in a browser, so CORS doesn't apply here —
// and your Scrydex key never has to sit in the browser or the HTML file.

export default async function handler(req, res) {
  // Allow the overlay (running anywhere — OBS, a local file, etc.) to call this.
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  const { path, ...rest } = req.query;
  if (!path) {
    res.status(400).json({ error: 'Missing "path" query param, e.g. ?path=cards&q=name:charizard' });
    return;
  }

  const qs = new URLSearchParams(rest).toString();
  const url = `https://api.scrydex.com/pokemon/v1/${path}${qs ? '?' + qs : ''}`;

  try {
    const scrydexRes = await fetch(url, {
      headers: {
        'X-Api-Key': process.env.SCRYDEX_API_KEY,
        'X-Team-Id': process.env.SCRYDEX_TEAM_ID,
      },
    });
    const data = await scrydexRes.json();
    res.status(scrydexRes.status).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
