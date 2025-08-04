const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

let clients = {};

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
    try {
      const data = JSON.parse(message);
      if (data.type === 'login') {
        clients[data.userId] = ws;
        console.log(`User ${data.userId} connected.`);
      }
      if (data.type === 'message') {
        const to = clients[data.to];
        if (to) {
          to.send(JSON.stringify({ from: data.from, message: data.message }));
        }
      }
    } catch (err) {
      console.error('Invalid message:', message);
    }
  });

  ws.on('close', () => {
    for (const userId in clients) {
      if (clients[userId] === ws) {
        delete clients[userId];
        console.log(`User ${userId} disconnected.`);
      }
    }
  });
});

console.log('WebSocket server running on ws://localhost:8080');
