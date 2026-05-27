const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'store.db');
const db = new sqlite3.Database(dbPath);

// Инициализация таблиц и заполнение товарами (seed)
db.serialize(() => {
  // Таблица пользователей
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT
    )
  `);

  // Таблица товаров
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      image TEXT
    )
  `);

// Создание администратора по умолчанию
db.get("SELECT * FROM users WHERE email = 'admin@admin.com'", (err, user) => {
  if (!user) {
    db.run(
      "INSERT INTO users (email, password, name) VALUES (?, ?, ?)",
      ['admin@admin.com', 'admin123', 'Администратор'],
      (err) => {
        if (!err) console.log('Администратор создан: admin@admin.com / admin123');
      }
    );
  }
});

  // Проверяем, есть ли товары. Если нет – добавляем 12 товаров электроники
  db.get("SELECT COUNT(*) as count FROM products", (err, row) => {
    if (err) {
      console.error(err.message);
    } else if (row.count === 0) {
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
      products.forEach(p => {
        stmt.run(p.name, p.price, p.image);
      });
      stmt.finalize();
      console.log("База данных заполнена 12 товарами.");
    } else {
      console.log(`В базе уже есть ${row.count} товаров.`);
    }
  });
});

module.exports = db;