
export default async function handler(req, res) {
  // Проверка работы сервера
  if (req.method === 'GET') {
    return res.status(200).send('Miftahulhadis Bot is running');
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
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

    // Обрабатываем только сообщения
    if (!message) {
      return res.status(200).json({ ok: true });
    }

    const text = message.text || '';

    // Проверяем команду /start
    if (!/^\/start(?:@\w+)?(?:\s|$)/i.test(text)) {
      return res.status(200).json({ ok: true });
    }

    const chatId = message.chat.id;

    const welcomeText =
      'Ассалому алайкум! 🤍\n\n' +
      'Ба китобхонаи исломии Miftahulhadis хуш омадед!\n\n' +
      'Дар ин ҷо шумо метавонед ҳадисҳо, дуоҳо, азкор ва дигар маводи исломиро омӯзед.\n\n' +
      '📖 Илмро ҷустуҷӯ кун. Ба он амал намо.';

    // Отправляем приветствие и кнопку Mini App
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
                  text: '📖 Открыть Miftahulhadis',
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

    // Проверяем настоящий ответ Telegram
    if (!telegramResponse.ok || !result.ok) {
      console.error('Telegram sendMessage error:', result);

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
