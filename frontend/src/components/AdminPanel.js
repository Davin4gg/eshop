import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function AdminPanel() {
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('products');
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    image: ''
  });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  // Проверка прав администратора при загрузке
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.email !== 'admin@admin.com') {
      setMessage('Доступ запрещён. Требуются права администратора.');
      setTimeout(() => navigate('/'), 2000);
    } else {
      loadProducts();
      loadUsers();
    }
  }, [navigate]);

  const loadProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error('Ошибка загрузки товаров:', err);
    }
  };

  const loadUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error('Ошибка загрузки пользователей:', err);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          price: parseFloat(formData.price),
          image: formData.image || '📦'
        })
      });
      if (res.ok) {
        setMessage('Товар добавлен успешно!');
        loadProducts();
        setFormData({ name: '', price: '', image: '' });
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Ошибка при добавлении товара');
      }
    } catch (err) {
      console.error('Ошибка:', err);
    }
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/admin/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          price: parseFloat(formData.price),
          image: formData.image
        })
      });
      if (res.ok) {
        setMessage('Товар обновлён успешно!');
        loadProducts();
        setEditingProduct(null);
        setFormData({ name: '', price: '', image: '' });
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Ошибка при обновлении товара');
      }
    } catch (err) {
      console.error('Ошибка:', err);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Вы уверены, что хотите удалить этот товар?')) {
      try {
        const res = await fetch(`/api/admin/products/${id}`, {
          method: 'DELETE'
        });
        if (res.ok) {
          setMessage('Товар удалён успешно!');
          loadProducts();
          setTimeout(() => setMessage(''), 3000);
        } else {
          setMessage('Ошибка при удалении товара');
        }
      } catch (err) {
        console.error('Ошибка:', err);
      }
    }
  };

  const startEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price,
      image: product.image || ''
    });
  };

  const cancelEdit = () => {
    setEditingProduct(null);
    setFormData({ name: '', price: '', image: '' });
  };

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1>👑 Админ-панель</h1>
        <button onClick={() => navigate('/')} className="back-to-store-btn">
          ← На сайт
        </button>
      </div>

      {message && <div className="admin-message">{message}</div>}

      <div className="admin-tabs">
        <button
          className={activeTab === 'products' ? 'tab-active' : 'tab'}
          onClick={() => setActiveTab('products')}
        >
          📦 Управление товарами
        </button>
      </div>

      {activeTab === 'products' && (
        <div className="admin-products">
          <div className="product-form-section">
            <h2>{editingProduct ? '✏️ Редактировать товар' : '➕ Добавить новый товар'}</h2>
            <form onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct} className="admin-form">
              <div className="form-group">
                <label>Название товара:</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Цена (₽):</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Изображение (emoji или URL):</label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="📱 или https://example.com/image.jpg"
                />
              </div>
              <div className="form-buttons">
                <button type="submit" className="submit-btn">
                  {editingProduct ? 'Обновить' : 'Добавить'}
                </button>
                {editingProduct && (
                  <button type="button" onClick={cancelEdit} className="cancel-btn">
                    Отмена
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="products-list-section">
            <h2>📋 Список товаров</h2>
            <div className="admin-products-grid">
              {products.map(product => (
                <div key={product.id} className="admin-product-card">
                  <div className="admin-product-image">
                    {product.image && (product.image.startsWith('http') || product.image.startsWith('/images/')) ? (
                      <img src={product.image} alt={product.name} className="admin-img" />
                    ) : (
                      <div className="admin-emoji">{product.image || '📦'}</div>
                    )}
                  </div>
                  <div className="admin-product-info">
                    <h3>{product.name}</h3>
                    <p className="admin-product-price">{product.price.toLocaleString()} ₽</p>
                    <p className="admin-product-id">ID: {product.id}</p>
                  </div>
                  <div className="admin-product-actions">
                    <button onClick={() => startEdit(product)} className="edit-btn">
                      ✏️ Редактировать
                    </button>
                    <button onClick={() => handleDeleteProduct(product.id)} className="delete-btn">
                      🗑️ Удалить
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="admin-users">
          <h2>👥 Список пользователей</h2>
          <div className="users-table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Email</th>
                  <th>Имя</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.email}</td>
                    <td>{user.name || '—'}</td>
                    <td>
                      <button
                        onClick={() => {
                          if (window.confirm(`Удалить пользователя ${user.email}?`)) {
                            fetch(`/api/admin/users/${user.id}`, { method: 'DELETE' })
                              .then(() => loadUsers());
                          }
                        }}
                        className="delete-user-btn"
                      >
                        Удалить
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPanel;