import axios from "axios";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(200).send("✅ Crypto Miner Bot is LIVE on Vercel!");
    }

    const body = req.body;
    const TELEGRAM_TOKEN = process.env.BOT_TOKEN;
    const API_URL = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;

    // If no message, ignore
    if (!body.message) return res.status(200).end();

    const chatId = body.message.chat.id;
    const text = body.message.text || "";

    // ✅ Extract start parameter (if exists)
    const isStartWithParam = text.startsWith("/start ");

    let startParam = null;
    if (isStartWithParam) {
      startParam = text.replace("/start ", "").trim();
    }

    // ✅ If user comes from ?startapp=xxxxx
    if (startParam && startParam.startsWith("startapp=")) {
      const userIdFromLink = startParam.split("=")[1];

      await axios.post(`${API_URL}/sendMessage`, {
        chat_id: chatId,
        text: `🎉 Welcome Miner!\n\nYou joined using a referral / WebApp link.\n🆔 Ref ID: <b>${userIdFromLink}</b>`,
        parse_mode: "HTML"
      });

      await axios.post(`${API_URL}/sendMessage`, {
        chat_id: chatId,
        text: "✅ Mining Automatically Activated! ⛏️🔥\nTap below to view your dashboard 👇",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "📊 Open Mining Dashboard",
                web_app: { url: "https://mine-bits-bot.vercel.app/" }
              }
            ]
          ]
        }
      });

      return res.status(200).end();
    }

    // ✅ Normal /start (no parameters)
    if (text === "/start") {
      const message = `
<b>🚀 Welcome to the Future of Crypto Mining!</b>

💠 <b>Top-Rated Mining System</b> in Telegram  
💠 <b>Bitcoin, USDT, Ethereum</b> Supported  
💠 Instant Earnings | No Hardware Needed  
💠 Available Worldwide 🌍  
💠 Real-Time Mining | Fast Payouts 💸

🔥 Tap below to begin your mining journey 👇
      `;

      await axios.post(`${API_URL}/sendMessage`, {
        chat_id: chatId,
        text: message,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "⛏️ Start Mining Now",
                web_app: { url: "https://mine-bits-bot.vercel.app/" }
              }
            ]
          ]
        }
      });
    }

    res.status(200).end();
  } catch (err) {
    console.error("Bot Error:", err.response?.data || err.message);
    res.status(500).send("Server Error");
  }
}
