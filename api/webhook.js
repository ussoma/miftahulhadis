
export default async function handler(req, res) {
  // Санҷиши кори сервер
  if (req.method === 'GET') {
    return res.status(200).send('Miftahulhadis Bot is running');
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed'
    });
  }

  const BOT_TOKEN = process.env.BOT_TOKEN;
  const WEB_APP_URL = process.env.WEB_APP_URL;

  if (!BOT_TOKEN || !WEB_APP_URL) {
    console.error('Missing BOT_TOKEN or WEB_APP_URL');

    return res.status(500).json({
      error: 'Environment variables are missing'
    });
  }

  try {
    let update = req.body;

    if (typeof update === 'string') {
      update = JSON.parse(update);
    }

    const message = update?.message;

    if (!message) {
      return res.status(200).json({ ok: true });
    }

    const messageText = message.text || '';

    // Танҳо фармони /start коркард мешавад
    if (!/^\/start(?:@\w+)?(?:\s|$)/i.test(messageText)) {
      return res.status(200).json({ ok: true });
    }

    const chatId = message.chat.id;

    // Гирифтани номи корбар аз Telegram
    const firstName = message.from?.first_name || '';
    const lastName = message.from?.last_name || '';

    const fullName = [firstName, lastName]
      .filter(Boolean)
      .join(' ');

    const userName = fullName || 'أَخِي الْكَرِيمُ';

    // Матни истиқбол
    const welcomeText =
      'السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ 🤍\n\n' +
      'أَهْلًا وَسَهْلًا بِكَ يَا ' + userName + '!\n\n' +
      'مَرْحَبًا بِكَ فِي مَكْتَبَةِ 𝑴𝒊𝒇𝒕𝒂𝒉𝒖𝒍𝒉𝒂𝒅𝒊𝒔 الْإِسْلَامِيَّةِ.\n\n' +
      'هُنَا يُمْكِنُكَ قِرَاءَةُ الْأَحَادِيثِ وَالْأَدْعِيَةِ وَالْأَذْكَارِ، وَالتَّعَرُّفُ عَلَى الْعُلُومِ الْإِسْلَامِيَّةِ.\n\n' +
      '📖 اُطْلُبِ الْعِلْمَ وَاعْمَلْ بِهِ.';

    // Фиристодани паём ба Telegram
    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: welcomeText,
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: '📖 Открыть 𝑴𝒊𝒇𝒕𝒂𝒉𝒖𝒍𝒉𝒂𝒅𝒊𝒔',
                  web_app: {
                    url: WEB_APP_URL
                  }
                }
              ]
            ]
          }
        })
      }
    );

    const result = await telegramResponse.json();

    if (!telegramResponse.ok || !result.ok) {
      console.error('Telegram error:', result);

      return res.status(200).json({
        ok: false,
        telegram_error: result.description || 'Unknown Telegram error'
      });
    }

    console.log('Welcome message sent successfully:', chatId);

    return res.status(200).json({
      ok: true,
      message: 'Welcome message sent'
    });

  } catch (error) {
    console.error('Webhook error:', error);

    return res.status(500).json({
      ok: false,
      error: 'Internal server error'
    });
  }
}
