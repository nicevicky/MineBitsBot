// api/cleanup.js
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST' && req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const cronSecret = req.headers['x-cron-secret'] || req.query.secret;
    if (cronSecret !== process.env.CRON_SECRET) {
      return res.status(401).json({ error: 'Unauthorized - invalid secret' });
    }

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('❌ Missing Supabase environment variables');
      return res.status(500).json({ error: 'Missing Supabase configuration' });
    }

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data, error, count } = await supabase
      .from('support_messages')
      .delete({ count: 'exact' })
      .lt('expires_at', new Date().toISOString());

    if (error) {
      console.error('❌ Supabase deletion error:', error);
      return res.status(500).json({ error: 'Failed to delete messages', details: error.message });
    }

    console.log(`✅ Cleanup completed: ${count || 0} messages deleted`);

    return res.status(200).json({
      success: true,
      deleted: count || 0,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('🔥 Cleanup failed:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
