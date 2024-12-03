import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './style/Login.css'; // Подключение стилей

const Login: React.FC = () => {
  const [username, setUsername] = useState<string>(''); // Логин
  const [password, setPassword] = useState<string>(''); // Пароль
  const [errorMessage, setErrorMessage] = useState<string>(''); // Сообщение об ошибке
  const navigate = useNavigate();

  // Обработчик входа
  const handleLogin = async () => {
    if (!password) {
      setErrorMessage('Пароль не может быть пустым');
      return;
    }

    try {
      // Запрос на проверку логина и пароля
      const response = await axios.post('http://localhost:4000/login', {
        username,
        password,
      });

      if (response.status === 200) {
        // Получаем данные из ответа сервера
        const { departmentId, headId, username } = response.data;

        // Сохраняем данные в локальное хранилище
        localStorage.setItem('username', username);
        localStorage.setItem('DepartmentID', departmentId.toString()); // departmentId как строка
        localStorage.setItem('HeadID', headId.toString()); // headId как строка

        alert('Вход выполнен успешно!');
        navigate('/admin'); // Перенаправляем на страницу администратора
      } else {
        setErrorMessage('Неверные имя пользователя или пароль');
      }
    } catch (error) {
      setErrorMessage('Ошибка при входе. Проверьте данные и попробуйте снова.');
      console.error('Ошибка при входе:', error);
    }
  };

  return (
    <div className="login-container">
      <h1>Вход</h1>
      <input
        type="text"
        placeholder="Имя пользователя"
        value={username}
        onChange={(e) => setUsername(e.target.value)} // Обновление логина
        className="login-input"
      />
      <input
        type="password"
        placeholder="Пароль"
        value={password}
        onChange={(e) => setPassword(e.target.value)} // Обновление пароля
        className="login-input"
      />
      <button onClick={handleLogin} className="login-button">Войти</button>
      {errorMessage && <p className="error-message">{errorMessage}</p>} {/* Показ ошибки */}
    </div>
  );
};

export default Login;
