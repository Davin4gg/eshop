const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend/build')));

// API endpoints
app.get('/api/products', (req, res) => {
  db.all("SELECT * FROM products", [], (err, rows) => {
    if (err) res.status(500).json({ error: err.message });
    else res.json(rows);
  });
});

app.post('/api/register', (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email и пароль обязательны" });
  }
  db.run(
    "INSERT INTO users (email, password, name) VALUES (?, ?, ?)",
    [email, password, name || email.split('@')[0]],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE')) {
          res.status(400).json({ error: "Пользователь с таким email уже существует" });
        } else {
          res.status(500).json({ error: err.message });
        }
      } else {
        res.json({ id: this.lastID, name: name || email.split('@')[0] });
      }
    }
  );
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email и пароль обязательны" });
  }
  db.get(
    "SELECT id, name, email FROM users WHERE email = ? AND password = ?",
    [email, password],
    (err, user) => {
      if (err) res.status(500).json({ error: err.message });
      else if (user) res.json(user);
      else res.status(401).json({ error: "Неверный email или пароль" });
    }
  );
});

// Все остальные маршруты отдаём React (если фронтенд собран)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

// Запускаем сервер только после инициализации БД
db.initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Сервер запущен на порту ${PORT}`);
  });
}).catch(err => {
  console.error('❌ Ошибка инициализации БД:', err);
  process.exit(1);
});