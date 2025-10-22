const express = require('express');
const http = require('http');
require('dotenv').config()
const cors = require('cors')
const WebSocket = require('ws');
const connectDB = require('./config/db');
const gameRoutesFactory = require('./routes/gameRoutes');
const moveRoutesFactory = require('./routes/moveRoutes');

const MONGO_URI = process.env.MONGODB_URI
console.log(MONGO_URI)
const PORT = process.env.PORT || 3000;

connectDB(MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

const app = express();
app.use(cors())
app.use(express.json());


const server = http.createServer(app);
const wss = new WebSocket.Server({ server, path: '/ws' });

const clients = new Set();

wss.on('connection', (ws) => {
  clients.add(ws);
  ws.on('close', () => clients.delete(ws));
});

const broadcast = (data) => {
  const payload = JSON.stringify(data);
  for (const ws of clients) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(payload);
    }
  }
};

app.use('/api/games', gameRoutesFactory(broadcast));
app.use('/api/moves', moveRoutesFactory(broadcast));

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});