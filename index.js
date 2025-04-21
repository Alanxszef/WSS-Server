const WebSocket = require('ws');
const express = require('express');

const PORT = process.env.PORT || 10000;
const app = express();
const server = require('http').createServer(app);
const wss = new WebSocket.Server({ server });

let clients = new Set();
let players = {}; // Przechowuje informacje o graczach

wss.on('connection', (ws) => {
  const playerId = Date.now();  // Unikalny identyfikator gracza na podstawie timestampu
  players[playerId] = { x: 100, y: 100, points: 0 }; // Ustawienia początkowe gracza

  clients.add(ws);
  console.log(`🟢 Nowe połączenie. Gracz ID: ${playerId}`);

  // Wysyłanie stanu gry do nowego gracza
  ws.send(JSON.stringify({ type: 'init', players: players }));

  ws.on('message', (msg) => {
    const message = JSON.parse(msg);

    // Zaktualizowanie stanu gracza
    if (message.type === 'move') {
      const player = players[message.playerId];
      if (player) {
        player.x = message.x;
        player.y = message.y;

        // Jeżeli gracz zbierze punkt
        if (Math.abs(player.x - 500) < 50 && Math.abs(player.y - 500) < 50) {
          player.points += 1;
        }
      }

      // Wysyłanie zaktualizowanego stanu gry do wszystkich graczy
      broadcastState();
    }
  });

  ws.on('close', () => {
    delete players[playerId];
    clients.delete(ws);
    console.log(`🔴 Gracz ID: ${playerId} rozłączony`);
    broadcastState(); // Po rozłączeniu gracza zaktualizuj stan gry
  });
});

// Funkcja do rozsyłania stanu gry do wszystkich graczy
function broadcastState() {
  const state = { type: 'update', players: players };
  const message = JSON.stringify(state);

  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

app.get('/', (req, res) => {
  res.send('✅ Serwer WebSocket działa!');
});

server.listen(PORT, () => {
  console.log(`🚀 Serwer działa na porcie ${PORT}`);
});
