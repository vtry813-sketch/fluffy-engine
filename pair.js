const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
const ffmpegPath = ffmpegInstaller.path;
process.env.FFMPEG_PATH = ffmpegPath;

const ffmpeg = require('fluent-ffmpeg');
const { Sticker, StickerTypes } = require('wa-sticker-formatter');
const fs = require('fs-extra');
const path = require('path');
const { exec } = require('child_process');
const pino = require('pino');
const axios = require('axios');
const FormData = require('form-data');
const os = require('os');
const cheerio = require('cheerio');
const mongoose = require('mongoose');
const moment = require('moment-timezone');
const Jimp = require('jimp');
const crypto = require('crypto');
const FileType = require('file-type');
const yts = require('yt-search');
const TelegramBot = require('node-telegram-bot-api');
const express = require("express");
const bodyparser = require('body-parser');

// ================= CONFIGURATION EXPRESS ================= //
const app = express();
const port = process.env.PORT || 9090;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyparser.json());

// Servir les fichiers statiques
app.use(express.static(__dirname));

// Import des modules de BILAL-MD
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  jidNormalizedUser,
  isJidBroadcast,
  getContentType,
  proto,
  generateWAMessageContent,
  generateWAMessage,
  AnyMessageContent,
  prepareWAMessageMedia,
  areJidsSameUser,
  downloadContentFromMessage,
  MessageRetryMap,
  generateForwardMessageContent,
  generateWAMessageFromContent,
  generateMessageID,
  makeInMemoryStore,
  jidDecode,
  fetchLatestBaileysVersion,
  Browsers,
  makeCacheableSignalKeyStore  
} = require('@whiskeysockets/baileys');

const l = console.log;
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson } = require('./lib/functions');
const { AntiDelDB, initializeAntiDeleteSettings, setAnti, getAnti, getAllAntiDeleteSettings, saveContact, loadMessage, getName, getChatSummary, saveGroupMetadata, getGroupMetadata, saveMessageCount, getInactiveGroupMembers, getGroupMembersMessageCount, saveMessage } = require('./data');
const P = require('pino');
const config = require('./config');
const qrcode = require('qrcode-terminal');
const StickersTypes = require('wa-sticker-formatter');
const util = require('util');
const { sms, downloadMediaMessage, AntiDelete } = require('./lib');
const { fromBuffer } = require('file-type');

// ================= CONFIGURATION PAR DÉFAUT ================= //
const defaultConfig = {
  AUTO_VIEW_STATUS: 'true',
  AUTO_LIKE_STATUS: 'true',
  AUTO_RECORDING: 'true',
  AUTO_LIKE_EMOJI: ['🖤', '🍬', '💫', '🎈', '💚', '🎶', '❤️', '🧫', '⚽'],
  PREFIX: config.PREFIX || '.',
  BOT_FOOTER: '> © MADE BY BILAL KING',
  MAX_RETRIES: 3,
  GROUP_INVITE_LINK: 'https://chat.whatsapp.com/EcOPWEvs03f0iLCk4wradO?mode=hqrt3',
  ADMIN_LIST_PATH: './admin.json',
  IMAGE_PATH: 'https://files.catbox.moe/6oriof.jpg',
  NEWSLETTER_JID: [
    '120363403408693274@newsletter',
    '120363401051937059@newsletter',
    '120363419474272514@newsletter',
    '120363425413527865@newsletter'
  ],
  NEWSLETTER_MESSAGE_ID: '428',
  OTP_EXPIRY: 300000,
  OWNER_NUMBER: '923078071982',
  DEV_MODE: 'false',
  CHANNEL_LINK: 'https://whatsapp.com/channel/0029VbBlpT396H4JPxNF7707',
  WORK_TYPE: "public",
  ANTI_CAL: "off",
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || '7214172448:AAHGqSgaw-zGVPZWvl8msDOVDhln-9kExas',
  TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID || '7825445776',
  AUTO_REACT: config.AUTO_REACT || 'true',
  AUTO_STATUS_SEEN: config.AUTO_STATUS_SEEN || "true",
  AUTO_STATUS_REACT: config.AUTO_STATUS_REACT || "true",
  AUTO_STATUS_REPLY: config.AUTO_STATUS_REPLY || "false",
  AUTO_STATUS_MSG: config.AUTO_STATUS_MSG || "",
  READ_MESSAGE: config.READ_MESSAGE || 'true',
  CUSTOM_REACT: config.CUSTOM_REACT || 'false',
  CUSTOM_REACT_EMOJIS: config.CUSTOM_REACT_EMOJIS || '🥲,😂,👍🏻,🙂,😔',
  MODE: config.MODE || "public"
};

const telegramBot = new TelegramBot(defaultConfig.TELEGRAM_BOT_TOKEN, { polling: false });

// ================= MONGODB CONNECTION ================= //
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://kaviduinduwara:kavidu2008@cluster0.bqmspdf.mongodb.net/soloBot?retryWrites=true&w=majority&appName=Cluster0';
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('✅ Connected to MongoDB');
}).catch(err => {
  console.error('❌ MongoDB connection error:', err);
});

// ================= MONGODB SCHEMAS ================= //
const sessionSchema = new mongoose.Schema({
  number: { type: String, required: true, unique: true },
  creds: { type: Object, required: true },
  config: { type: Object, default: defaultConfig },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const numberSchema = new mongoose.Schema({
  number: { type: String, required: true, unique: true },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const otpSchema = new mongoose.Schema({
  number: { type: String, required: true },
  otp: { type: String, required: true },
  newConfig: { type: Object },
  expiry: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now }
});

// MongoDB Models
const Session = mongoose.model('Session', sessionSchema);
const BotNumber = mongoose.model('BotNumber', numberSchema);
const OTP = mongoose.model('OTP', otpSchema);

// ================= VARIABLES GLOBALES ================= //
const activeSockets = new Map();
const socketCreationTime = new Map();
const SESSION_BASE_PATH = './sessions_multi';
const otpStore = new Map();
const cleanupLocks = new Set();
const welcomeSettings = new Map();
const antilinkSettings = new Map();

if (!fs.existsSync(SESSION_BASE_PATH)) {
  fs.mkdirSync(SESSION_BASE_PATH, { recursive: true });
}

// ================= FONCTIONS MONGODB ================= //
async function saveSessionToMongoDB(number, creds, userConfig = null) {
  try {
    const sanitizedNumber = number.replace(/[^0-9]/g, '');
    const existingSession = await Session.findOne({ number: sanitizedNumber });

    if (existingSession) {
      await Session.findOneAndUpdate(
        { number: sanitizedNumber },
        {
          creds: creds,
          updatedAt: new Date()
        }
      );
      console.log(`🔄 Session credentials updated for ${sanitizedNumber}`);
    } else {
      const sessionData = {
        number: sanitizedNumber,
        creds: creds,
        config: userConfig || defaultConfig,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await Session.findOneAndUpdate(
        { number: sanitizedNumber },
        sessionData,
        { upsert: true, new: true }
      );
      console.log(`✅ NEW Session saved to MongoDB for ${sanitizedNumber}`);
    }
  } catch (error) {
    console.error('❌ Failed to save/update session in MongoDB:', error);
    throw error;
  }
}

async function getSessionFromMongoDB(number) {
  try {
    const sanitizedNumber = number.replace(/[^0-9]/g, '');
    const session = await Session.findOne({ number: sanitizedNumber });
    return session ? session.creds : null;
  } catch (error) {
    console.error('❌ Failed to get session from MongoDB:', error);
    return null;
  }
}

async function getUserConfigFromMongoDB(number) {
  try {
    const sanitizedNumber = number.replace(/[^0-9]/g, '');
    const session = await Session.findOne({ number: sanitizedNumber });
    return session ? session.config : { ...defaultConfig };
  } catch (error) {
    console.error('❌ Failed to get user config from MongoDB:', error);
    return { ...defaultConfig };
  }
}

async function updateUserConfigInMongoDB(number, newConfig) {
  try {
    const sanitizedNumber = number.replace(/[^0-9]/g, '');
    await Session.findOneAndUpdate(
      { number: sanitizedNumber },
      {
        config: newConfig,
        updatedAt: new Date()
      }
    );
    console.log(`✅ Config updated in MongoDB for ${sanitizedNumber}`);
  } catch (error) {
    console.error('❌ Failed to update config in MongoDB:', error);
    throw error;
  }
}

async function deleteSessionFromMongoDB(number) {
  try {
    const sanitizedNumber = number.replace(/[^0-9]/g, '');
    await Promise.all([
      Session.findOneAndDelete({ number: sanitizedNumber }),
      BotNumber.findOneAndDelete({ number: sanitizedNumber }),
      OTP.findOneAndDelete({ number: sanitizedNumber })
    ]);
    console.log(`✅ Session completely deleted from MongoDB for ${sanitizedNumber}`);
  } catch (error) {
    console.error('❌ Failed to delete session from MongoDB:', error);
    throw error;
  }
}

async function addNumberToMongoDB(number) {
  try {
    const sanitizedNumber = number.replace(/[^0-9]/g, '');
    await BotNumber.findOneAndUpdate(
      { number: sanitizedNumber },
      { number: sanitizedNumber, active: true },
      { upsert: true }
    );
    console.log(`✅ Number ${sanitizedNumber} added to MongoDB`);
  } catch (error) {
    console.error('❌ Failed to add number to MongoDB:', error);
    throw error;
  }
}

async function getAllNumbersFromMongoDB() {
  try {
    const numbers = await BotNumber.find({ active: true });
    return numbers.map(n => n.number);
  } catch (error) {
    console.error('❌ Failed to get numbers from MongoDB:', error);
    return [];
  }
}

// ================= FONCTIONS UTILITAIRES ================= //
function formatMessage(title, content, footer) {
  return `*${title}*\n\n${content}\n\n> *${footer}*`;
}

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function getSriLankaTimestamp() {
  return moment().tz('Asia/Colombo').format('YYYY-MM-DD HH:mm:ss');
}

function safeJSONParse(str, defaultValue = {}) {
  try {
    if (!str || str.trim() === '') return defaultValue;
    const cleanStr = str.replace(/[^\x20-\x7E]/g, '');
    return JSON.parse(cleanStr);
  } catch (error) {
    console.error('❌ JSON parse failed:', error.message, 'Input:', str?.substring(0, 100));
    return defaultValue;
  }
}

function isNumberAlreadyConnected(number) {
  const sanitizedNumber = number.replace(/[^0-9]/g, '');
  return activeSockets.has(sanitizedNumber);
}

function getConnectionStatus(number) {
  const sanitizedNumber = number.replace(/[^0-9]/g, '');
  const isConnected = activeSockets.has(sanitizedNumber);
  const connectionTime = socketCreationTime.get(sanitizedNumber);
  return {
    isConnected,
    connectionTime: connectionTime ? new Date(connectionTime).toLocaleString() : null,
    uptime: connectionTime ? Math.floor((Date.now() - connectionTime) / 1000) : 0
  };
}

function createSerial(size) {
  return crypto.randomBytes(size).toString('hex').slice(0, size);
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ================= GÉNÉRATEUR DE CODE POUR HTML ================= //
async function generatePairingCode(number) {
  try {
    // Logique pour générer un code de pairing
    // Pour l'instant, générons un code aléatoire
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    // Ici, vous pouvez ajouter la logique pour sauvegarder ce code
    // et le lier au numéro pour la vérification ultérieure
    console.log(`Generated pairing code for ${number}: ${code}`);
    
    return code;
  } catch (error) {
    console.error('Error generating pairing code:', error);
    throw error;
  }
}

// ================= FONCTION PRINCIPALE BILAL-MD ================= //
async function BILALMDPair(number, res) {
  const sanitizedNumber = number.replace(/[^0-9]/g, '');
  const sessionPath = path.join(SESSION_BASE_PATH, `session_${sanitizedNumber}`);

  if (isNumberAlreadyConnected(sanitizedNumber)) {
    console.log(`⏩ ${sanitizedNumber} is already connected, skipping...`);
    const status = getConnectionStatus(sanitizedNumber);
    if (res && !res.headersSent) {
      return res.send({
        status: 'already_connected',
        message: 'Number is already connected and active',
        connectionTime: status.connectionTime,
        uptime: `${status.uptime} seconds`
      });
    }
    return;
  }

  const connectionLockKey = `connecting_${sanitizedNumber}`;
  if (global[connectionLockKey]) {
    console.log(`⏩ ${sanitizedNumber} is already in connection process, skipping...`);
    if (res && !res.headersSent) {
      return res.send({
        status: 'connection_in_progress',
        message: 'Number is currently being connected'
      });
    }
    return;
  }

  global[connectionLockKey] = true;

  try {
    const existingSession = await Session.findOne({ number: sanitizedNumber });
    if (!existingSession) {
      console.log(`🧹 No MongoDB session found for ${sanitizedNumber} - requiring NEW pairing`);
      if (fs.existsSync(sessionPath)) {
        await fs.remove(sessionPath);
        console.log(`🗑️ Cleaned leftover local session for ${sanitizedNumber}`);
      }
    } else {
      const restoredCreds = await getSessionFromMongoDB(sanitizedNumber);
      if (restoredCreds) {
        fs.ensureDirSync(sessionPath);
        fs.writeFileSync(path.join(sessionPath, 'creds.json'), JSON.stringify(restoredCreds, null, 2));
        console.log(`🔄 Restored existing session from MongoDB for ${sanitizedNumber}`);
      }
    }

    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
    const logger = pino({ level: process.env.NODE_ENV === 'production' ? 'fatal' : 'debug' });

    const socket = makeWASocket({
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, logger),
      },
      printQRInTerminal: false,
      logger,
      browser: Browsers.macOS('Safari')
    });

    socketCreationTime.set(sanitizedNumber, Date.now());
    activeSockets.set(sanitizedNumber, socket);

    if (!socket.authState.creds.registered) {
      console.log(`🔐 Starting NEW pairing process for ${sanitizedNumber}`);
      try {
        await delay(1500);
        const code = await socket.requestPairingCode(sanitizedNumber);
        
        if (res && !res.headersSent) {
          return res.send({ code, status: 'new_pairing' });
        }
      } catch (error) {
        console.error(`Failed to request pairing code:`, error.message);
        if (res && !res.headersSent) {
          return res.status(500).send({
            error: 'Failed to get pairing code',
            status: 'error',
            message: error.message
          });
        }
        throw error;
      }
    } else {
      console.log(`✅ Using existing session for ${sanitizedNumber}`);
      if (res && !res.headersSent) {
        return res.send({ status: 'connected', message: 'Using existing session' });
      }
    }

    socket.ev.on('creds.update', async () => {
      await saveCreds();
      const fileContent = await fs.readFile(path.join(sessionPath, 'creds.json'), 'utf8');
      const creds = JSON.parse(fileContent);
      const existingSession = await Session.findOne({ number: sanitizedNumber });
      const isNewSession = !existingSession;
      await saveSessionToMongoDB(sanitizedNumber, creds);
      if (isNewSession) {
        console.log(`🎉 NEW user ${sanitizedNumber} successfully registered!`);
      }
    });

    socket.ev.on('connection.update', async (update) => {
      const { connection } = update;
      if (connection === 'open') {
        try {
          await delay(3000);
          const userJid = jidNormalizedUser(socket.user.id);
          await addNumberToMongoDB(sanitizedNumber);

          // Send welcome message
          const welcomeMessage = formatMessage(
            'BILAL-MD MULTI SESSION',
            `✅ SUCCESSFULLY CONNECTED!\n\n🔢 NUMBER: ${sanitizedNumber}\n\n> Prefix: ${defaultConfig.PREFIX}\n> Follow Channel: https://whatsapp.com/channel/0029Vaj3Xnu17EmtDxTNnQ0G`,
            'MADE BY BILAL KING'
          );

          await socket.sendMessage(userJid, {
            image: { url: defaultConfig.IMAGE_PATH },
            caption: welcomeMessage
          });

          console.log(`🎉 ${sanitizedNumber} successfully connected to BILAL-MD!`);

        } catch (error) {
          console.error('Connection setup error:', error);
        }
      }
    });

    // Setup reconnection
    socket.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect } = update;
      if (connection === 'close') {
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        if (statusCode !== 401) {
          console.log(`🔄 Reconnecting ${sanitizedNumber}...`);
          await delay(10000);
          activeSockets.delete(sanitizedNumber);
          socketCreationTime.delete(sanitizedNumber);
          await BILALMDPair(number, null);
        }
      }
    });

  } catch (error) {
    console.error('BILALMDPair main error:', error);
    if (res && !res.headersSent) {
      return res.status(500).send({ error: 'Internal Server Error', details: error.message });
    }
  } finally {
    global[connectionLockKey] = false;
  }
}

// ================= ROUTES API ================= //

// Route pour la page HTML de pairing
app.get('/pair', async (req, res) => {
  res.sendFile(path.join(__dirname, 'pair.html'));
});

// Route pour générer le code (utilisée par le HTML)
app.get('/code', async (req, res) => {
  const { number } = req.query;
  if (!number) {
    return res.status(400).send({ error: 'Number parameter is required' });
  }
  
  try {
    // Utilisez la fonction principale pour générer le code
    // Pour l'instant, on utilise une version simplifiée
    const mockRes = {
      headersSent: false,
      send: (data) => {
        if (data && data.code) {
          return res.send({ code: data.code, status: 'new_pairing' });
        }
        return res.send({ error: 'Failed to generate code' });
      },
      status: () => ({ send: () => {} })
    };
    
    await BILALMDPair(number, mockRes);
  } catch (error) {
    console.error('Error in /code route:', error);
    res.status(500).send({ 
      error: 'Failed to generate code',
      details: error.message 
    });
  }
});

// Route principale pour connecter un numéro

app.get('/', async (req, res) => {
  const { number } = req.query;
  if (!number) {
    // Si pas de numéro, servir une page d'accueil ou rediriger
    return res.send(`
      <html>
        <head><title>BILAL-MD Multi Session</title></head>
        <body>
          <h1>BILAL-MD Multi Session Server</h1>
          <p>Use <a href="/pair">/pair</a> for pairing interface</p>
          <p>Use ?number=123456789 to connect a number</p>
        </body>
      </html>
    `);
  }

  const connectionStatus = getConnectionStatus(number);
  if (connectionStatus.isConnected) {
    return res.status(200).send({
      status: 'already_connected',
      message: 'This number is already connected and active',
      connectionTime: connectionStatus.connectionTime,
      uptime: `${connectionStatus.uptime} seconds`,
      details: 'The bot is running and processing messages'
    });
  }

  await BILALMDPair(number, res);
});

app.get('/status', async (req, res) => {
  const { number } = req.query;
  if (!number) {
    const activeConnections = Array.from(activeSockets.keys()).map(num => {
      const status = getConnectionStatus(num);
      return {
        number: num,
        status: 'connected',
        connectionTime: status.connectionTime,
        uptime: `${status.uptime} seconds`
      };
    });
    return res.status(200).send({
      totalActive: activeSockets.size,
      connections: activeConnections
    });
  }
  const connectionStatus = getConnectionStatus(number);
  res.status(200).send({
    number: number,
    isConnected: connectionStatus.isConnected,
    connectionTime: connectionStatus.connectionTime,
    uptime: `${connectionStatus.uptime} seconds`,
    message: connectionStatus.isConnected ? 'Number is actively connected' : 'Number is not connected'
  });
});

app.get('/active', (req, res) => {
  res.status(200).send({
    count: activeSockets.size,
    numbers: Array.from(activeSockets.keys())
  });
});

app.get('/ping', (req, res) => {
  res.status(200).send({
    status: 'active',
    message: '🚀 BILAL-MD MULTI SESSION is running',
    activesession: activeSockets.size,
    timestamp: new Date().toISOString()
  });
});

// ================= AUTO RECONNECT AU DÉMARRAGE ================= //
async function autoReconnectFromMongoDB() {
  try {
    const numbers = await getAllNumbersFromMongoDB();
    console.log(`Found ${numbers.length} numbers to reconnect from MongoDB`);
    
    for (const number of numbers) {
      if (!activeSockets.has(number)) {
        console.log(`Attempting to reconnect ${number}...`);
        try {
          await BILALMDPair(number, null);
          console.log(`✅ Reconnected ${number}`);
          await delay(2000); // Délai entre les reconnexions
        } catch (error) {
          console.error(`❌ Failed to reconnect ${number}:`, error.message);
        }
      }
    }
  } catch (error) {
    console.error('❌ autoReconnectFromMongoDB error:', error.message);
  }
}

// ================= DÉMARRAGE DU SERVEUR ================= //
app.listen(port, () => {
  console.log(`🚀 BILAL-MD Multi Session Server listening on port http://localhost:${port}`);
  console.log(`🌐 Available at: https://fluffy-engine-3439.onrender.com`);
  
  // Auto reconnect after 5 seconds
  setTimeout(() => {
    autoReconnectFromMongoDB();
  }, 5000);
});

// ================= GESTION DES ERREURS ET NETTOYAGE ================= //
process.on('exit', () => {
  console.log('Cleaning up before exit...');
  activeSockets.forEach((socket, number) => {
    try {
      socket.ws.close();
    } catch (e) {}
    activeSockets.delete(number);
    socketCreationTime.delete(number);
  });
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// ================= EXPORT POUR LES TESTS ================= //
module.exports = { 
  app, 
  activeSockets, 
  getConnectionStatus, 
  isNumberAlreadyConnected,
  BILALMDPair 
};
