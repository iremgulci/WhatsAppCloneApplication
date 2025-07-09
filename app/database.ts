// database.ts  
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('whatsappclone.db');

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
  db.execSync(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      chatId INTEGER,
      text TEXT,
      isMine INTEGER,
      time TEXT
    );
  `);
};

export const addMessage = (chatId: number, text: string, isMine: boolean, time: string) => {
  db.runSync(
    'INSERT INTO messages (chatId, text, isMine, time) VALUES (?, ?, ?, ?);',
    [chatId, text, isMine ? 1 : 0, time]
  );
};

export const getMessagesForChat = (chatId: number): any[] => {
  return db.getAllSync('SELECT * FROM messages WHERE chatId = ? ORDER BY id ASC;', [chatId]);
};

export const clearMessages = () => {
  db.runSync('DELETE FROM messages;');
};

export default db;
