import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './style/NavBar.css';

const NavBar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Обновление состояния прокрутки
  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Обработка выхода из системы
  const handleLogout = () => {
    // Удаляем все данные, связанные с пользователем
    localStorage.removeItem('user'); // Удаляем информацию о пользователе
    localStorage.removeItem('DepartmentID'); // Удаляем ID департамента
    localStorage.removeItem('username'); // Удаляем имя пользователя
    // Перенаправляем на главную страницу
    navigate('/'); 
  };

  return (
    <header className={`navbar ${isScrolled ? 'shrink' : ''}`}>
      <nav className="navbar-links">
        <Link 
          to="/user-profile" 
          className={`navbar-link ${location.pathname === '/user-profile' ? 'active' : ''}`}
        >
          <span>Профиль</span>
        </Link>
        <Link 
          to="/admin" 
          className={`navbar-link ${location.pathname === '/admin' ? 'active' : ''}`}
        >
          <span>Просмотреть Резюме</span>
        </Link>
        <Link 
          to="/create-resume" 
          className={`navbar-link ${location.pathname === '/create-resume' ? 'active' : ''}`}
        >
          <span>Создать Резюме</span>
        </Link>
        <Link 
          to="/logi" 
          className={`navbar-link ${location.pathname === '/logi' ? 'active' : ''}`}
        >
          <span>Архив</span>
        </Link>
        <Link 
          to="/package" 
          className={`navbar-link ${location.pathname === '/package' ? 'active' : ''}`}
        >
          <span>Пакет</span>
        </Link>
        <Link 
          to="/" 
          className={`navbar-link ${location.pathname === '/' ? 'active' : ''}`}
          onClick={handleLogout}
        >
          <span>Выйти</span>
        </Link>
      </nav>

      <div className={`tab-slider 
          ${location.pathname === '/user-profile' ? 'profile' : ''} 
          ${location.pathname === '/admin' ? 'admin' : ''} 
          ${location.pathname === '/create-resume' ? 'create-resume' : ''} 
          ${location.pathname === '/companies' ? 'companies' : ''} 
          ${location.pathname === '/about' ? 'about' : ''}`}
      />
    </header>
  );
};

export default NavBar;
