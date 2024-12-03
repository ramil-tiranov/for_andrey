import React, { useEffect, useState } from 'react';
import axios from 'axios';
import NavBar from '../components/NavBar';
import './style/UserProfile.css';  // Подключаем стили

const UserProfileComponent: React.FC = () => {
  const [departmentData, setDepartmentData] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const fetchDepartmentData = async () => {
      const username = localStorage.getItem('username');
      if (username) {
        try {
          const response = await axios.get(`http://localhost:4000/api/department/${username}`);
          setDepartmentData(response.data);
        } catch (error) {
          setErrorMessage('Ошибка при загрузке данных');
          console.error('Ошибка получения данных:', error);
        }
      } else {
        setErrorMessage('Пользователь не найден');
      }
    };

    fetchDepartmentData();
  }, []);

  return (
    <div className="user-profile-container">
      <NavBar />
      <div className="user-profile-main">
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        {departmentData && (
          <div className="profile-info">
            <h2>Департамент: {departmentData.DepartmentName}</h2>
            <p>Глава департамента: 👤 {departmentData.headName}</p> {/* Смайлик для главы */}
            <p>Логин: 🗝️ {departmentData.username}</p> {/* Смайлик для логина */}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfileComponent;
