import React, { useState } from 'react';
import axios from 'axios';
import NavBar from '../components/NavBar';
import './style/CreateResume.css';

const CreateResume: React.FC = () => {
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [middleName, setMiddleName] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [positionID, setPositionID] = useState<number>(0);
  const [educationID, setEducationID] = useState<number>(0);
  const [iin, setIin] = useState<string>('');
  const [birthDate, setBirthDate] = useState<string>('');
  const [maritalStatus, setMaritalStatus] = useState<string>('');
  const [passportNumber, setPassportNumber] = useState<string>('');
  const [inputDepartmentID, setInputDepartmentID] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Получаем ID департамента из localStorage
  const departmentID = Number(localStorage.getItem('DepartmentID')) || 0;

  const clearErrorMessage = () => setErrorMessage('');
  const clearSuccessMessage = () => setSuccessMessage('');

  const handleAddUser = async () => {
    // Проверка обязательных полей
    if (!firstName || !lastName || !phoneNumber || !city || !iin || !birthDate) {
      setErrorMessage('Пожалуйста, заполните все обязательные поля.');
      setTimeout(clearErrorMessage, 10000);
      return;
    }

    // Проверяем, совпадает ли ID департамента
    if (inputDepartmentID !== departmentID) {
      setErrorMessage('Вы не можете добавить сотрудника в другой департамент.');
      setTimeout(clearErrorMessage, 10000);
      return;
    }

    // Формируем объект с данными для отправки
    const userData = {
      firstName,
      lastName,
      middleName,
      phoneNumber,
      departmentID: inputDepartmentID,
      city,
      positionID,
      educationID,
      iin,
      birthDate,
      maritalStatus,
      passportNumber,
    };

    console.log('Отправляемые данные:', userData);

    try {
      // Отправляем запрос на сервер
      const response = await axios.post('http://localhost:4000/employee', userData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Ответ от сервера:', response.data);

      setSuccessMessage('Сотрудник успешно добавлен!');
      setTimeout(clearSuccessMessage, 10000);

      // Очистка формы
      setFirstName('');
      setLastName('');
      setMiddleName('');
      setPhoneNumber('');
      setCity('');
      setPositionID(0);
      setEducationID(0);
      setIin('');
      setBirthDate('');
      setMaritalStatus('');
      setPassportNumber('');
      setInputDepartmentID(0);
    } catch (error) {
      console.error('Ошибка при добавлении сотрудника:', error);
      setErrorMessage('Ошибка при добавлении сотрудника. Попробуйте еще раз.');
      setTimeout(clearErrorMessage, 10000);
    }
  };

  return (
    <>
      <NavBar />
      <div className="create-user-container">
        <h2>Создание нового сотрудника</h2>

        <input
          type="text"
          className="input-field"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="Имя"
        />
        <input
          type="text"
          className="input-field"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          placeholder="Фамилия"
        />
        <input
          type="text"
          className="input-field"
          value={middleName}
          onChange={(e) => setMiddleName(e.target.value)}
          placeholder="Отчество"
        />
        <input
          type="tel"
          className="input-field"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder="Телефон"
        />
        <input
          type="text"
          className="input-field"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Город"
        />
        <input
          type="number"
          className="input-field"
          value={positionID}
          onChange={(e) => setPositionID(Number(e.target.value))}
          placeholder="ID должности"
        />
        <input
          type="number"
          className="input-field"
          value={educationID}
          onChange={(e) => setEducationID(Number(e.target.value))}
          placeholder="ID образования"
        />
        <input
          type="text"
          className="input-field"
          value={iin}
          onChange={(e) => setIin(e.target.value)}
          placeholder="ИИН"
        />
        <input
          type="date"
          className="input-field"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          placeholder="Дата рождения"
        />
        <input
          type="text"
          className="input-field"
          value={maritalStatus}
          onChange={(e) => setMaritalStatus(e.target.value)}
          placeholder="Семейное положение"
        />
        <input
          type="text"
          className="input-field"
          value={passportNumber}
          onChange={(e) => setPassportNumber(e.target.value)}
          placeholder="Номер паспорта"
        />
        <input
          type="number"
          className="input-field"
          value={inputDepartmentID}
          onChange={(e) => setInputDepartmentID(Number(e.target.value))}
          placeholder="ID департамента"
        />

        <button onClick={handleAddUser} className="profile-button">
          Добавить сотрудника
        </button>

        {errorMessage && <p className="error-message">{errorMessage}</p>}
        {successMessage && <p className="success-message">{successMessage}</p>}
      </div>
    </>
  );
};

export default CreateResume;
