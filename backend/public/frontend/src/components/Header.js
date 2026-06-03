import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Header({ user, onLogout }) {
  const navigate = useNavigate();
  const isAdmin = user && user.role === 'admin';

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  return (
    <header className="header">
      <div className="logo">
      <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
        📱 ElectroStore
      </Link>
      </div>
      <div>
        <Link to="/">Главная</Link>
        <Link to="/cart">Корзина</Link>
        {user ? (
          <>
            {isAdmin && <Link to="/admin">Админка</Link>}
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