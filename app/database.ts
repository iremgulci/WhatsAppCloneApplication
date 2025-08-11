// database.ts  
import * as SQLite from 'expo-sqlite';


const db = SQLite.openDatabaseSync('whatsappclone.db');


// Tüm kullanıcıları sil
export const clearUsers = () => {
  db.runSync('DELETE FROM users;');
};
// Kullanıcı tablosu oluştur
// Kullanıcı tablosunu tamamen sıfırla (DROP ve CREATE)
export const dropAndRecreateUserTable = () => {
  db.runSync('DROP TABLE IF EXISTS users;');
  db.runSync(`
    CREATE TABLE IF NOT EXISTS users (
      userId INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      name TEXT,
      password TEXT
    );
  `);
};
export const setupUserTable = () => {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      name TEXT,
      password TEXT
    );
  `);
};

// Kullanıcı kaydı
export const registerUser = (username: string, name: string, password: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    try {
      db.runSync('INSERT INTO users (username, name, password) VALUES (?, ?, ?);', [username, name, password]);
      const users = db.getAllSync('SELECT * FROM users WHERE username = ?;', [username]);
      resolve(users[0] || null);
    } catch (error) {
      resolve(null); // Username zaten varsa hata döndür
    }
  });
};

// Kullanıcı girişi
export const loginUser = (username: string, password: string): Promise<any> => {
  return new Promise((resolve) => {
    const users = db.getAllSync('SELECT * FROM users WHERE username = ? AND password = ?;', [username, password]);
    resolve(users[0] || null);
  });
};

// Tabloyu oluştur (ilk açılışta)
export const setupDatabase = () => {
    db.execSync(`
      CREATE TABLE IF NOT EXISTS chats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER,
        name TEXT,
        lastMessage TEXT,
        time TEXT,
        avatar TEXT
      );
      CREATE TABLE IF NOT EXISTS calls (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        time TEXT,
        type TEXT
      );
      CREATE TABLE IF NOT EXISTS communities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        description TEXT,
        memberCount INTEGER,
        avatar TEXT
      );
      CREATE TABLE IF NOT EXISTS updates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        status TEXT,
        time TEXT,
        avatar TEXT
      );
    `);
    setupMessagesTable();
  };

// Chat ekleme
export const addChat = (name: string, lastMessage: string, time: string, avatar: string, userId: number) => {
  db.runSync(
    'INSERT INTO chats (name, lastMessage, time, avatar, userId) VALUES (?, ?, ?, ?, ?);',
    [name, lastMessage, time, avatar, userId]
  );
};

export const clearChats = () => {
    db.runSync('DELETE FROM chats;');
  };

export const dropAndRecreateChats = () => {
    db.runSync('DROP TABLE IF EXISTS chats;');
    db.runSync(`
      CREATE TABLE IF NOT EXISTS chats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER,
        name TEXT,
        lastMessage TEXT,
        time TEXT,
        avatar TEXT
      );
    `);
};

// Chatleri okuma
export const getChats = (userId?: number): any[] => {
  if (userId === undefined) {
    return db.getAllSync('SELECT * FROM chats;');
  }
  return db.getAllSync('SELECT * FROM chats WHERE userId = ?;', [userId]);
};

// Call ekleme
export const addCall = (name: string, time: string, type: string) => {
  db.runSync(
    'INSERT INTO calls (name, time, type) VALUES (?, ?, ?);',
    [name, time, type]
  );
};

// Call'ları okuma
export const getCalls = (): any[] => {
  return db.getAllSync('SELECT * FROM calls;');
};

// Community ekleme
export const addCommunity = (name: string, description: string, memberCount: number, avatar: string) => {
  db.runSync(
    'INSERT INTO communities (name, description, memberCount, avatar) VALUES (?, ?, ?, ?);',
    [name, description, memberCount, avatar]
  );
};

// Community'leri okuma
export const getCommunities = (): any[] => {
  return db.getAllSync('SELECT * FROM communities;');
};

export const clearCommunities = () => {
  db.runSync('DELETE FROM communities;');
};

export const dropAndRecreateCommunities = () => {
  db.runSync('DROP TABLE IF EXISTS communities;');
  db.runSync(`
    CREATE TABLE IF NOT EXISTS communities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      description TEXT,
      memberCount INTEGER,
      avatar TEXT
    );
  `);
};

// Update ekleme
export const addUpdate = (name: string, status: string, time: string, avatar: string) => {
  db.runSync(
    'INSERT INTO updates (name, status, time, avatar) VALUES (?, ?, ?, ?);',
    [name, status, time, avatar]
  );
};

// Update'leri okuma
export const getUpdates = (): any[] => {
  return db.getAllSync('SELECT * FROM updates;');
};

// Messages tablosu ve fonksiyonları
export const setupMessagesTable = () => {
  // Önce tabloyu oluştur (eğer yoksa)
  db.execSync(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      chatId INTEGER,
      text TEXT,
      isMine INTEGER,
      time TEXT,
      type TEXT DEFAULT 'text',
      audioUri TEXT,
      audioDuration INTEGER,
      fileUri TEXT,
      fileName TEXT,
      fileSize INTEGER,
      senderId TEXT,
      receiverId TEXT
    );
  `);
}

export const dropAndRecreateMessages = () => {
  db.runSync('DROP TABLE IF EXISTS messages;');
  db.runSync(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      chatId INTEGER,
      text TEXT,
      isMine INTEGER,
      time TEXT,
      type TEXT DEFAULT 'text',
      audioUri TEXT,
      audioDuration INTEGER,
      fileUri TEXT,
      fileName TEXT,
      fileSize INTEGER,
      senderId TEXT,
      receiverId TEXT
    );
  `);
};


export const addMessage = (chatId: number, text: string, isMine: boolean, time: string, type: string = 'text', audioUri?: string, audioDuration?: number, fileUri?: string, fileName?: string, fileSize?: number, senderId?: string, receiverId?: string) => {
  try {
    console.log('Adding message to database:', { chatId, text, isMine, time, type, audioUri, audioDuration, fileUri, fileName, fileSize, senderId, receiverId });
    
    db.runSync(
      'INSERT INTO messages (chatId, text, isMine, time, type, audioUri, audioDuration, fileUri, fileName, fileSize, senderId, receiverId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);',
      [chatId, text, isMine ? 1 : 0, time, type, audioUri || null, audioDuration || null, fileUri || null, fileName || null, fileSize || null, senderId || null, receiverId || null]
    );
    
    console.log('Message added successfully to database');
  } catch (error) {
    console.log('Database error adding message:', error);
    throw error;
  }
};

export const getMessagesForChat = (chatId: number): any[] => {
  return db.getAllSync('SELECT * FROM messages WHERE chatId = ? ORDER BY id ASC;', [chatId]);
};

// Mesajları iki kullanıcı arasında (ve herkese açık olanları) getir
export const getMessagesBetweenUsers = (userAId: string, userBId: string): any[] => {
  return db.getAllSync(
    `SELECT * FROM messages 
     WHERE (senderId = ? AND receiverId = ?) 
        OR (senderId = ? AND receiverId = ?) 
        OR receiverId = 'all'
     ORDER BY id ASC;`,
    [userAId, userBId, userBId, userAId]
  );
};

// Belirli bir kullanıcının (numeric ownerId) tüm konuşma partnerleri için chat satırını oluşturur
export const ensureChatsForUser = (ownerUserIdNumeric: number, ownerUserIdString: string) => {
  console.log('ensureChatsForUser called with:', ownerUserIdNumeric, ownerUserIdString);
  
  // Kullanıcının taraf olduğu ve birebir olan (receiverId != 'all') tüm mesajları al
  const msgs = db.getAllSync(
    `SELECT senderId, receiverId FROM messages 
     WHERE (senderId = ? OR receiverId = ?) 
       AND senderId IS NOT NULL 
       AND receiverId IS NOT NULL 
       AND receiverId != 'all';`,
    [ownerUserIdString, ownerUserIdString]
  );
  
  console.log('Found messages for user:', msgs);

  // Karşı kullanıcıları ayıkla
  const otherUserIds = new Set<string>();
  for (const m of msgs as Array<{ senderId: string; receiverId: string }>) {
    const s: string = m.senderId;
    const r: string = m.receiverId;
    if (s === ownerUserIdString && r) otherUserIds.add(r);
    if (r === ownerUserIdString && s) otherUserIds.add(s);
  }
  
  console.log('Other user IDs found:', Array.from(otherUserIds));

  // Her bir karşı kullanıcı için chat satırı oluştur (yoksa)
  for (const otherUserIdStr of otherUserIds) {
    if (!otherUserIdStr.startsWith('user_')) continue;
    const numericPart = Number(otherUserIdStr.replace('user_', ''));
    if (!Number.isFinite(numericPart)) continue;

    // Kullanıcı bilgilerini getir - önce hangi sütun adının kullanıldığını kontrol et
    let users: any[];
    try {
      // Önce 'id' sütunu ile dene
      users = db.getAllSync('SELECT * FROM users WHERE id = ?;', [numericPart]) as Array<{ id: number; username: string; name: string; password: string }>;
    } catch (err) {
      // 'id' yoksa 'userId' ile dene
      try {
        users = db.getAllSync('SELECT * FROM users WHERE userId = ?;', [numericPart]) as Array<{ userId: number; username: string; name: string; password: string }>;
      } catch (err2) {
        console.log('Could not find user with either id or userId:', numericPart);
        continue;
      }
    }
    
    const otherUser = users[0];
    const otherName = otherUser?.name || otherUserIdStr;
    const otherAvatar = '';

    console.log('Processing other user:', otherUserIdStr, 'name:', otherName);

    // Bu kullanıcı için bu isimde chat var mı?
    const existing = db.getAllSync('SELECT * FROM chats WHERE userId = ? AND name = ? LIMIT 1;', [ownerUserIdNumeric, otherName]) as any[];
    if (!existing || existing.length === 0) {
      console.log('Creating new chat for:', otherName);
      addChat(otherName, 'Son Mesaj Yok', '', otherAvatar, ownerUserIdNumeric);
    } else {
      console.log('Chat already exists for:', otherName);
    }
  }
};

// Gelen mesaj için chat satırı oluştur (eğer yoksa)
export const ensureChatForIncomingMessage = (receiverUserIdNumeric: number, receiverUserIdString: string, senderUserIdString: string) => {
  console.log('ensureChatForIncomingMessage called with:', receiverUserIdNumeric, receiverUserIdString, senderUserIdString);
  
  if (!senderUserIdString.startsWith('user_')) {
    console.log('Sender ID does not start with user_:', senderUserIdString);
    return;
  }
  
  const numericPart = Number(senderUserIdString.replace('user_', ''));
  if (!Number.isFinite(numericPart)) {
    console.log('Invalid numeric part from sender ID:', senderUserIdString);
    return;
  }

  // Gönderen kullanıcı bilgilerini getir - önce hangi sütun adının kullanıldığını kontrol et
  let users: any[];
  try {
    // Önce 'id' sütunu ile dene
    users = db.getAllSync('SELECT * FROM users WHERE id = ?;', [numericPart]) as Array<{ id: number; username: string; name: string; password: string }>;
  } catch (err) {
    // 'id' yoksa 'userId' ile dene
    try {
      users = db.getAllSync('SELECT * FROM users WHERE userId = ?;', [numericPart]) as Array<{ userId: number; username: string; name: string; password: string }>;
    } catch (err2) {
      console.log('Could not find user with either id or userId:', numericPart);
      return;
    }
  }
  
  const senderUser = users[0];
  const senderName = senderUser?.name || senderUserIdString;
  const senderAvatar = '';

  console.log('Sender user found:', senderUser, 'name:', senderName);

  // Alıcı kullanıcı için bu isimde chat var mı?
  const existing = db.getAllSync('SELECT * FROM chats WHERE userId = ? AND name = ? LIMIT 1;', [receiverUserIdNumeric, senderName]) as any[];
  if (!existing || existing.length === 0) {
    console.log('Creating new chat for incoming message from:', senderName);
    addChat(senderName, 'Son Mesaj Yok', '', senderAvatar, receiverUserIdNumeric);
  } else {
    console.log('Chat already exists for incoming message from:', senderName);
  }
};

export const clearMessages = () => {
  db.runSync('DELETE FROM messages;');
};

export const deleteMessage = (messageId: number) => {
  db.runSync('DELETE FROM messages WHERE id = ?;', [messageId]);
};

export const deleteChat = (chatId: number) => {
  db.runSync('DELETE FROM chats WHERE id = ?;', [chatId]);
  db.runSync('DELETE FROM messages WHERE chatId = ?;', [chatId]);
};

export default db;
