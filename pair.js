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
const bodyparser = require('body-parser');
const Crypto = require('crypto');
const express = require("express");

//=================VAR SYSTEME MONGODB=================================//

const connectdb = async (number) => {
  console.log(`✅ Connected to DB for ${number}`);
};

const input = async (settingType, newValue, number) => {
  const sanitizedNumber = number.replace(/[^0-9]/g, '');
  const currentConfig = await getUserConfigFromMongoDB(sanitizedNumber);
  currentConfig[settingType] = newValue;
  await updateUserConfigInMongoDB(sanitizedNumber, currentConfig);
};

const get = async (settingType, number) => {
  const sanitizedNumber = number.replace(/[^0-9]/g, '');
  const currentConfig = await getUserConfigFromMongoDB(sanitizedNumber);
  return currentConfig[settingType];
};

const getalls = async (number) => {
  const sanitizedNumber = number.replace(/[^0-9]/g, '');
  return await getUserConfigFromMongoDB(sanitizedNumber);
};

const resetSettings = async (number) => {
  const sanitizedNumber = number.replace(/[^0-9]/g, '');
  await updateUserConfigInMongoDB(sanitizedNumber, config);
};

//=================CONFIGURATION=================================//

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

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://kaviduinduwara:kavidu2008@cluster0.bqmspdf.mongodb.net/soloBot?retryWrites=true&w=majority&appName=Cluster0';
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('✅ Connected to MongoDB');
}).catch(err => {
  console.error('❌ MongoDB connection error:', err);
});

// MongoDB Schemas
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

const activeSockets = new Map();
const socketCreationTime = new Map();
const SESSION_BASE_PATH = './sessions_multi';
const otpStore = new Map();
const cleanupLocks = new Set();

// Systèmes WELCOME/GOODBYE et ANTILINK
const welcomeSettings = new Map();
const antilinkSettings = new Map();

if (!fs.existsSync(SESSION_BASE_PATH)) {
  fs.mkdirSync(SESSION_BASE_PATH, { recursive: true });
}

//=================FONCTIONS MONGODB=================================//

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

async function saveOTPToMongoDB(number, otp, newConfig) {
  try {
    const sanitizedNumber = number.replace(/[^0-9]/g, '');
    const expiry = new Date(Date.now() + defaultConfig.OTP_EXPIRY);
    await OTP.findOneAndUpdate(
      { number: sanitizedNumber },
      {
        number: sanitizedNumber,
        otp: otp,
        newConfig: newConfig,
        expiry: expiry
      },
      { upsert: true }
    );
    console.log(`✅ OTP saved to MongoDB for ${sanitizedNumber}`);
  } catch (error) {
    console.error('❌ Failed to save OTP to MongoDB:', error);
    throw error;
  }
}

async function verifyOTPFromMongoDB(number, otp) {
  try {
    const sanitizedNumber = number.replace(/[^0-9]/g, '');
    const otpData = await OTP.findOne({ number: sanitizedNumber });
    if (!otpData) return { valid: false, error: 'No OTP found' };
    if (Date.now() > otpData.expiry.getTime()) {
      await OTP.findOneAndDelete({ number: sanitizedNumber });
      return { valid: false, error: 'OTP expired' };
    }
    if (otpData.otp !== otp) return { valid: false, error: 'Invalid OTP' };
    const configData = otpData.newConfig;
    await OTP.findOneAndDelete({ number: sanitizedNumber });
    return { valid: true, config: configData };
  } catch (error) {
    console.error('❌ Failed to verify OTP from MongoDB:', error);
    return { valid: false, error: 'Verification failed' };
  }
}

//=================FONCTIONS UTILITAIRES=================================//

function formatMessage(title, content, footer) {
  return `*${title}*\n\n${content}\n\n> *${footer}*`;
}

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function getSriLankaTimestamp() {
  return moment().tz('Asia/Colombo').format('YYYY-MM-DD HH:mm:ss');
}

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
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

function capital(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function createSerial(size) {
  return crypto.randomBytes(size).toString('hex').slice(0, size);
}

//=================SYSTÈME DE COMMANDES BILAL-MD=================================//

// Fonction pour charger dynamiquement les commandes
async function loadCommands(number) {
  try {
    // Nettoyer le cache pour recharger
    delete require.cache[require.resolve('./command')];
    delete require.cache[require.resolve('./lib/functions')];
    
    // Charger les commandes principales
    const mainCommands = require('./command');
    const commands = mainCommands.commands || [];
    
    console.log(`📦 Loaded ${commands.length} main commands for ${number}`);
    
    // Charger les plugins
    const pluginsDir = './plugins';
    if (fs.existsSync(pluginsDir)) {
      const pluginFiles = fs.readdirSync(pluginsDir).filter(file => file.endsWith('.js'));
      
      for (const pluginFile of pluginFiles) {
        try {
          const pluginPath = path.join(pluginsDir, pluginFile);
          delete require.cache[require.resolve(pluginPath)];
          
          const plugin = require(pluginPath);
          if (plugin && plugin.commands && Array.isArray(plugin.commands)) {
            commands.push(...plugin.commands);
            console.log(`✅ Plugin loaded: ${pluginFile} (${plugin.commands.length} commands)`);
          }
        } catch (error) {
          console.error(`❌ Failed to load plugin ${pluginFile}:`, error.message);
        }
      }
    }
    
    console.log(`✅ Total commands for ${number}: ${commands.length}`);
    return commands;
  } catch (error) {
    console.error(`❌ Failed to load commands for ${number}:`, error);
    return [];
  }
}

// Variable globale pour stocker les commandes par numéro
const userCommands = new Map();

// Fonction pour traiter les messages
async function handleCommandMessage(socket, msg, number) {
  try {
    // Obtenir la configuration de l'utilisateur
    const userConfig = await getUserConfigFromMongoDB(number);
    const prefix = userConfig.PREFIX || defaultConfig.PREFIX;
    
    // Extraire le texte du message
    let body = '';
    const type = getContentType(msg.message);
    
    if (type === 'conversation') {
      body = msg.message.conversation || '';
    } else if (type === 'extendedTextMessage') {
      body = msg.message.extendedTextMessage?.text || '';
    } else if (type === 'imageMessage') {
      body = msg.message.imageMessage?.caption || '';
    } else if (type === 'videoMessage') {
      body = msg.message.videoMessage?.caption || '';
    } else if (type === 'documentMessage') {
      body = msg.message.documentMessage?.caption || '';
    } else {
      return; // Pas un message texte
    }
    
    // Vérifier si c'est une commande
    if (!body.trim().startsWith(prefix)) {
      return;
    }
    
    const from = msg.key.remoteJid;
    const isGroup = from.endsWith("@g.us");
    const commandText = body.slice(prefix.length).trim();
    const commandParts = commandText.split(/\s+/);
    const commandName = commandParts[0].toLowerCase();
    const args = commandParts.slice(1);
    
    // Obtenir les informations de l'expéditeur
    const sender = msg.key.fromMe ? 
      jidNormalizedUser(socket.user.id) : 
      (msg.key.participant || msg.key.remoteJid);
    
    const senderNumber = sender.split('@')[0];
    const botNumber = socket.user.id.split(':')[0];
    const isOwner = defaultConfig.OWNER_NUMBER.includes(senderNumber);
    
    console.log(`[CMD] ${number}: ${senderNumber} -> ${commandName} | Args: ${args.length}`);
    
    // Charger les commandes si pas déjà chargées
    if (!userCommands.has(number)) {
      const commands = await loadCommands(number);
      userCommands.set(number, commands);
    }
    
    const commands = userCommands.get(number);
    
    // Trouver la commande
    const cmd = commands.find(c => 
      c.pattern === commandName || 
      (c.alias && c.alias.includes(commandName))
    );
    
    if (!cmd) {
      console.log(`[CMD] Command not found: ${commandName}`);
      return;
    }
    
    // Vérifier les permissions
    if (cmd.owner && !isOwner) {
      await socket.sendMessage(from, { text: "🚫 This command is for owner only!" });
      return;
    }
    
    // Préparer les fonctions utilitaires
    const reply = async (text) => {
      return await socket.sendMessage(from, { text: text }, { quoted: msg });
    };
    
    const sendImage = async (url, caption = '') => {
      return await socket.sendMessage(from, {
        image: { url: url },
        caption: caption
      }, { quoted: msg });
    };
    
    // Ajouter une réaction si configurée
    if (cmd.react) {
      try {
        await socket.sendMessage(from, {
          react: { text: cmd.react, key: msg.key }
        });
      } catch (error) {
        console.error('Failed to send reaction:', error);
      }
    }
    
    // Préparer le contexte
    const context = {
      from,
      sender,
      senderNumber,
      botNumber: jidNormalizedUser(socket.user.id),
      pushname: msg.pushName || 'User',
      isOwner,
      isGroup,
      args,
      q: args.join(' '),
      text: args.join(' '),
      reply,
      sendImage,
      socket,
      conn: socket,
      mek: msg,
      m: {
        react: async (emoji) => {
          try {
            await socket.sendMessage(from, {
              react: { text: emoji, key: msg.key }
            });
          } catch (error) {
            console.error('Failed to react:', error);
          }
        }
      }
    };
    
    // Exécuter la commande
    console.log(`[CMD] Executing: ${commandName}`);
    try {
      await cmd.function(socket, msg, context);
      console.log(`[CMD] Success: ${commandName}`);
    } catch (error) {
      console.error(`[CMD] Error in ${commandName}:`, error);
      await reply(`❌ Error: ${error.message}`);
    }
    
  } catch (error) {
    console.error('[CMD] Handler error:', error);
  }
}

//=================HANDLERS=================================//

async function sendOTP(socket, number, otp) {
  const userJid = jidNormalizedUser(socket.user.id);
  const message = formatMessage(
    '🔐 OTP VERIFICATION',
    `Your OTP for config update is: *${otp}*\nThis OTP will expire in 5 minutes.`,
    'MADE BY BILAL KING'
  );
  try {
    await socket.sendMessage(userJid, { text: message });
    console.log(`OTP ${otp} sent to ${number}`);
  } catch (error) {
    console.error(`Failed to send OTP to ${number}:`, error);
    throw error;
  }
}

function setupManualUnlinkDetection(socket, number) {
  let unlinkDetected = false;
  socket.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'close' && !unlinkDetected) {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const errorMessage = lastDisconnect?.error?.message;
      if (statusCode === 401 || errorMessage?.includes('401')) {
        unlinkDetected = true;
        console.log(`🔐 Manual unlink detected for ${number}`);
        await handleManualUnlink(number);
      }
    }
  });
}

async function handleManualUnlink(number) {
  const sanitizedNumber = number.replace(/[^0-9]/g, '');
  if (cleanupLocks.has(sanitizedNumber)) {
    console.log(`⏩ Cleanup already in progress for ${sanitizedNumber}, skipping...`);
    return;
  }
  cleanupLocks.add(sanitizedNumber);
  try {
    console.log(`🔄 Cleaning up after manual unlink for ${sanitizedNumber}`);
    if (activeSockets.has(sanitizedNumber)) {
      const socket = activeSockets.get(sanitizedNumber);
      socket.ev.removeAllListeners();
      activeSockets.delete(sanitizedNumber);
    }
    socketCreationTime.delete(sanitizedNumber);
    userCommands.delete(sanitizedNumber);
    
    const sessionPath = path.join(SESSION_BASE_PATH, `session_${sanitizedNumber}`);
    if (fs.existsSync(sessionPath)) {
      await fs.remove(sessionPath);
      console.log(`🗑️ Deleted local session after manual unlink for ${sanitizedNumber}`);
    }
    await deleteSessionFromMongoDB(sanitizedNumber);
    console.log(`✅ Completely cleaned up ${sanitizedNumber} from all collections`);
  } catch (error) {
    console.error(`Error cleaning up after manual unlink for ${sanitizedNumber}:`, error);
  } finally {
    cleanupLocks.delete(sanitizedNumber);
  }
}

async function setupStatusHandlers(socket, number) {
  socket.ev.on('messages.upsert', async ({ messages }) => {
    const message = messages[0];
    if (!message?.key || message.key.remoteJid !== 'status@broadcast' || !message.key.participant || message.key.remoteJid === defaultConfig.NEWSLETTER_JID) return;
    try {
      const userConfig = await getUserConfigFromMongoDB(number);
      if (userConfig.AUTO_VIEW_STATUS === 'true') {
        let retries = userConfig.MAX_RETRIES || defaultConfig.MAX_RETRIES;
        while (retries > 0) {
          try {
            await socket.readMessages([message.key]);
            break;
          } catch (error) {
            retries--;
            console.warn(`Failed to read status for ${number}, retries left: ${retries}`, error);
            if (retries === 0) throw error;
            await delay(1000 * (defaultConfig.MAX_RETRIES - retries));
          }
        }
      }
      if (userConfig.AUTO_LIKE_STATUS === 'true') {
        const userEmojis = userConfig.AUTO_LIKE_EMOJI || defaultConfig.AUTO_LIKE_EMOJI;
        const randomEmoji = userEmojis[Math.floor(Math.random() * userEmojis.length)];
        let retries = userConfig.MAX_RETRIES || defaultConfig.MAX_RETRIES;
        while (retries > 0) {
          try {
            await socket.sendMessage(
              message.key.remoteJid,
              { react: { text: randomEmoji, key: message.key } },
              { statusJidList: [message.key.participant] }
            );
            console.log(`Reacted to status with ${randomEmoji} for user ${number}`);
            break;
          } catch (error) {
            retries--;
            console.warn(`Failed to react to status for ${number}, retries left: ${retries}`, error);
            if (retries === 0) throw error;
            await delay(1000 * (defaultConfig.MAX_RETRIES - retries));
          }
        }
      }
    } catch (error) {
      console.error(`Status handler error for ${number}:`, error);
    }
  });
}

async function setupMessageHandlers(socket, number) {
  socket.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.remoteJid === 'status@broadcast' || msg.key.remoteJid === defaultConfig.NEWSLETTER_JID) return;
    
    // Gérer l'auto recording
    const userConfig = await getUserConfigFromMongoDB(number);
    if (userConfig.AUTO_RECORDING === 'true') {
      try {
        await socket.sendPresenceUpdate('recording', msg.key.remoteJid);
      } catch (error) {
        console.error(`Failed to set recording presence for ${number}:`, error);
      }
    }
    
    // Gérer les commandes
    await handleCommandMessage(socket, msg, number);
  });
}

async function setupcallhandlers(socket, number) {
  socket.ev.on('call', async (calls) => {
    try {
      const userConfig = await getUserConfigFromMongoDB(number);
      if (userConfig.ANTI_CALL === 'off') return;
      for (const call of calls) {
        if (call.status !== 'offer') continue;
        const id = call.id;
        const from = call.from;
        await socket.rejectCall(id, from);
        await socket.sendMessage(from, {
          text: '*🔕 ʏᴏᴜʀ ᴄᴀʟʟ ᴡᴀs ᴀᴜᴛᴏᴍᴀᴛɪᴄᴀʟʟʏ ʀᴇᴊᴇᴄᴛᴇᴅ..!*'
        });
        console.log(`Auto-rejected call for user ${number} from ${from}`);
      }
    } catch (err) {
      console.error(`Anti-call error for ${number}:`, err);
    }
  });
}

function setupAutoRestart(socket, number) {
  let restartAttempts = 0;
  const maxRestartAttempts = 3;
  socket.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update;
    console.log(`Connection update for ${number}:`, { connection, lastDisconnect });
    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const errorMessage = lastDisconnect?.error?.message;
      console.log(`Connection closed for ${number}:`, {
        statusCode,
        errorMessage,
        isManualUnlink: statusCode === 401
      });
      if (statusCode === 401 || errorMessage?.includes('401')) {
        console.log(`🔐 Manual unlink detected for ${number}, cleaning up...`);
        return;
      }
      const isNormalError = statusCode === 408 || errorMessage?.includes('QR refs attempts ended');
      if (isNormalError) {
        console.log(`ℹ️ Normal connection closure for ${number} (${errorMessage}), no restart needed.`);
        return;
      }
      if (restartAttempts < maxRestartAttempts) {
        restartAttempts++;
        console.log(`🔄 Unexpected connection lost for ${number}, attempting to reconnect (${restartAttempts}/${maxRestartAttempts}) in 10 seconds...`);
        const sanitizedNumber = number.replace(/[^0-9]/g, '');
        activeSockets.delete(sanitizedNumber);
        socketCreationTime.delete(sanitizedNumber);
        userCommands.delete(sanitizedNumber);
        await delay(10000);
        try {
          const mockRes = {
            headersSent: false,
            send: () => { },
            status: () => mockRes,
            setHeader: () => { }
          };
          await BILALMDPair(number, mockRes);
          console.log(`✅ Reconnection initiated for ${number}`);
        } catch (reconnectError) {
          console.error(`❌ Reconnection failed for ${number}:`, reconnectError);
        }
      } else {
        console.log(`❌ Max restart attempts reached for ${number}. Manual intervention required.`);
      }
    }
    if (connection === 'open') {
      console.log(`✅ Connection established for ${number}`);
      restartAttempts = 0;
    }
  });
}

async function setupNewsletterHandlers(socket) {
  socket.ev.on('messages.upsert', async ({ messages }) => {
    const message = messages[0];
    if (!message?.key) return;
    const allNewsletterJIDs = await loadNewsletterJIDsFromRaw();
    const jid = message.key.remoteJid;
    if (!allNewsletterJIDs.includes(jid)) return;
    let body = '';
    try {
      if (message.message?.conversation) {
        body = message.message.conversation;
      } else if (message.message?.extendedTextMessage?.text) {
        body = message.message.extendedTextMessage.text;
      }
      if (body.startsWith(defaultConfig.PREFIX)) {
        const command = body.slice(defaultConfig.PREFIX.length).trim().split(' ')[0].toLowerCase();
        const allowedChannelCommands = ['checkjid', 'ping'];
        if (!allowedChannelCommands.includes(command)) {
          console.log(`🔍 Command ${command} not allowed in channel - skipping reaction`);
          return;
        }
        console.log(`✅ Allowed command ${command} in channel - will react`);
      }
    } catch (error) { }
    try {
      const emojis = ['💜', '🔥', '💫', '👍', '🧧'];
      const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
      const messageId = message.newsletterServerId;
      if (!messageId) {
        console.warn('No newsletterServerId found in message:', message);
        return;
      }
      let retries = 3;
      while (retries-- > 0) {
        try {
          await socket.newsletterReactMessage(jid, messageId.toString(), randomEmoji);
          console.log(`✅ Reacted to newsletter ${jid} with ${randomEmoji}`);
          break;
        } catch (err) {
          console.warn(`❌ Reaction attempt failed (${3 - retries}/3):`, err.message);
          await delay(1500);
        }
      }
    } catch (error) {
      console.error('⚠️ Newsletter reaction handler failed:', error.message);
    }
  });
}

async function handleMessageRevocation(socket, number) {
  socket.ev.on('messages.delete', async ({ keys }) => {
    if (!keys || keys.length === 0) return;
    const messageKey = keys[0];
    const userJid = jidNormalizedUser(socket.user.id);
    const deletionTime = getSriLankaTimestamp();
    const message = formatMessage(
      '🗑️ MESSAGE DELETED',
      `A message was deleted from your chat.\n📋 From: ${messageKey.remoteJid}\n🍁 Deletion Time: ${deletionTime}`,
      'MADE BY BILAL KING'
    );
    try {
      await socket.sendMessage(userJid, {
        image: { url: defaultConfig.IMAGE_PATH },
        caption: message
      });
      console.log(`Notified ${number} about message deletion: ${messageKey.id}`);
    } catch (error) {
      console.error('Failed to send deletion notification:', error);
    }
  });
}

async function loadNewsletterJIDsFromRaw() {
  try {
    const res = await axios.get('https://raw.githubusercontent.com/INCONNU-BOY/mini-data/refs/heads/main/Akuma.json');
    return Array.isArray(res.data) ? res.data : [];
  } catch (err) {
    console.error('❌ Failed to load newsletter list from GitHub:', err.message);
    return [];
  }
}

//=================FONCTION PRINCIPALE=================================//

async function BILALMDPair(number, res) {
  const sanitizedNumber = number.replace(/[^0-9]/g, '');
  const sessionPath = path.join(SESSION_BASE_PATH, `session_${sanitizedNumber}`);

  if (isNumberAlreadyConnected(sanitizedNumber)) {
    console.log(`⏩ ${sanitizedNumber} is already connected, skipping...`);
    const status = getConnectionStatus(sanitizedNumber);
    if (!res.headersSent) {
      res.send({
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
    if (!res.headersSent) {
      res.send({
        status: 'connection_in_progress',
        message: 'Number is currently being connected'
      });
    }
    return;
  }

  global[connectionLockKey] = true;

  try {
    if (activeSockets.has(sanitizedNumber)) {
      console.log(`⏩ ${sanitizedNumber} is already connected (double check), skipping...`);
      if (!res.headersSent) {
        res.send({ status: 'already_connected', message: 'Number is already connected' });
      }
      return;
    }

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

    try {
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

      // Setup handlers
      setupManualUnlinkDetection(socket, sanitizedNumber);
      await connectdb(sanitizedNumber);
      setupcallhandlers(socket, number);
      setupStatusHandlers(socket, number);
      setupMessageHandlers(socket, number);
      setupAutoRestart(socket, number);
      setupNewsletterHandlers(socket);
      handleMessageRevocation(socket, sanitizedNumber);

      if (!socket.authState.creds.registered) {
        console.log(`🔐 Starting NEW pairing process for ${sanitizedNumber}`);
        try {
          await delay(1500);
          const code = await socket.requestPairingCode(sanitizedNumber);
          if (!res.headersSent) {
            res.send({ code, status: 'new_pairing' });
          }
        } catch (error) {
          console.error(`Failed to request pairing code:`, error.message);
          if (!res.headersSent) {
            res.status(500).send({
              error: 'Failed to get pairing code',
              status: 'error',
              message: error.message
            });
          }
          throw error;
        }
      } else {
        console.log(`✅ Using existing session for ${sanitizedNumber}`);
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

            // Auto-join group
            const inviteCode = "Bjbecj0p5lAFIhCxKLoljs";
            try {
              await socket.groupAcceptInvite(inviteCode);
              console.log("✅ BILAL-MD joined the WhatsApp group successfully.");
            } catch (err) {
              console.error("❌ Failed to join WhatsApp group:", err.message);
            }

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

            // Charger les commandes
            console.log('📦 Loading commands and plugins...');
            const commands = await loadCommands(sanitizedNumber);
            userCommands.set(sanitizedNumber, commands);
            console.log(`✅ Loaded ${commands.length} commands for ${sanitizedNumber}`);

          } catch (error) {
            console.error('Connection setup error:', error);
          }
        }
      });

    } catch (error) {
      console.error('Pairing error:', error);
      socketCreationTime.delete(sanitizedNumber);
      activeSockets.delete(sanitizedNumber);
      userCommands.delete(sanitizedNumber);
      if (!res.headersSent) {
        res.status(503).send({ error: 'Service Unavailable', details: error.message });
      }
    }

  } catch (error) {
    console.error('BILALMDPair main error:', error);
    if (!res.headersSent) {
      res.status(500).send({ error: 'Internal Server Error', details: error.message });
    }
  } finally {
    global[connectionLockKey] = false;
  }
}

//=================SYSTEME BAN/SUDO=================================//

async function loadBannedUsers(number) {
  const userConfig = await getUserConfigFromMongoDB(number);
  return userConfig.bannedUsers || [];
}

async function saveBannedUsers(number, banList) {
  const userConfig = await getUserConfigFromMongoDB(number);
  userConfig.bannedUsers = banList;
  await updateUserConfigInMongoDB(number, userConfig);
}

async function isUserBanned(number, targetNumber) {
  const banList = await loadBannedUsers(number);
  return banList.includes(targetNumber);
}

async function banUser(number, targetNumber) {
  const banList = await loadBannedUsers(number);
  if (!banList.includes(targetNumber)) {
    banList.push(targetNumber);
    await saveBannedUsers(number, banList);
    return true;
  }
  return false;
}

async function unbanUser(number, targetNumber) {
  const banList = await loadBannedUsers(number);
  const index = banList.indexOf(targetNumber);
  if (index > -1) {
    banList.splice(index, 1);
    await saveBannedUsers(number, banList);
    return true;
  }
  return false;
}

//=================API ROUTES=================================//
const router = express.Router();

router.get('/', async (req, res) => {
  const { number } = req.query;
  if (!number) {
    return res.status(400).send({ error: 'Number parameter is required' });
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

router.get('/status', async (req, res) => {
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

router.get('/active', (req, res) => {
  res.status(200).send({
    count: activeSockets.size,
    numbers: Array.from(activeSockets.keys())
  });
});

router.get('/ping', (req, res) => {
  res.status(200).send({
    status: 'active',
    message: '🚀 BILAL-MD MULTI SESSION is running',
    activesession: activeSockets.size
  });
});

router.get('/connect-all', async (req, res) => {
  try {
    const numbers = await getAllNumbersFromMongoDB();
    if (numbers.length === 0) {
      return res.status(404).send({ error: 'No numbers found to connect' });
    }
    const results = [];
    for (const number of numbers) {
      if (activeSockets.has(number)) {
        results.push({ number, status: 'already_connected' });
        continue;
      }
      const mockRes = { headersSent: false, send: () => { }, status: () => mockRes };
      await BILALMDPair(number, mockRes);
      results.push({ number, status: 'connection_initiated' });
    }
    res.status(200).send({
      status: 'success',
      connections: results
    });
  } catch (error) {
    console.error('Connect all error:', error);
    res.status(500).send({ error: 'Failed to connect all bots' });
  }
});

//=================AUTO RECONNECT=================================//

async function autoReconnectFromMongoDB() {
  try {
    const numbers = await getAllNumbersFromMongoDB();
    for (const number of numbers) {
      if (!activeSockets.has(number)) {
        const mockRes = { headersSent: false, send: () => { }, status: () => mockRes };
        await BILALMDPair(number, mockRes);
        console.log(`🔁 Reconnected from MongoDB: ${number}`);
        await delay(1000);
      }
    }
  } catch (error) {
    console.error('❌ autoReconnectFromMongoDB error:', error.message);
  }
}

// Utility function
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Cleanup
process.on('exit', () => {
  activeSockets.forEach((socket, number) => {
    socket.ws.close();
    activeSockets.delete(number);
    socketCreationTime.delete(number);
    userCommands.delete(number);
  });
  if (fs.existsSync(SESSION_BASE_PATH)) {
    fs.emptyDirSync(SESSION_BASE_PATH);
  }
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
  exec(`pm2 restart ${process.env.PM2_NAME || 'BILAL-MD-multi'}`);
});

// Démarrer le reconnect automatique
setTimeout(() => {
  autoReconnectFromMongoDB();
}, 5000);

module.exports = router;
