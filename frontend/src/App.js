import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import AdminPage from './components/AdminPage';
import AdminGuard from './components/AdminGuard';
import ProductList from './components/ProductList';
import Cart from './components/Cart';
import Login from './components/Login';
import Register from './components/Register';
import Footer from './components/Footer';
import ProductDetail from './components/ProductDetail';
import { CartProvider } from './contexts/CartContext';
import './App.css';

function App() {
  const [user, setUser] = useState(null);

  // При загрузке проверяем localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <CartProvider>
      <div className="app">
        <Header user={user} onLogout={handleLogout} />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<ProductList />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/login" element={<Login onLogin={handleLogin} />} />
              <Route path="/register" element={<Register onLogin={handleLogin} />} />
              <Route path="*" element={<Navigate to="/" />} />
              <Route path="/admin" element={
                <AdminGuard>
                <AdminPage />
                </AdminGuard>
              } />
          </Routes>
        </main>
        <Footer />
      </div>
    </CartProvider>
  );
}

export default App;