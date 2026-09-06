export default async function handler(req, res) {
  try {
    const base = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    if (!base || !key) return res.status(500).json({ error: 'Download service is not configured.' });
    const q = new URLSearchParams({
      select: 'version,release_date,release_notes,original_filename',
      published: 'eq.true',
      order: 'created_at.desc',
      limit: '1'
    });
    const r = await fetch(`${base}/rest/v1/bot_releases?${q.toString()}`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` }
    });
    if (!r.ok) return res.status(502).json({ error: 'Could not read latest release.' });
    const rows = await r.json();
    if (!rows.length) return res.status(404).json({ error: 'No published release.' });
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json(rows[0]);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Release service error.' });
  }
}
