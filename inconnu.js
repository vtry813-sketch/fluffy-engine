const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require("body-parser");

__path = process.cwd();
const PORT = process.env.PORT || 8000;

// ⚠️ Ton fichier index.js n'est PAS un middleware Express.
// On charge simplement le bot, sans l'ajouter à app.use()
require('./index');

require('events').EventEmitter.defaultMaxListeners = 500;

// Pages fixes
app.get('/pair', (req, res) => {
    res.sendFile(path.join(__path, 'pair.html'));
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__path, 'main.html'));
});

// Middleware BodyParser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(PORT, () => {
    console.log(`
Don't Forget To Give Star 🌟🌟🌟🌟

Server running on http://localhost:${PORT}
`);
});

module.exports = app;
