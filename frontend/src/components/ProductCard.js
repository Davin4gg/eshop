import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../contexts/CartContext';

function ProductCard({ product }) {
  const { addToCart } = useContext(CartContext);

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(product);
  };

  // Проверяем тип изображения
  const getImageContent = () => {
    if (!product.image) {
      return <div className="product-emoji">📦</div>;
    }
    
    // Если это URL или локальный путь
    if (product.image.startsWith('http') || product.image.startsWith('/images/') || product.image.startsWith('data:')) {
      return <img src={product.image} alt={product.name} className="product-img" />;
    }
    
    // Иначе это emoji
    return <div className="product-emoji">{product.image}</div>;
  };

  return (
    <div className="product-card">
      <Link to={`/product/${product.id}`} className="product-card-link">
        <div className="product-image">
          {getImageContent()}
        </div>
        <div className="product-title">{product.name}</div>
        <div className="product-price">{product.price.toLocaleString()} ₽</div>
      </Link>
      <button onClick={handleAddToCart} className="add-to-cart-btn-card">
        В корзину
      </button>
    </div>
  );
}

export default ProductCard;