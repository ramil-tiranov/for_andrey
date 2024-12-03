import React, { useEffect, useState } from 'react';
import axios from 'axios';
import NavBar from '../components/NavBar';
import './style/ArchiveComponent.css'; // Импорт стилей для компонента

const ArchiveComponent: React.FC = () => {
  const [archiveData, setArchiveData] = useState<any[]>([]);  // Состояние для хранения данных из архива
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    // Функция для загрузки данных архива
    const fetchArchiveData = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/archive');
        setArchiveData(response.data);
      } catch (error) {
        setErrorMessage('Ошибка при загрузке данных');
        console.error('Ошибка получения данных:', error);
      }
    };

    fetchArchiveData();  // Вызов функции загрузки данных при монтировании компонента
  }, []);  // Пустой массив зависимостей означает, что useEffect вызовется только один раз при монтировании

  return (
    <div className="archive-container">
      <NavBar />
      <div className="archive-main">
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        {archiveData.length > 0 ? (
          <table className="archive-table">
            <thead>
              <tr>
                <th>Имя</th>
                <th>Фамилия</th>
                <th>Номер телефона</th>
                <th>Дата увольнения</th>
                <th>Причина увольнения</th>
              </tr>
            </thead>
            <tbody>
              {/* Отображаем данные архива */}
              {archiveData.map((item) => (
                <tr key={item.ARCHIVEID}>
                  <td>{item.FIRSTNAME}</td>
                  <td>{item.LASTNAME}</td>
                  <td>{item.PHONENUMBER}</td>
                  <td>{new Date(item.DISMISSALDATE).toLocaleDateString()}</td>
                  <td>{item.REASON}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>Данные не найдены</p>  
        )}
      </div>
    </div>
  );
};

export default ArchiveComponent;
