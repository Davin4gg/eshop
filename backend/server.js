const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Обслуживание статических файлов React (после сборки, но для разработки используем прокси)
// В режиме разработки фронтенд запрашивает API через proxy (см. frontend/package.json)
// Дополнительно отдаём статику, если нужно
app.use(express.static(path.join(__dirname, '../frontend/build')));

// API endpoints

// получить все товары
app.get('/api/products', (req, res) => {
  db.all("SELECT * FROM products", (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

// регистрация
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
        res.json({ id: this.lastID, name: name || email.split('@')[0], message: "Регистрация успешна" });
      }
    }
  );
});

// авторизация
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email и пароль обязательны" });
  }
  db.get(
    "SELECT id, name, email FROM users WHERE email = ? AND password = ?",
    [email, password],
    (err, user) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else if (user) {
        res.json({ id: user.id, name: user.name, email: user.email });
      } else {
        res.status(401).json({ error: "Неверный email или пароль" });
      }
    }
  );
});

// Для всех остальных запросов отдаём index.html (для клиентского роутинга)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

//АДМИН-ПАНЕЛЬ (API)

// получить всех пользователей
app.get('/api/admin/users', (req, res) => {
  db.all("SELECT id, email, name FROM users", (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

// удалить пользователя
app.delete('/api/admin/users/:id', (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM users WHERE id = ?", [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (this.changes === 0) {
      res.status(404).json({ error: "Пользователь не найден" });
    } else {
      res.json({ message: "Пользователь удалён" });
    }
  });
});

// добавить товар
app.post('/api/admin/products', (req, res) => {
  const { name, price, image } = req.body;
  if (!name || !price) {
    return res.status(400).json({ error: "Название и цена обязательны" });
  }
  db.run(
    "INSERT INTO products (name, price, image) VALUES (?, ?, ?)",
    [name, price, image || '📦'],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ id: this.lastID, message: "Товар добавлен" });
      }
    }
  );
});

// обновить товар
app.put('/api/admin/products/:id', (req, res) => {
  const { id } = req.params;
  const { name, price, image } = req.body;
  db.run(
    "UPDATE products SET name = ?, price = ?, image = ? WHERE id = ?",
    [name, price, image, id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else if (this.changes === 0) {
        res.status(404).json({ error: "Товар не найден" });
      } else {
        res.json({ message: "Товар обновлён" });
      }
    }
  );
});

// удалить товар
app.delete('/api/admin/products/:id', (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM products WHERE id = ?", [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (this.changes === 0) {
      res.status(404).json({ error: "Товар не найден" });
    } else {
      res.json({ message: "Товар удалён" });
    }
  });
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});