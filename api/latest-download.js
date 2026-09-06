export default async function handler(req, res) {
  try {
    const base = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    if (!base || !key) return res.status(500).send('Download service is not configured.');

    const q = new URLSearchParams({
      select: 'version,release_date,file_path,original_filename',
      published: 'eq.true',
      order: 'created_at.desc',
      limit: '1'
    });
    const r = await fetch(`${base}/rest/v1/bot_releases?${q.toString()}`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` }
    });
    if (!r.ok) return res.status(502).send('Could not read the latest bot release.');
    const rows = await r.json();
    if (!rows.length) return res.status(404).send('No published Lumora bot release found.');

    const release = rows[0];
    const path = String(release.file_path || '').replace(/^\/+/, '');
    const sign = await fetch(`${base}/storage/v1/object/sign/bot-releases/${path}`, {
      method: 'POST',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ expiresIn: 300 })
    });
    if (!sign.ok) return res.status(502).send('Could not create a secure download link.');
    const data = await sign.json();
    const signedPath = data?.signedURL || data?.signedUrl;
    if (!signedPath) return res.status(502).send('Invalid signed download response.');

    const location = signedPath.startsWith('http') ? signedPath : `${base}/storage/v1${signedPath}`;
    res.setHeader('Cache-Control', 'no-store');
    return res.redirect(302, location);
  } catch (e) {
    console.error(e);
    return res.status(500).send('Download service error.');
  }
}
