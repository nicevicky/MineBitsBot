// api/send-message.js
export default async function handler(req, res) {
    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { botToken, userId, userName, message } = req.body;

        if (!botToken || !userId || !message) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Get admin users from your database or use a fixed admin ID
        // For this example, we'll send to a fixed admin (you can modify this)
        const ADMIN_TELEGRAM_ID = process.env.ADMIN_TELEGRAM_ID || 'YOUR_ADMIN_ID';

        const telegramMessage = `
🆘 <b>New Support Message</b>

👤 <b>User:</b> ${userName} (ID: ${userId})
💬 <b>Message:</b>
${message}

⏰ <b>Time:</b> ${new Date().toLocaleString()}

<i>Reply via the Support Chat admin panel</i>
        `.trim();

        // Send message to admin via Telegram Bot API
        const response = await fetch(
            `https://api.telegram.org/bot${botToken}/sendMessage`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chat_id: ADMIN_TELEGRAM_ID,
                    text: telegramMessage,
                    parse_mode: 'HTML'
                }),
            }
        );

        const data = await response.json();

        if (!data.ok) {
            console.error('Telegram API error:', data);
            return res.status(500).json({ 
                error: 'Failed to send notification',
                details: data.description 
            });
        }

        return res.status(200).json({ 
            success: true, 
            message: 'Notification sent successfully' 
        });

    } catch (error) {
        console.error('Error in send-message:', error);
        return res.status(500).json({ 
            error: 'Internal server error',
            details: error.message 
        });
    }
}
