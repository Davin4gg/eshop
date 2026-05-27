import React from 'react';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>📱 ElectroStore</h3>
          <p>Лучшие электронные товары по доступным ценам</p>
        </div>
        
        <div className="footer-section">
          <h3>Контакты</h3>
          <div className="contact-info">
            <p>📞 Телефон: <a href="tel:+79991234567">+7 (999) 123-45-67</a></p>
            <p>✉️ Email: <a href="mailto:info@electrostore.ru">info@electrostore.ru</a></p>
          </div>
        </div>
        
        <div className="footer-section">
          <h3>Режим работы</h3>
          <p>🕒 Пн-Пт: 10:00 - 20:00</p>
          <p>🕒 Сб-Вс: 11:00 - 18:00</p>
        </div>
        
        <div className="footer-section">
          <h3>Мы в соцсетях</h3>
          <div className="social-links">
            <span>📘 Telegram</span>
            <span>📷 VK</span>
            <span>▶️ YouTube</span>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; 2024 ElectroStore. Все права защищены.</p>
      </div>
    </footer>
  );
}

export default Footer;