import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import NavBar from './NavBar';
import './style/Admin.css';

interface Employee {
  EMPLOYEEID: number;
  FIRSTNAME: string;
  LASTNAME: string;
  MIDDLENAME: string;
  PHONENUMBER: string;
  DEPARTMENT: string;
  CITY: string;
  POSITION: string;
  EDUCATION: string;
  IIN: string;
  BIRTHDATE: string;
  MARITALSTATUS: string;
  PASSPORTNUMBER: string;
}

const Admin: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get('http://localhost:4000/employees');
        console.log('Полученные данные сотрудников:', response.data);
        setEmployees(response.data);
      } catch (error) {
        console.error('Ошибка при получении данных сотрудников:', error);
      }
    };

    fetchEmployees();
  }, []);

  const handleEmployeeClick = (EMPLOYEEID: number) => {
    navigate(`/employee/${EMPLOYEEID}`);
  };

  return (
    <div className="employee-list-container">
      <NavBar />

      <main className="employee-list-main">
        <h2>Список сотрудников</h2>
        <ul className="employee-list">
          {employees.length > 0 ? (
            employees.map((employee) => (
              <li
                key={employee.EMPLOYEEID}
                className="employee-item"
                onClick={() => handleEmployeeClick(employee.EMPLOYEEID)}
              >
                <div className="employee-info">
                  <h3>{employee.FIRSTNAME} {employee.LASTNAME}</h3>
                  <p>📞 Телефон: {employee.PHONENUMBER}</p>
                  <p>📍 Город: {employee.CITY}</p>
                  <p>🧑‍💼 Должность: {employee.POSITION}</p>
                  <p>🏢 Отдел: {employee.DEPARTMENT}</p>
                  <p>🎓 Образование: {employee.EDUCATION}</p>
                  <p>📑 ИИН: {employee.IIN}</p>
                  <p>🎂 Дата рождения: {employee.BIRTHDATE}</p>
                  <p>💍 Семейное положение: {employee.MARITALSTATUS}</p>
                  <p>🆔 Номер паспорта: {employee.PASSPORTNUMBER}</p>
                </div>
              </li>
            ))
          ) : (
            <p>Загрузка...</p>
          )}
        </ul>
      </main>
    </div>
  );
};

export default Admin;