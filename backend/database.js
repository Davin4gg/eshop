const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'store.db');
let db;

async function initDatabase() {
  const SQL = await initSqlJs();
  let buffer = null;
  if (fs.existsSync(dbPath)) {
    buffer = fs.readFileSync(dbPath);
  }
  db = new SQL.Database(buffer);

  // Создание таблиц
  db.run(`
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

  // Заполнение товарами, если таблица пуста
  const count = db.exec("SELECT COUNT(*) as count FROM products");
  if (count.length === 0 || count[0].values[0][0] === 0) {
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
    const stmt = db.prepare("INSERT INTO products (name, price, image) VALUES (?, ?, ?)");
    for (const p of products) {
      stmt.run([p.name, p.price, p.image]);
    }
    stmt.free();
  }

  // Автосохранение каждые 10 секунд
  setInterval(() => saveDatabase(), 10000);
  console.log("База данных SQL.js инициализирована");
  return db;
}

function saveDatabase() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  }
}

// Обёртки для совместимости с callback-стилем в server.js
module.exports = {
  initDatabase,
  get: (sql, params, callback) => {
    try {
      const stmt = db.prepare(sql);
      const result = stmt.getAsObject(params);
      stmt.free();
      callback(null, result);
    } catch (err) {
      callback(err, null);
    }
  },
  all: (sql, params, callback) => {
    try {
      const stmt = db.prepare(sql);
      const results = [];
      while (stmt.step()) {
        results.push(stmt.getAsObject());
      }
      stmt.free();
      callback(null, results);
    } catch (err) {
      callback(err, null);
    }
  },
  run: (sql, params, callback) => {
    try {
      const stmt = db.prepare(sql);
      const info = stmt.run(params);
      stmt.free();
      callback(null, { lastID: info.lastInsertRowid });
    } catch (err) {
      callback(err, null);
    }
  }
};