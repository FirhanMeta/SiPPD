export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { username, password, role, display, school, createdAt } = req.body;
  if (!username || !password || !role) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );
    const { data: existing } = await supabase
      .from('sars_users')
      .select('username')
      .eq('username', username)
      .single();

    if (existing) {
      return res.status(409).json({ error: 'Username already exists' });
    }
    const { error } = await supabase
      .from('sars_users')
      .insert([{
        username,
        password,
        role,
        display: display || username,
        school: role === 'teacher' ? school : null,
        created_at: createdAt || new Date().toISOString()
      }]);

    if (error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(201).json({ success: true });

  } catch (err) {
    console.error('Users API error:', err);
    return res.status(500).json({ error: 'Server error. Try again.' });
  }
}