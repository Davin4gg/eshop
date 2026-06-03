const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const dbDir = process.env.AMVERA ? '/data' : path.join(__dirname, '../data');
const dbPath = path.join(dbDir, 'eshop2.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) console.error(err.message);
    else console.log('База данных успешно подключена в /data');
});

if (!fs.existsSync(dbDir)){
    fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) console.error('Ошибка БД:', err.message);
    else console.log('База данных успешно подключена по пути: ' + dbPath);
});

// Инициализация таблиц и заполнение товарами (seed)
db.serialize(() => {
  // Таблица пользователей
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT
      role TEXT DEFAULT 'user'
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

  // Таблица заказов
db.run(`
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    total REAL NOT NULL,
    status TEXT DEFAULT 'new',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )
`);

// Таблица позиций заказа
db.run(`
  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    price REAL NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
  )
`);

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

db.get("SELECT id FROM users WHERE email = 'admin@electrostore.ru'", (err, row) => {
    if (!row) {
      db.run("INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)",
        ['admin@electrostore.ru', 'admin123', 'Администратор', 'admin'],
        (err) => {
          if (err) console.error('Ошибка создания админа:', err.message);
          else console.log('Администратор создан: admin@electrostore.ru / admin123');
        }
      );
    }
  });

module.exports = db;