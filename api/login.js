export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );

    const { data, error } = await supabase
      .from('sars_users')
      .select('*')
      .eq('username', username)
      .single();

    if (error || !data) {
      return res.status(401).json({ error: 'Incorrect username or password.' });
    }

    // Compare plain text passwords (NOT SECURE - temporary only!)
    if (data.password !== password) {
      return res.status(401).json({ error: 'Incorrect username or password.' });
    }

    // Login successful - return user without password
    const { password: _, ...userWithoutPassword } = data;
    return res.status(200).json({ 
      success: true,
      user: userWithoutPassword 
    });

  } catch (err) {
    console.error('Login API error:', err);
    return res.status(500).json({ error: 'Server error. Try again.' });
  }
}