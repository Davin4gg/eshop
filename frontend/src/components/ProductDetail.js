import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useContext } from 'react';
import { CartContext } from '../contexts/CartContext';

function ProductDetail() {
  const { id } = useParams(); // Получаем ID товара из URL
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useContext(CartContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Загружаем все товары и находим нужный по ID
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        const foundProduct = data.find(p => p.id === parseInt(id));
        if (foundProduct) {
          setProduct(foundProduct);
        } else {
          setError('Товар не найден');
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Ошибка загрузки товара:', err);
        setError('Не удалось загрузить товар');
        setLoading(false);
      });
  }, [id]);

  const handleAddToCart = () => {
    // Добавляем товар в корзину указанное количество раз
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
  };

  const incrementQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  if (loading) {
    return (
      <div className="product-detail-loading">
        <div className="loader"></div>
        <p>Загрузка товара...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="product-detail-error">
        <h2>Ошибка</h2>
        <p>{error}</p>
        <Link to="/" className="back-link">Вернуться на главную</Link>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-detail-error">
        <h2>Товар не найден</h2>
        <Link to="/" className="back-link">Вернуться на главную</Link>
      </div>
    );
  }

  return (
    <div className="product-detail">
      <button onClick={() => navigate(-1)} className="back-button">
        ← Назад
      </button>
      
      <div className="product-detail-content">
        <div className="product-detail-image">
          {product.image && (product.image.startsWith('http') || product.image.startsWith('/images/')) ? (
            <img src={product.image} alt={product.name} className="product-detail-img" />
         ) : (
            <div className="product-detail-emoji">{product.image || '📦'}</div>
          )}
      </div>
        
        <div className="product-detail-info">
          <h1 className="product-detail-title">{product.name}</h1>
          
          <div className="product-detail-price">
            {product.price.toLocaleString()} ₽
          </div>
          
          <div className="product-detail-description">
            <h3>Описание товара</h3>
            <p>
              {product.name} — это качественный товар от проверенного производителя. 
              Отличное соотношение цены и качества. Идеально подходит для повседневного использования.
            </p>
            <p>
              ✓ Гарантия качества<br />
              ✓ Быстрая доставка<br />
              ✓ Официальная гарантия 12 месяцев<br />
              ✓ Поддержка 24/7
            </p>
          </div>
          
          <div className="product-detail-actions">
            <div className="quantity-selector">
              <label>Количество:</label>
              <div className="quantity-controls">
                <button onClick={decrementQuantity} className="quantity-btn">-</button>
                <span className="quantity-value">{quantity}</span>
                <button onClick={incrementQuantity} className="quantity-btn">+</button>
              </div>
            </div>
            
            <button onClick={handleAddToCart} className="add-to-cart-btn">
              🛒 Добавить в корзину ({quantity} шт.)
            </button>
          </div>
          
          <div className="product-detail-meta">
            <p><strong>Артикул:</strong> #{product.id}</p>
            <p><strong>Категория:</strong> Электроника</p>
            <p><strong>Наличие:</strong> <span className="in-stock">В наличии</span></p>
          </div>
        </div>
      </div>
      
      <div className="product-detail-recommendations">
        <h3>Похожие товары</h3>
        <Link to="/" className="view-all-link">
          Вернуться к покупкам →
        </Link>
      </div>
    </div>
  );
}

export default ProductDetail;