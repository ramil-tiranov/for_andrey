import React, { useState } from 'react';
import axios from 'axios';

const DeleteInPackage: React.FC = () => {
  const [employeeID, setEmployeeID] = useState('');
  const [reason, setReason] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Извлекаем данные о пользователе из localStorage
    const username = localStorage.getItem('username');
    const userId = localStorage.getItem('HeadID');

    if (!username || !userId) {
      alert('Ошибка: Не удалось извлечь данные о пользователе');
      return;
    }

    try {
      // Отправляем запрос на сервер для выполнения операции
      const response = await axios.post('http://localhost:4000/mark-low-performance', {
        employeeID,
        reason,
        username, // Отправляем имя пользователя
        userId, // Отправляем ID пользователя (HeadID)
      });

      alert(response.data.message); // Сообщение от сервера
    } catch (error) {
      console.error(error);
      alert('Ошибка при выполнении операции');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        ID сотрудника:
        <input
          type="text"
          value={employeeID}
          onChange={(e) => setEmployeeID(e.target.value)}
        />
      </label>
      <br />
      <label>
        Причина:
        <input
          type="text"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </label>
      <br />
      <button type="submit">Удалить сотрудника</button>
    </form>
  );
};

export default DeleteInPackage;
