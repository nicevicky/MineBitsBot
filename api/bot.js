import axios from "axios";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(200).send("✅ Crypto Miner Bot is LIVE on Vercel!");
    }

    const body = req.body;
    const TELEGRAM_TOKEN = process.env.BOT_TOKEN;
    const API_URL = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;
    const WEB_APP_URL = "https://mine-bits-bot.vercel.app/";

    // ✅ Handle callback queries FIRST
    if (body.callback_query) {
      const callbackQuery = body.callback_query;
      const callbackChatId = callbackQuery.message.chat.id;
      const callbackData = callbackQuery.data;
      const callbackUser = callbackQuery.from;

      // Answer callback query
      await axios.post(`${API_URL}/answerCallbackQuery`, {
        callback_query_id: callbackQuery.id,
        text: "Loading..."
      });

      switch (callbackData) {

        case "allow_messages":
          await axios.post(`${API_URL}/answerCallbackQuery`, {
            callback_query_id: callbackQuery.id,
            text: "You have allowed the bot to send you messages!",
            show_alert: true
          });

          await axios.post(`${API_URL}/sendMessage`, {
            chat_id: callbackChatId,
            text: "✅ Thanks for allowing me to send you messages!"
          });
          break;

        case "how_it_works":
          await axios.post(`${API_URL}/sendMessage`, {
            chat_id: callbackChatId,
            text: `
📚 <b>How Crypto Miner Bot Works</b>

<b>1️⃣ Get Started</b>
• Register and receive welcome bonus
• Complete your profile setup

<b>2️⃣ Choose a Miner</b>
• BTC, ETH, BNB, SOL, TON, USDT
    
<b>3️⃣ Start Mining</b>
• Activate your chosen miner
• Earn crypto automatically every hour
• Watch your balance grow! 📈

<b>4️⃣ Invite Friends</b>
• Unlimited earning potential! 💰

<b>Ready to start earning?</b> Tap below! 👇
            `,
            parse_mode: "HTML",
            reply_markup: {
              inline_keyboard: [
                [{ text: "🚀 Launch App Now", web_app: { url: WEB_APP_URL } }]
              ]
            }
          });
          break;

        case "help":
          await axios.post(`${API_URL}/sendMessage`, {
            chat_id: callbackChatId,
            text: `
❓ <b>Need Help?</b>

Q: How do I start mining?
A: Open the app → Miners → Activate miner

📧 Support: @YourSupportUsername
            `,
            parse_mode: "HTML",
            reply_markup: {
              inline_keyboard: [
                [{ text: "🚀 Launch App", web_app: { url: WEB_APP_URL } }]
              ]
            }
          });
          break;

        case "invite":
          const botInfo = await axios.get(`${API_URL}/getMe`);
          const botUsername = botInfo.data.result.username;
          const inviteLink = `https://t.me/${botUsername}?startapp=${callbackUser.id}`;

          await axios.post(`${API_URL}/sendMessage`, {
            chat_id: callbackChatId,
            text: `
👥 <b>Invite Friends & Earn Together!</b>

Share your link:
<code>${inviteLink}</code>
            `,
            parse_mode: "HTML",
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "📤 Share Link",
                    url: `https://t.me/share/url?url=${inviteLink}`
                  }
                ],
                [
                  {
                    text: "⛏️ Open Dashboard",
                    web_app: { url: WEB_APP_URL }
                  }
                ]
              ]
            }
          });
          break;

        default:
          break;
      }

      return res.status(200).end();
    }

    // ✅ Handle regular messages
    if (body.message) {
      const chatId = body.message.chat.id;
      const user = body.message.from;
      const text = body.message.text || "";

      let startParam = null;
      let referrerId = null;

      if (text.startsWith("/start ")) {
        startParam = text.replace("/start ", "").trim();
        if (startParam.includes("startapp=")) referrerId = startParam.split("startapp=")[1];
        else if (startParam) referrerId = startParam;
      }

      // ✅ Referral start
      if (text.startsWith("/start ") && referrerId) {
        await axios.post(`${API_URL}/sendMessage`, {
          chat_id: chatId,
          text: `
🎉 <b>Welcome to Crypto Miner Bot!</b>

You were invited by <code>${referrerId}</code>
🔥 Tap Launch to Start Mining!
          `,
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "🚀 Launch Miner App",
                  web_app: { url: `${WEB_APP_URL}?startapp=${referrerId}` }
                }
              ]
            ]
          }
        });
        return res.status(200).end();
      }

      // ✅ Normal /start
      if (text === "/start") {
        await axios.post(`${API_URL}/sendMessage`, {
          chat_id: chatId,
          text: `
<b>🚀 Welcome to Crypto Miner Bot!</b>
Start earning crypto now! ⛏️💰
          `,
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [{ text: "⛏️ Start Mining", web_app: { url: WEB_APP_URL } }],
              [{ text: "👥 Invite Friends", callback_data: "invite" }]
            ]
          }
        });
        return res.status(200).end();
      }

      return res.status(200).end();
    }

    res.status(200).end();

  } catch (err) {
    console.error("Bot Error:", err.response?.data || err.message);
    res.status(500).send("Server Error");
  }
}
