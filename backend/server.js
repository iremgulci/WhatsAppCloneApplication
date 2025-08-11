
// WebSocket kütüphanesini dahil et
const WebSocket = require('ws');

// 8080 portunda WebSocket sunucusu oluştur
const wss = new WebSocket.Server({ port: 8080 });

// Bağlı olan kullanıcıları tutan nesne
let clients = {};

wss.on('connection', function connection(ws) {

  // Her yeni bağlantı için çalışır
  ws.on('message', function incoming(message) {
    // Sunucuya gelen mesajı işle
    try {
      // Mesajı JSON formatına çevir
      const data = JSON.parse(message);

      // Kullanıcı giriş yaparsa, bağlantıyı clients listesine ekle
      if (data.type === 'login') {
        clients[data.userId] = ws;
        console.log(`User ${data.userId} connected.`);
      }

      // Kullanıcı mesaj gönderirse, diğer tüm kullanıcılara ilet
      if (data.type === 'message') {
        // Tüm bağlı kullanıcılara mesajı gönder (gönderen hariç)
        for (const clientUserId in clients) {
          if (clientUserId !== data.from) {
            const client = clients[clientUserId];
            if (client && client.readyState === 1) { // WebSocket.OPEN
              client.send(JSON.stringify({ from: data.from, message: data.message }));
            }
          }
        }
      }
    } catch (err) {
      // Mesaj formatı hatalıysa hata mesajı yazdır
      console.error('Invalid message:', message);
    }
  });


  // Kullanıcı bağlantısı kapatılırsa çalışır
  ws.on('close', () => {
    // clients listesinden bağlantısı kapanan kullanıcıyı sil
    for (const userId in clients) {
      if (clients[userId] === ws) {
        delete clients[userId];
        console.log(`User ${userId} disconnected.`);
      }
    }
  });
});


// Sunucu başlatıldığında bilgi mesajı yazdır
console.log('WebSocket server running on ws://localhost:8080');
