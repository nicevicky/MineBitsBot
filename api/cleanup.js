// api/cleanup.js
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    // Only allow POST or GET (for cron job)
    if (req.method !== 'POST' && req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Verify cron job secret (optional but recommended)
        const cronSecret = req.headers['x-cron-secret'] || req.query.secret;
        
        if (cronSecret !== process.env.CRON_SECRET) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Initialize Supabase with service role key (bypasses RLS)
        const supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role key, not anon key
        );

        // Delete expired messages
        const { data, error, count } = await supabase
            .from('support_messages')
            .delete({ count: 'exact' })
            .lt('expires_at', new Date().toISOString());

        if (error) {
            console.error('Error deleting messages:', error);
            return res.status(500).json({ 
                error: 'Failed to delete messages',
                details: error.message 
            });
        }

        console.log(`Cleanup completed: ${count || 0} messages deleted`);

        return res.status(200).json({ 
            success: true,
            deleted: count || 0,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error in cleanup:', error);
        return res.status(500).json({ 
            error: 'Internal server error',
            details: error.message 
        });
    }
}
