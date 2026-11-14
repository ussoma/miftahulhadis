
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(200).send('Miftahulhadis Bot is running');
  }

  const BOT_TOKEN = process.env.BOT_TOKEN;
  const WEB_APP_URL = process.env.WEB_APP_URL;

  if (!BOT_TOKEN || !WEB_APP_URL) {
    return res.status(500).json({
      error: 'Missing BOT_TOKEN or WEB_APP_URL'
    });
  }

  try {
    const update = req.body;
    const message = update?.message;

    if (message?.text?.startsWith('/start')) {
      const chatId = message.chat.id;

      const text =
        'Ассалому алайкум! 🤍\n\n' +
        'Ба китобхонаи исломии Miftahulhadis хуш омадед!\n\n' +
        'Дар ин ҷо шумо метавонед ҳадисҳо, дуоҳо, азкор ва дигар маводи исломиро омӯзед.\n\n' +
        '📖 Илмро ҷустуҷӯ кун. Ба он амал намо.';

      await fetch(
        `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            chat_id: chatId,
            text,
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
    }

    return res.status(200).json({ ok: true });

  } catch (error) {
    console.error('Bot error:', error);
    return res.status(500).json({ error: 'Bot error' });
  }
}
