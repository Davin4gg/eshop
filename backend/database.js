const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'store.db');
let db;

// Функция инициализации базы данных
async function initDatabase() {
  // Загружаем SQL.js
  const SQL = await initSqlJs();
  
  // Если файл базы существует — загружаем его
  let buffer = null;
  if (fs.existsSync(dbPath)) {
    buffer = fs.readFileSync(dbPath);
  }
  
  // Создаём базу в памяти или из файла
  db = new SQL.Database(buffer);
  
  // Создаём таблицы (если не существуют)
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT
    )
  `);
  
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      image TEXT
    )
  `);
  
  // Заполняем товарами, если таблица пуста
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
  
  // Автосохранение каждые 5 секунд (опционально)
  setInterval(() => saveDatabase(), 5000);
  
  console.log("База данных SQL.js инициализирована");
  return db;
}

// Функция сохранения в файл
function saveDatabase() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  }
}

// Обёртки для совместимости со старым кодом (callback-стиль)
function dbGet(sql, params, callback) {
  try {
    const stmt = db.prepare(sql);
    const result = stmt.getAsObject(params);
    stmt.free();
    callback(null, result);
  } catch (err) {
    callback(err, null);
  }
}

function dbAll(sql, params, callback) {
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
}

function dbRun(sql, params, callback) {
  try {
    const stmt = db.prepare(sql);
    stmt.run(params);
    stmt.free();
    callback(null, { lastID: db.exec("SELECT last_insert_rowid()")[0].values[0][0] });
  } catch (err) {
    callback(err, null);
  }
}

// Экспортируем объект, похожий на sqlite3 API
module.exports = {
  initDatabase,
  get: dbGet,
  all: dbAll,
  run: dbRun,
  saveDatabase
};