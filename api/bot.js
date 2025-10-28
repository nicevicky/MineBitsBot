import axios from "axios";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(200).send("✅ Crypto Miner Bot is LIVE on Vercel!");
    }

    const body = req.body;
    const TELEGRAM_TOKEN = process.env.BOT_TOKEN;
    const API_URL = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;

    if (!body.message) return res.status(200).end();

    const chatId = body.message.chat.id;
    const text = body.message.text;

    if (text === "/start") {
      const message = `
<b>🚀 Welcome to the Future of Crypto Mining!</b>

💠 <b>Top-Rated Mining System</b> in Telegram  
💠 <b>Bitcoin, USDT, Ethereum</b> Supported  
💠 Instant Earnings | No Hardware Needed  
💠 Available Worldwide 🌍  
💠 Real-Time Mining | Fast Payouts 💸

Our project is trusted by miners globally and offers the most <b>powerful mining rewards</b> in the market!  

🔥 Tap below to begin your mining journey and watch your crypto grow!
      `;

      const button = {
        chat_id: chatId,
        text: message,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "⛏️ Start Mining Now",
                web_app: {
                  url: "http://t.me/MineBitsCoreBot/MineCore" // ✅ Replace with your Mini App link
                }
              }
            ]
          ]
        }
      };

      await axios.post(`${API_URL}/sendMessage`, button);
    }

    res.status(200).end();
  } catch (err) {
    console.error("Bot Error:", err);
    res.status(500).send("Server Error");
  }
}
