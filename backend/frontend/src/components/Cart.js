import React, { useContext } from 'react';
import { CartContext } from '../contexts/CartContext';
import { Link } from 'react-router-dom';

function Cart() {
  const { cart, removeFromCart, updateQuantity, getTotalPrice } = useContext(CartContext);

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
    </div>
  );
}

export default Cart;