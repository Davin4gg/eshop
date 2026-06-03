const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database');
const app = express();

app.use(cors());
app.use(express.json());

function isAdmin(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.split(' ')[1]; // ожидаем "Bearer email:password"
  if (!token) {
    return res.status(401).json({ error: 'Требуется авторизация' });
  }
  const [email, password] = token.split(':');
  db.get("SELECT * FROM users WHERE email = ? AND password = ? AND role = 'admin'", [email, password], (err, user) => {
    if (err || !user) {
      return res.status(403).json({ error: 'Доступ запрещён' });
    }
    req.admin = user;
    next();
  });
}

// API endpoints

// GET /api/products - получить все товары
app.get('/api/products', (req, res) => {
  db.all("SELECT * FROM products", (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

app.post('/api/products', isAdmin, (req, res) => {
  const { name, price, image } = req.body;
  if (!name || !price) {
    return res.status(400).json({ error: 'Название и цена обязательны' });
  }
  db.run("INSERT INTO products (name, price, image) VALUES (?, ?, ?)",
    [name, price, image || '📦'],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.status(201).json({ id: this.lastID, name, price, image: image || '📦' });
      }
    }
  );
});

app.put('/api/products/:id', isAdmin, (req, res) => {
  const { id } = req.params;
  const { name, price, image } = req.body;
  if (!name || !price) {
    return res.status(400).json({ error: 'Название и цена обязательны' });
  }
  db.run("UPDATE products SET name = ?, price = ?, image = ? WHERE id = ?",
    [name, price, image || '📦', id],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else if (this.changes === 0) {
        res.status(404).json({ error: 'Товар не найден' });
      } else {
        res.json({ id: parseInt(id), name, price, image: image || '📦' });
      }
    }
  );
});

app.delete('/api/products/:id', isAdmin, (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM products WHERE id = ?", [id], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (this.changes === 0) {
      res.status(404).json({ error: 'Товар не найден' });
    } else {
      res.json({ message: 'Товар удалён' });
    }
  });
});

// POST /api/register - регистрация
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

// POST /api/login - авторизация
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email и пароль обязательны" });
  }
  db.get(
    "SELECT id, name, email, role FROM users WHERE email = ? AND password = ?",
    [email, password],
    (err, user) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else if (user) {
        // Возвращаем role вместе с остальными данными
        res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
      } else {
        res.status(401).json({ error: "Неверный email или пароль" });
      }
    }
  );
});

app.post('/api/orders', (req, res) => {
  const { userId, cartItems, total } = req.body;
  if (!userId || !cartItems || cartItems.length === 0) {
    return res.status(400).json({ error: "Нет данных для оформления заказа" });
  }

  // Начинаем транзакцию (sqlite3 не поддерживает транзакции в колбэках легко, но можно последовательно)
  db.run("BEGIN TRANSACTION", (err) => {
    if (err) return res.status(500).json({ error: err.message });

    // Вставляем заказ
    db.run(
      "INSERT INTO orders (user_id, total, status) VALUES (?, ?, 'new')",
      [userId, total],
      function(err) {
        if (err) {
          db.run("ROLLBACK");
          return res.status(500).json({ error: err.message });
        }
        const orderId = this.lastID;
        let pending = cartItems.length;
        let errorOccurred = false;

        cartItems.forEach(item => {
          db.run(
            "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)",
            [orderId, item.id, item.quantity, item.price],
            (err) => {
              if (err && !errorOccurred) {
                errorOccurred = true;
                db.run("ROLLBACK");
                return res.status(500).json({ error: err.message });
              }
              pending--;
              if (pending === 0 && !errorOccurred) {
                db.run("COMMIT", (err) => {
                  if (err) {
                    db.run("ROLLBACK");
                    return res.status(500).json({ error: err.message });
                  }
                  res.json({ orderId, message: "Заказ успешно создан" });
                });
              }
            }
          );
        });
      }
    );
  });
});

app.get('/api/orders/:userId', (req, res) => {
  const userId = req.params.userId;
  db.all(
    `SELECT o.*, 
            json_group_array(json_object('product_id', oi.product_id, 'quantity', oi.quantity, 'price', oi.price)) as items
     FROM orders o
     LEFT JOIN order_items oi ON o.id = oi.order_id
     WHERE o.user_id = ?
     GROUP BY o.id
     ORDER BY o.created_at DESC`,
    [userId],
    (err, rows) => {
      if (err) res.status(500).json({ error: err.message });
      else res.json(rows);
    }
  );
});

// Для всех остальных запросов отдаём index.html (для клиентского роутинга)
app.use(express.static(path.join(__dirname, 'public', 'build')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'build', 'index.html'));
});

const PORT = process.env.PORT || 80;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});