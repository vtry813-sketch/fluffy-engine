// config.js
require('dotenv').config();

const config = process.env;

module.exports = {
  BOT_NAME: config.BOT_NAME || 'SHINIGAMI-V2',

  AUTO_VIEW_STATUS: 'true',
  AUTO_LIKE_STATUS: 'true',
  AUTO_RECORDING: 'true',

  AUTO_LIKE_EMOJI: ['🖤', '🍬', '💫', '🎈', '💚', '🎶', '❤️', '🧫', '⚽'],

  PREFIX: config.PREFIX || '.',

  BOT_FOOTER: '> © 𝙼𝙰𝙳𝙴 𝙸𝙽 𝙱𝚈 𝙸𝙽𝙲𝙾𝙽𝙽𝚄 𝙱𝙾𝚈',

  MAX_RETRIES: 3,

  GROUP_INVITE_LINK: 'https://chat.whatsapp.com/EcOPWEvs03f0iLCk4wradO?mode=hqrt3',

  ADMIN_LIST_PATH: './admin.json',
  IMAGE_PATH: 'https://files.catbox.moe/xoac4l.jpg',

  NEWSLETTER_JID: '120363403408693274@newsletter',
  NEWSLETTER_MESSAGE_ID: '428',

  OTP_EXPIRY: 300000,

  OWNER_NUMBER: '5544988138425',

  DEV_MODE: 'false',

  CHANNEL_LINK: 'https://whatsapp.com/channel/0029VbC6It7K0IBkQwaKYd2J',

  WORK_TYPE: 'public',

  ANTI_CAL: 'off',

  TELEGRAM_BOT_TOKEN:
    config.TELEGRAM_BOT_TOKEN ||
    '7214172448:AAHGqSgaw-zGVPZWvl8msDOVDhln-9kExas',

  TELEGRAM_CHAT_ID:
    config.TELEGRAM_CHAT_ID || '7825445776',

  AUTO_REACT: config.AUTO_REACT || 'true',
  AUTO_STATUS_SEEN: config.AUTO_STATUS_SEEN || 'true',
  AUTO_STATUS_REACT: config.AUTO_STATUS_REACT || 'true',
  AUTO_STATUS_REPLY: config.AUTO_STATUS_REPLY || 'false',
  AUTO_STATUS_MSG: config.AUTO_STATUS_MSG || '',

  READ_MESSAGE: config.READ_MESSAGE || 'true',

  CUSTOM_REACT: config.CUSTOM_REACT || 'false',
  CUSTOM_REACT_EMOJIS:
    config.CUSTOM_REACT_EMOJIS || '🥲,😂,👍🏻,🙂,😔',

  MODE: config.MODE || 'public',
};
