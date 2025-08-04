// database.ts  
import * as SQLite from 'expo-sqlite';


const db = SQLite.openDatabaseSync('whatsappclone.db');

// Kullanıcı tablosu oluştur
export const setupUserTable = () => {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE,
      password TEXT
    );
  `);
};

// Kullanıcı kaydı
export const registerUser = (email: string, password: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    try {
      db.runSync('INSERT INTO users (email, password) VALUES (?, ?);', [email, password]);
      const users = db.getAllSync('SELECT * FROM users WHERE email = ?;', [email]);
      resolve(users[0] || null);
    } catch (error) {
      resolve(null); // Email zaten varsa hata döndür
    }
  });
};

// Kullanıcı girişi
export const loginUser = (email: string, password: string): Promise<any> => {
  return new Promise((resolve) => {
    const users = db.getAllSync('SELECT * FROM users WHERE email = ? AND password = ?;', [email, password]);
    resolve(users[0] || null);
  });
};

// Tabloyu oluştur (ilk açılışta)
export const setupDatabase = () => {
    db.execSync(`
      CREATE TABLE IF NOT EXISTS chats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
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
  };

// Chat ekleme
export const addChat = (name: string, lastMessage: string, time: string, avatar: string) => {
  db.runSync(
    'INSERT INTO chats (name, lastMessage, time, avatar) VALUES (?, ?, ?, ?);',
    [name, lastMessage, time, avatar]
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
        name TEXT,
        lastMessage TEXT,
        time TEXT,
        avatar TEXT
      );
    `);
};

// Chatleri okuma
export const getChats = (): any[] => {
  return db.getAllSync('SELECT * FROM chats;');
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
      time TEXT
    );
  `);
  
  // Eksik sütunları kontrol et ve ekle
  try {
    // type sütunu ekle
    db.execSync('ALTER TABLE messages ADD COLUMN type TEXT DEFAULT "text";');
    console.log('Added type column to messages table');
  } catch (error) {
    console.log('type column already exists or error:', error);
  }
  
  try {
    // audioUri sütunu ekle
    db.execSync('ALTER TABLE messages ADD COLUMN audioUri TEXT;');
    console.log('Added audioUri column to messages table');
  } catch (error) {
    console.log('audioUri column already exists or error:', error);
  }
  
  try {
    // audioDuration sütunu ekle
    db.execSync('ALTER TABLE messages ADD COLUMN audioDuration INTEGER;');
    console.log('Added audioDuration column to messages table');
  } catch (error) {
    console.log('audioDuration column already exists or error:', error);
  }
  
  try {
    // fileUri sütunu ekle
    db.execSync('ALTER TABLE messages ADD COLUMN fileUri TEXT;');
    console.log('Added fileUri column to messages table');
  } catch (error) {
    console.log('fileUri column already exists or error:', error);
  }
  
  try {
    // fileName sütunu ekle
    db.execSync('ALTER TABLE messages ADD COLUMN fileName TEXT;');
    console.log('Added fileName column to messages table');
  } catch (error) {
    console.log('fileName column already exists or error:', error);
  }
  
  try {
    // fileSize sütunu ekle
    db.execSync('ALTER TABLE messages ADD COLUMN fileSize INTEGER;');
    console.log('Added fileSize column to messages table');
  } catch (error) {
    console.log('fileSize column already exists or error:', error);
  }
  
  console.log('Messages table schema updated successfully');
};

export const addMessage = (chatId: number, text: string, isMine: boolean, time: string, type: string = 'text', audioUri?: string, audioDuration?: number, fileUri?: string, fileName?: string, fileSize?: number) => {
  try {
    console.log('Adding message to database:', { chatId, text, isMine, time, type, audioUri, audioDuration, fileUri, fileName, fileSize });
    
    db.runSync(
      'INSERT INTO messages (chatId, text, isMine, time, type, audioUri, audioDuration, fileUri, fileName, fileSize) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);',
      [chatId, text, isMine ? 1 : 0, time, type, audioUri || null, audioDuration || null, fileUri || null, fileName || null, fileSize || null]
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
