// MADE BY INCONNU BOY 🍂

const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const __path = process.cwd();

const PORT = process.env.PORT || 10000;
const pairRoutes = require('./index');

require('events').EventEmitter.defaultMaxListeners = 500;

// =====================
// Middleware
// =====================
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// =====================
// Routes
// =====================
app.use('/code', pairRoutes);

app.get('/pair', (req, res) => {
  res.sendFile(__path + '/pair.html');
});

app.get('/', (req, res) => {
  res.sendFile(__path + '/main.html');
});

// =====================
// Démarrage du serveur
// =====================
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`
INCONNU BOY IS THE BEST 👋
Server running on http://0.0.0.0:${PORT}
`);
});

// =====================
// Actions APRÈS écoute
// =====================
server.on('listening', () => {
  setTimeout(async () => {
    try {
      const { autoReconnectFromMongoDB } = require('./pair');
      await autoReconnectFromMongoDB();
      console.log('✅ Auto-reconnect completed');
    } catch (error) {
      console.error('❌ Auto-reconnect failed:', error.message);
    }
  }, 5000);
});

module.exports = app;
