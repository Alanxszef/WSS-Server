const WebSocket = require('ws');
const express = require('express');

const PORT = process.env.PORT || 10000;
const app = express();
const server = require('http').createServer(app);
const wss = new WebSocket.Server({ server });

let clients = new Set();

wss.on('connection', (ws) => {
  clients.add(ws);
  console.log('🟢 Nowe połączenie');

  ws.on('message', (msg) => {
    console.log('📨 Otrzymano:', msg.toString());

    for (const client of clients) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(msg);
      }
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
    console.log('🔴 Rozłączono');
  });
});

app.get('/', (req, res) => {
  res.send('✅ Serwer WebSocket działa!');
});

server.listen(PORT, () => {
  console.log(`🚀 Serwer działa na porcie ${PORT}`);
});
