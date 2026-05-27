const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'store.db');
const db = new Database(dbPath);

// Создание таблиц
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT
  );
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    image TEXT
  );
`);

// Заполнение товарами (если пусто)
const row = db.prepare("SELECT COUNT(*) as count FROM products").get();
if (row.count === 0) {
  const products = [
    { name: "Смартфон Galaxy S23", price: 69999, image: "📱" },
    { name: "Ноутбук MacBook Air", price: 99999, image: "💻" },
    { name: "Наушники Sony WH-1000XM5", price: 29999, image: "🎧" },
    { name: "Планшет iPad Air", price: 54999, image: "📟" },
    { name: "Смарт-часы Apple Watch", price: 35999, image: "⌚" },
    { name: "Клавиатура Mechanical RGB", price: 4999, image: "⌨️" },
    { name: "Мышь Logitech MX Master", price: 7999, image: "🖱️" },
    { name: "Монитор 27″ 4K", price: 27999, image: "🖥️" },
    { name: "Внешний SSD 1TB", price: 8999, image: "💾" },
    { name: "Роутер Wi-Fi 6", price: 5999, image: "📡" },
    { name: "Зарядная станция MagSafe", price: 3999, image: "🔋" },
    { name: "Игровая консоль Switch", price: 24999, image: "🎮" }
  ];
  const insert = db.prepare("INSERT INTO products (name, price, image) VALUES (?, ?, ?)");
  for (const p of products) {
    insert.run(p.name, p.price, p.image);
  }
  console.log("База заполнена тестовыми товарами");
}

// Экспортируем методы для совместимости с callback-стилем (для server.js)
module.exports = {
  get: (sql, params, callback) => {
    try {
      const stmt = db.prepare(sql);
      const result = stmt.get(params);
      callback(null, result);
    } catch (err) {
      callback(err, null);
    }
  },
  all: (sql, params, callback) => {
    try {
      const stmt = db.prepare(sql);
      const result = stmt.all(params);
      callback(null, result);
    } catch (err) {
      callback(err, null);
    }
  },
  run: (sql, params, callback) => {
    try {
      const stmt = db.prepare(sql);
      const info = stmt.run(params);
      callback(null, { lastID: info.lastInsertRowid });
    } catch (err) {
      callback(err, null);
    }
  },
  // fake initDatabase – сразу резолвим, потому что БД уже готова
  initDatabase: async () => {
    return db;
  }
};