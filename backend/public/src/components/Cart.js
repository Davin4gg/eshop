import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../contexts/CartContext';

function Cart() {
  const { cart, removeFromCart, updateQuantity, getTotalPrice, clearCart } = useContext(CartContext);
  const navigate = useNavigate();

  const handleCheckout = async () => {
    // Получаем данные пользователя из localStorage
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      alert('Сначала войдите в систему');
      navigate('/login');
      return;
    }
    const user = JSON.parse(userStr);

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          cartItems: cart,
          total: getTotalPrice()
        })
      });
      if (response.ok) {
        alert('Заказ оформлен!');
        clearCart(); // очищаем корзину через контекст
        navigate('/');
      } else {
        const error = await response.json();
        alert('Ошибка оформления заказа: ' + (error.error || 'неизвестная ошибка'));
      }
    } catch (err) {
      alert('Ошибка сети: ' + err.message);
    }
  };

  if (cart.length === 0) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <h2>Корзина пуста</h2>
        <Link to="/">Перейти к покупкам</Link>
      </div>
    );
  }

  return (
    <div>
      <h2>Корзина</h2>
      {cart.map(item => (
        <div key={item.id} className="cart-item">
          <div style={{ flex: 2 }}>{item.name}</div>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <button onClick={() => updateQuantity(item.id, item.quantity - 1)} style={{ margin: '0 5px' }}>-</button>
            <span>{item.quantity}</span>
            <button onClick={() => updateQuantity(item.id, item.quantity + 1)} style={{ margin: '0 5px' }}>+</button>
          </div>
          <div style={{ flex: 1, textAlign: 'right' }}>{(item.price * item.quantity).toLocaleString()} ₽</div>
          <button onClick={() => removeFromCart(item.id)} style={{ background: '#d32f2f', marginLeft: '12px' }}>Удалить</button>
        </div>
      ))}
      <div className="cart-total">
        Итого: {getTotalPrice().toLocaleString()} ₽
      </div>
      <button onClick={handleCheckout} style={{ marginTop: '20px', padding: '12px 24px', fontSize: '16px' }}>
        Оформить заказ
      </button>
    </div>
  );
}

export default Cart;