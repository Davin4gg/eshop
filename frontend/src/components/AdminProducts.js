import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', price: '', image: '' });

  const admin = JSON.parse(localStorage.getItem('user'));
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${admin.email}:${admin.password}`
  };

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(console.error);
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить товар?')) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE', headers });
      if (res.ok) {
        setProducts(prev => prev.filter(p => p.id !== id));
      } else {
        const err = await res.json();
        alert(err.error || 'Ошибка при удалении');
      }
    } catch (err) {
      alert('Ошибка соединения');
    }
  };

  const startEdit = (product) => {
    setEditing(product.id);
    setForm({ name: product.name, price: product.price, image: product.image });
  };

  const handleSave = async () => {
    const { name, price, image } = form;
    if (!name || !price) {
      alert('Название и цена обязательны');
      return;
    }
    const url = editing ? `/api/products/${editing}` : '/api/products';
    const method = editing ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify({ name, price: parseFloat(price), image })
      });
      if (res.ok) {
        const updatedProduct = await res.json();
        if (editing) {
          setProducts(prev => prev.map(p => p.id === editing ? updatedProduct : p));
        } else {
          setProducts(prev => [...prev, updatedProduct]);
        }
        setEditing(null);
        setForm({ name: '', price: '', image: '' });
      } else {
        const err = await res.json();
        alert(err.error || 'Ошибка сохранения');
      }
    } catch (err) {
      alert('Ошибка соединения');
    }
  };

  const cancel = () => {
    setEditing(null);
    setForm({ name: '', price: '', image: '' });
  };

  return (
    <div className="admin-panel">
      <h2>Управление товарами</h2>

      <div className="admin-form">
        <h3>{editing ? 'Редактировать товар' : 'Добавить товар'}</h3>
        <div className="form-group">
          <label>Название</label>
          <input
            type="text"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Цена</label>
          <input
            type="number"
            value={form.price}
            onChange={e => setForm({ ...form, price: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Изображение (эмодзи или URL)</label>
          <input
            type="text"
            value={form.image}
            onChange={e => setForm({ ...form, image: e.target.value })}
          />
        </div>
        <div className="admin-form-buttons">
          <button onClick={handleSave}>{editing ? 'Сохранить' : 'Добавить'}</button>
          {editing && <button onClick={cancel} style={{ background: '#6c757d' }}>Отмена</button>}
        </div>
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Название</th>
            <th>Цена</th>
            <th>Изображение</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {products.map(p => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.name}</td>
              <td>{p.price.toLocaleString()} ₽</td>
              <td>{p.image}</td>
              <td>
                <button onClick={() => startEdit(p)}>✏️</button>
                <button onClick={() => handleDelete(p.id)} style={{ background: '#d32f2f', marginLeft: '5px' }}>🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminProducts;