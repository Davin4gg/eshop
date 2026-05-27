const express = require('express');
const cors = require('cors');
const path = require('path');
const dbModule = require('./database');   // ← правильный импорт

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Раздача статики фронтенда (если нужно)
app.use(express.static(path.join(__dirname, '../frontend/build')));

// API endpoints
app.get('/api/products', (req, res) => {
  dbModule.all("SELECT * FROM products", [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

app.post('/api/register', (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email и пароль обязательны" });
  }
  dbModule.run(
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
        res.json({ id: this.lastID, name: name || email.split('@')[0], message: "Регистрация успешна" });
      }
    }
  );
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email и пароль обязательны" });
  }
  dbModule.get(
    "SELECT id, name, email FROM users WHERE email = ? AND password = ?",
    [email, password],
    (err, user) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else if (user) {
        res.json(user);
      } else {
        res.status(401).json({ error: "Неверный email или пароль" });
      }
    }
  );
});

// Для всех остальных запросов отдаём index.html (клиентский роутинг)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

// **Запускаем сервер только после инициализации БД**
dbModule.initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
  });
}).catch(err => {
  console.error('Ошибка инициализации базы данных:', err);
  process.exit(1);
});