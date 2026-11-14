
export default async function handler(req, res) {
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
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY =
    process.env.SUPABASE_SERVICE_ROLE_KEY;
  const ADMIN_TELEGRAM_ID = process.env.ADMIN_TELEGRAM_ID;

  if (
    !BOT_TOKEN ||
    !WEB_APP_URL ||
    !SUPABASE_URL ||
    !SUPABASE_SERVICE_ROLE_KEY ||
    !ADMIN_TELEGRAM_ID
  ) {
    console.error('Missing environment variables');

    return res.status(500).json({
      error: 'Environment variables are missing'
    });
  }

  // Фиристодани паём ба Telegram
  async function sendTelegramMessage(chatId, text, replyMarkup) {
    const response = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          ...(replyMarkup ? { reply_markup: replyMarkup } : {})
        })
      }
    );

    return await response.json();
  }

  // Сабти корбар дар Supabase
  async function saveUser(user) {
    const response = await fetch(
      `${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/bot_users?on_conflict=telegram_id`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          Prefer: 'resolution=merge-duplicates,return=minimal'
        },
        body: JSON.stringify({
          telegram_id: user.id,
          first_name: user.first_name || '',
          last_name: user.last_name || ''
        })
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('Supabase save error:', error);
      throw new Error('Could not save user');
    }
  }

  try {
    let update = req.body;

    if (typeof update === 'string') {
      update = JSON.parse(update);
    }

    const message = update?.message;

    if (!message || !message.from) {
      return res.status(200).json({ ok: true });
    }

    const user = message.from;
    const chatId = message.chat.id;
    const messageText = message.text || '';

    // Сабти корбар
    await saveUser(user);

    // Фармони рассылка
    const broadcastMatch = messageText.match(
      /^\/broadcast(?:@\w+)?(?:\s+([\s\S]+))?$/i
    );

    if (broadcastMatch) {
      // Санҷиши администратор
      if (String(user.id) !== String(ADMIN_TELEGRAM_ID)) {
        return res.status(200).json({ ok: true });
      }

      const broadcastText = broadcastMatch[1]?.trim();

      if (!broadcastText) {
        await sendTelegramMessage(
          chatId,
          'Матни рассылкаро чунин фирист:\n\n/broadcast Матни паёми шумо'
        );

        return res.status(200).json({ ok: true });
      }

      // Гирифтани ҳамаи корбарон аз Supabase
      const usersResponse = await fetch(
        `${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/bot_users?select=telegram_id`,
        {
          headers: {
            apikey: SUPABASE_SERVICE_ROLE_KEY,
            Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
          }
        }
      );

      if (!usersResponse.ok) {
        throw new Error('Could not get users from Supabase');
      }

      const users = await usersResponse.json();

      let sent = 0;
      let failed = 0;

      // Фиристодани паём ба ҳамаи корбарон
      for (const recipient of users) {
        try {
          const result = await sendTelegramMessage(
            recipient.telegram_id,
            broadcastText
          );

          if (result.ok) {
            sent++;
          } else {
            failed++;
            console.error(
              'Broadcast failed:',
              recipient.telegram_id,
              result.description
            );
          }
        } catch (error) {
          failed++;
          console.error('Send error:', error);
        }

        // Каме таваққуф барои риояи маҳдудияти Telegram
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      await sendTelegramMessage(
        chatId,
        '📨 Рассылка ба анҷом расид!\n\n' +
        '👥 Ҳамагӣ: ' + users.length + '\n' +
        '✅ Фиристода шуд: ' + sent + '\n' +
        '❌ Ноком шуд: ' + failed
      );

      return res.status(200).json({ ok: true });
    }

    // Фармони /start
    if (/^\/start(?:@\w+)?(?:\s|$)/i.test(messageText)) {
      const firstName = user.first_name || '';
      const lastName = user.last_name || '';

      const userName = [firstName, lastName]
        .filter(Boolean)
        .join(' ') || 'дӯстам';

      const welcomeText =
        'السلام عليكم ورحمة الله وبركاته 🤍\n\n' +
        userName + '!\n\n' +
        'Ба китобхонаи исломии 𝑴𝒊𝒇𝒕𝒂𝒉𝒖𝒍𝒉𝒂𝒅𝒊𝒔 хуш омадед!\n\n' +
        'Дар ин ҷо шумо метавонед ҳадисҳо, дуоҳо, азкор ва дигар маводи исломиро омӯзед.\n\n' +
        '📖 Илмро ҷустуҷӯ кун. Ба он амал намо.';

      const result = await sendTelegramMessage(
        chatId,
        welcomeText,
        {
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
      );

      if (!result.ok) {
        console.error('Telegram error:', result);
      }
    }

    return res.status(200).json({ ok: true });

  } catch (error) {
    console.error('Webhook error:', error);

    return res.status(500).json({
      ok: false,
      error: 'Internal server error'
    });
  }
}
