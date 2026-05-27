import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Header({ user, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  const isAdmin = user && user.email === 'admin@admin.com';

  return (
    <header className="header">
      <div className="logo">📱 ElectroStore</div>
      <div>
        <Link to="/">Главная</Link>
        <Link to="/cart">Корзина</Link>
        {isAdmin && <Link to="/admin" className="admin-link">👑 Админ-панель</Link>}
        {user ? (
          <>
            <span style={{ marginLeft: '20px' }}>Привет, {user.name}!</span>
            <button onClick={handleLogout} style={{ marginLeft: '12px', background: '#d32f2f' }}>Выйти</button>
          </>
        ) : (
          <>
            <Link to="/login">Войти</Link>
            <Link to="/register">Регистрация</Link>
          </>
        )}
      </div>
    </header>
  );
}

export default Header;