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

    // ✅ MOVED UP: Handle callback queries (button clicks) FIRST
    if (body.callback_query) {
      const callbackQuery = body.callback_query;
      const callbackChatId = callbackQuery.message.chat.id;
      const callbackData = callbackQuery.data;
      const callbackUser = callbackQuery.from;

      switch (callbackData) {
        case "allow_messages":
          // Send a popup alert to the user
          await axios.post(`${API_URL}/answerCallbackQuery`, {
            callback_query_id: callbackQuery.id,
            text: 'You have allowed the bot to send you messages!',
            show_alert: true
          });

          // Send follow-up message
          await axios.post(`${API_URL}/sendMessage`, {
            chat_id: callbackChatId,
            text: 'Thanks for allowing me to send you messages!'
          });
          break;

        case "how_it_works":
          await axios.post(`${API_URL}/answerCallbackQuery`, {
            callback_query_id: callbackQuery.id,
            text: "Loading..."
          });

          await axios.post(`${API_URL}/sendMessage`, {
            chat_id: callbackChatId,
            text: `
📚 <b>How Crypto Miner Bot Works</b>

<b>1️⃣ Get Started</b>
    • Register and receive welcome bonus
    • Complete your profile setup

<b>2️⃣ Choose a Miner</b>
    • BTC - Bitcoin Mining
    • ETH - Ethereum Mining
    • BNB - Binance Coin Mining
    • SOL - Solana Mining
    • TON - Toncoin Mining
    • USDT - Tether Mining
    
<b>3️⃣ Start Mining</b>
    • Activate your chosen miner
    • Earn crypto automatically every hour
    • Watch your balance grow! 📈

<b>4️⃣ Invite Friends</b>
    • Share your referral link
    • Earn bonus for each friend
    • Unlimited earning potential! 💰

<b>5️⃣ Withdraw</b>
    • Minimum withdrawal varies by crypto
    • Fast and secure payouts
    • Direct to your wallet! 🔐

<b>Ready to start earning?</b> Tap below! 👇
            `,
            parse_mode: "HTML",
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "🚀 Launch App Now",
                    web_app: { url: WEB_APP_URL }
                  }
                ]
              ]
            }
          });
          break;

        case "help":
          await axios.post(`${API_URL}/answerCallbackQuery`, {
            callback_query_id: callbackQuery.id,
            text: "Loading..."
          });

          await axios.post(`${API_URL}/sendMessage`, {
            chat_id: callbackChatId,
            text: `
❓ <b>Need Help?</b>

<b>Common Questions:</b>

<b>Q: How do I start mining?</b>
A: Open the app → "Miners" tab → Choose crypto → Activate!

<b>Q: When do I get paid?</b>
A: Earnings are added hourly and credited when miner expires.

<b>Q: How do withdrawals work?</b>
A: Go to "Withdraw" → Enter amount → Provide wallet address → Submit!

<b>Q: How do referrals work?</b>
A: Share your link from "Invite" tab. You earn when friends join!

<b>Q: Is it safe?</b>
A: Yes! We use secure blockchain technology and encrypted transactions.

<b>Q: What's the minimum withdrawal?</b>
A: Varies by crypto. Check the withdrawal page for details.

<b>Still need help?</b>
📧 Support: @YourSupportUsername
            `,
            parse_mode: "HTML",
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "🚀 Launch App",
                    web_app: { url: WEB_APP_URL }
                  }
                ]
              ]
            }
          });
          break;

        case "invite":
          await axios.post(`${API_URL}/answerCallbackQuery`, {
            callback_query_id: callbackQuery.id,
            text: "Loading..."
          });

          // Get bot username
          const botInfo = await axios.get(`${API_URL}/getMe`);
          const botUsername = botInfo.data.result.username;
          // ✅ Use callbackUser.id for the invite link
          const inviteLink = `https://t.me/${botUsername}?startapp=${callbackUser.id}`;

          await axios.post(`${API_URL}/sendMessage`, {
            chat_id: callbackChatId,
            text: `
👥 <b>Invite Friends & Earn Together!</b>

Share your personal referral link:
<code>${inviteLink}</code>

💰 <b>Your Rewards:</b>
✅ Bonus for each friend who joins
✅ Your friend gets welcome bonus too
✅ Unlimited referrals = Unlimited earnings!

📱 <b>How to Share:</b>
1. Tap "Share Link" below
2. Send to friends on Telegram
3. Earn when they start mining! 🚀

<i>The more you share, the more you earn! 💎</i>
            `,
            parse_mode: "HTML",
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "📤 Share Link",
                    url: `https://t.me/share/url?url=${encodeURIComponent(
                      inviteLink
                    )}&text=${encodeURIComponent(
                      "🚀 Join me on Crypto Miner Bot and start earning crypto daily! Free registration bonus awaiting! ⛏️💰"
                    )}`
                  }
                ],
                [
                  {
                    text: "⛏️ Open My Dashboard",
                    web_app: { url: WEB_APP_URL }
                  }
                ]
              ]
            }
          });
          break;

        default:
          await axios.post(`${API_URL}/answerCallbackQuery`, {
            callback_query_id: callbackQuery.id
          });
          break;
      }

      return res.status(200).end();
    }

    // ✅ Handle regular messages SECOND
    if (body.message) {
      const chatId = body.message.chat.id;
      const user = body.message.from;
      const text = body.message.text || "";

      // ✅ Extract start parameter (if exists)
      let startParam = null;
      let referrerId = null;

      if (text.startsWith("/start ")) {
        startParam = text.replace("/start ", "").trim();

        // Parse referral ID from different formats
        if (startParam.includes("startapp=")) {
          referrerId = startParam.split("startapp=")[1];
        } else if (startParam) {
          referrerId = startParam;
        }
      }

      // ✅ Handle /start with referral parameter (from deep link)
      if (text.startsWith("/start ") && referrerId) {
        // Send popup alert message first
        const welcomeMessage = `
🎉 <b>Welcome to Crypto Miner Bot!</b> 🎉

Hi <b>${user.first_name}</b>! 👋

You've been invited to join our mining community!

✨ <b>What you'll receive:</b>
💰 Registration bonus
⛏️ Free crypto mining access
👥 Referral rewards
📈 Hourly earnings

🎁 <b>Special Offer:</b>
You were invited by User ID: <code>${referrerId}</code>
Both of you will receive <b>bonus rewards</b>! 🎊

⚡️ <b>Get Started in 3 Steps:</b>
1️⃣ Tap "Launch Miner" below
2️⃣ Choose your crypto miner
3️⃣ Start earning immediately!

<i>Join thousands earning crypto daily! 🚀</i>
        `.trim();

        await axios.post(`${API_URL}/sendMessage`, {
          chat_id: chatId,
          text: welcomeMessage,
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "🚀 Launch Miner App",
                  // ✅ Pass the referrerId to the web app
                  web_app: { url: `${WEB_APP_URL}?startapp=${referrerId}` }
                }
              ],
              [
                { text: "📊 How it Works", callback_data: "how_it_works" },
                { text: "❓ Help", callback_data: "help" }
              ]
            ]
          }
        });

        // Optional: Send a follow-up animation/sticker for engagement
        await axios
          .post(`${API_URL}/sendAnimation`, {
            chat_id: chatId,
            animation: "https://i.imgur.com/3KZ5Z3q.gif", // Replace with your mining animation
            caption: "⛏️ <b>Mining Activated!</b> Tap the button above to start! 🔥",
            parse_mode: "HTML"
          })
          .catch(() => {}); // Silent fail if animation doesn't work

        return res.status(200).end();
      }

      // ✅ Handle normal /start (no parameters)
      if (text === "/start") {
        const message = `
<b>🚀 Welcome to the Future of Crypto Mining!</b>

💠 <b>Top-Rated Mining System</b> in Telegram
💠 <b>Bitcoin, USDT, Ethereum, BNB, SOL, TON</b> Supported
💠 Instant Earnings | No Hardware Needed
💠 Available Worldwide 🌍
💠 Real-Time Mining | Fast Payouts 💸

<b>🎁 New User Bonuses:</b>
✅ Registration reward
✅ First miner discount
✅ Referral program access

🔥 <b>Start mining in 30 seconds!</b> 👇
        `.trim();

        await axios.post(`${API_URL}/sendMessage`, {
          chat_id: chatId,
          text: message,
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "⛏️ Start Mining Now",
                  web_app: { url: WEB_APP_URL }
                }
              ],
              [
                { text: "📖 Learn More", callback_data: "how_it_works" },
                { text: "👥 Invite Friends", callback_data: "invite" }
              ]
            ]
          }
        });

        return res.status(200).end();
      }

      // ✅ If it's a message but not /start, just end
      return res.status(200).end();
    }

    // If it's not a callback or a message, end
    res.status(200).end();
    
  } catch (err) {
    console.error("Bot Error:", err.response?.data || err.message);
    res.status(500).send("Server Error");
  }
}
