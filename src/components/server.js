const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const oracledb = require('oracledb');

const app = express();
const port = 4000;


const crypto = require('crypto'); // Для расшифровки

// Секретный ключ (должен совпадать с используемым в Oracle)
const secretKey = 'mysecretkey123456';
const algorithm = 'aes-256-cbc';
const iv = Buffer.from('1234567890123456'); // Вектор инициализации, должен быть таким же, как при шифровании


// Настройки подключения к базе данных Oracle
const dbConfig = {
  user: "HRAdmin",
  password: "123",
  connectString: "(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=192.168.21.15)(PORT=1521))(CONNECT_DATA=(SID=orcl)))"
};

let pool;

// Функция для создания пула подключений
async function createPool() {
  try {
    pool = await oracledb.createPool(dbConfig);
    console.log("Пул подключений создан");
  } catch (error) {
    console.error("Ошибка при создании пула:", error);
  }
}

app.use(cors());
app.use(bodyParser.json());

// Маршрут для входа (логин)
// app.post('/login', async (req, res) => {
//   const { username, password } = req.body;

//   let connection;

//   try {
//     // Получаем соединение из пула
//     connection = await pool.getConnection();

//     // Запрос для получения данных о пользователе
//     const query = `SELECT head_id, DepartmentID, username, password
//                    FROM department_heads
//                    WHERE username = :username
//                    AND password = :password`;

//     const result = await connection.execute(query, {
//       username: username.toLowerCase(),
//       password: password,
//     });

//     if (result.rows.length > 0) {
//       const user = result.rows[0]; // Получаем данные пользователя
//       const departmentId = user[1]; // Предполагается, что DepartmentID находится во втором столбце
//       const headId = user[0]; // head_id из первого столбца

//       // Отправляем успешный ответ с данными пользователя
//       res.status(200).send({
//         message: 'Вход выполнен успешно',
//         departmentId: departmentId, // Отправляем departmentId
//         headId: headId, // Отправляем headId
//         username: user[2], // Отправляем username
//       });
//     } else {
//       res.status(401).send('Неверные имя пользователя или пароль');
//     }

//   } catch (error) {
//     console.error('Ошибка при подключении к базе данных:', error);
//     res.status(500).send('Ошибка на сервере');
//   } finally {
//     // Закрываем соединение
//     if (connection) {
//       try {
//         await connection.close();
//       } catch (closeError) {
//         console.error('Ошибка при закрытии подключения:', closeError);
//       }
//     }
//   }
// });

app.post('/login', async (req, res) => {
  const { username, password } = req.body; // Получаем логин и пароль

  let connection;

  try {
    // Получаем соединение из пула
    connection = await pool.getConnection();

    // SQL-запрос для получения данных о пользователе
    const query = `
      SELECT head_id, DepartmentID, username, password
      FROM department_heads
      WHERE username = :username
      AND password = :password
    `;

    // Выполнение запроса
    const result = await connection.execute(query, {
      username: username.toLowerCase(), // Логин приведенный к нижнему регистру
      password: password, // Пароль
    });

    // Проверяем, если пользователь найден
    if (result.rows.length > 0) {
      const user = result.rows[0]; // Данные пользователя
      const departmentId = user[1]; // DepartmentID (второй столбец)
      const headId = user[0]; // head_id (первый столбец)

      // Логируем успешный вход
      const logQuery = `
        INSERT INTO user_action_logs (user_id, username, action_type, target_user, details)
        VALUES (:user_id, :username, 'LOGIN', NULL, 'Успешный вход в систему')
      `;

      const logBinds = {
        user_id: headId, // ID пользователя
        username: user[2], // Имя пользователя
      };

      // Записываем информацию в таблицу логов
      await connection.execute(logQuery, logBinds, { autoCommit: true });

      // Отправляем успешный ответ с данными пользователя
      res.status(200).send({
        message: 'Вход выполнен успешно',
        departmentId: departmentId, // Отправляем departmentId
        headId: headId, // Отправляем headId
        username: user[2], // Отправляем имя пользователя
      });
    } else {
      res.status(401).send('Неверные имя пользователя или пароль');
    }

  } catch (error) {
    console.error('Ошибка при подключении к базе данных:', error);
    res.status(500).send('Ошибка на сервере');
  } finally {
    // Закрываем соединение
    if (connection) {
      try {
        await connection.close();
      } catch (closeError) {
        console.error('Ошибка при закрытии подключения:', closeError);
      }
    }
  }
});


// Маршрут для получения данных о департаменте по headId
app.get('/api/department/:headId', async (req, res) => {
  const { headId } = req.params;

  let connection;

  try {
    // Получаем соединение из пула
    connection = await pool.getConnection();

    const query = `
      SELECT d.DepartmentName, d.DepartmentHead, h.username
      FROM HR_Department d
      JOIN department_heads h ON d.DepartmentID = h.DepartmentID
      WHERE h.username = :headId
    `;

    const result = await connection.execute(query, { headId });

    if (result.rows.length > 0) {
      res.json({
        DepartmentName: result.rows[0][0], // Название департамента
        headName: result.rows[0][1],       // Имя главы департамента
        username: result.rows[0][2],       // Логин главы департамента
      });
    } else {
      res.status(404).json({ message: 'Департамент с таким пользователем не найден' });
    }

  } catch (err) {
    console.error('Ошибка получения данных департамента:', err);
    res.status(500).json({ message: 'Ошибка сервера' });
  } finally {
    // Закрываем соединение
    if (connection) {
      try {
        await connection.close();
      } catch (closeError) {
        console.error('Ошибка при закрытии подключения:', closeError);
      }
    }
  }
});


// Маршрут для получения всех сотрудников
app.get('/employees', async (req, res) => {
  let connection;

  try {
    // Получаем соединение из пула
    connection = await pool.getConnection();

    const query = `
      SELECT 
        e.EmployeeID, 
        e.FirstName, 
        e.LastName, 
        e.MiddleName, 
        e.PhoneNumber, 
        e.City, 
        d.DepartmentName AS Department, 
        p.PositionName AS Position, 
        edu.EducationName AS Education,
        e.IIN,
        e.BirthDate,
        e.MaritalStatus,
        e.PassportNumber
      FROM HR_Employee e
      LEFT JOIN HR_Department d ON e.DepartmentID = d.DepartmentID
      LEFT JOIN HR_Position p ON e.PositionID = p.PositionID
      LEFT JOIN HR_Education edu ON e.EducationID = edu.EducationID
    `;

    const result = await connection.execute(query, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Сотрудники не найдены' });
    }

    // Возвращаем данные сотрудников в формате JSON
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Ошибка при получении данных сотрудников:', err);
    res.status(500).json({ error: 'Ошибка сервера. Не удалось получить данные сотрудников.' });
  } finally {
    // Закрываем соединение
    if (connection) {
      try {
        await connection.close();
      } catch (closeError) {
        console.error('Ошибка при закрытии соединения:', closeError);
      }
    }
  }
});

// Маршрут для получения данных о сотруднике
app.get('/employee/:employeeId', async (req, res) => {
  const { employeeId } = req.params;

  let connection;

  try {
    // Получаем соединение без использования пула
    connection = await oracledb.getConnection(dbConfig);

    // Запрос для получения данных о сотруднике по EmployeeID
    const query = `
      SELECT 
        e.EmployeeID, 
        e.FirstName, 
        e.LastName, 
        e.PhoneNumber, 
        e.City, 
        d.DepartmentName, 
        p.PositionName, 
        edu.EducationName
      FROM HR_Employee e
      LEFT JOIN HR_Department d ON e.DepartmentID = d.DepartmentID
      LEFT JOIN HR_Position p ON e.PositionID = p.PositionID
      LEFT JOIN HR_Education edu ON e.EducationID = edu.EducationID
      WHERE e.EmployeeID = :employeeId
    `;

    const result = await connection.execute(query, [employeeId], { outFormat: oracledb.OUT_FORMAT_OBJECT });

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Сотрудник не найден' });
    }

    res.status(200).json(result.rows[0]);

  } catch (err) {
    console.error('Ошибка при получении данных сотрудника:', err);
    res.status(500).json({ error: 'Ошибка сервера. Не удалось получить данные сотрудника.' });
  } finally {
    // Закрываем соединение
    if (connection) {
      try {
        await connection.close();
      } catch (closeError) {
        console.error('Ошибка при закрытии соединения:', closeError);
      }
    }
  }
});

// Получение списка департаментов
app.get('/departments', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();  // Используем пул подключений
    const result = await connection.execute(
      'SELECT DepartmentID, DepartmentName FROM HR_Department',
      [], // Здесь нет параметров, поэтому передаем пустой массив
      { outFormat: oracledb.OUT_FORMAT_OBJECT }  // Это обеспечит формат вывода в виде объектов
    );
    if (result.rows.length > 0) {
      res.json(result.rows);
    } else {
      res.status(404).json({ error: 'Департаменты не найдены' });
    }
  } catch (error) {
    console.error('Ошибка при получении департаментов:', error);
    res.status(500).json({ error: 'Ошибка при получении департаментов' });
  } finally {
    if (connection) {
      try {
        await connection.close();  // Закрытие соединения после выполнения запроса
      } catch (closeError) {
        console.error('Ошибка при закрытии соединения:', closeError);
      }
    }
  }
});


// Получение списка должностей
app.get('/positions', async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute('SELECT PositionID, PositionName FROM HR_Position');
    res.json(result.rows);
  } catch (error) {
    console.error('Ошибка при получении должностей:', error);
    res.status(500).json({ error: 'Ошибка при получении должностей' });
  } finally {
    if (connection) {
      await connection.close();
    }
  }
});


// Получение списка должностей
app.get('/positions', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection(); // Получаем соединение из пула
    const result = await connection.execute('SELECT PositionID, PositionName FROM HR_Position');
    res.status(200).json(result.rows); // Отправляем список должностей
  } catch (error) {
    console.error('Ошибка при получении должностей:', error);
    res.status(500).json({ error: 'Ошибка при получении должностей' });
  } finally {
    if (connection) {
      try {
        await connection.close(); // Закрываем соединение
      } catch (closeError) {
        console.error('Ошибка при закрытии соединения:', closeError);
      }
    }
  }
});


// Маршрут для добавления нового сотрудника
app.post('/employee', async (req, res) => {
  const {
    firstName,
    lastName,
    middleName,
    phoneNumber,
    departmentID,
    city,
    positionID,
    educationID,
    iin,
    birthDate,
    maritalStatus,
    passportNumber
  } = req.body;

  const query = `
    INSERT INTO HR_Employee 
    (EmployeeID, FirstName, LastName, MiddleName, PhoneNumber, DepartmentID, City, PositionID, EducationID, IIN, BirthDate, MaritalStatus, PassportNumber)
    VALUES 
    (HR_Employee_seq.NEXTVAL, :firstName, :lastName, :middleName, :phoneNumber, :departmentID, :city, :positionID, :educationID, :iin, TO_DATE(:birthDate, 'YYYY-MM-DD'), :maritalStatus, :passportNumber)
    RETURNING EmployeeID INTO :employeeID
  `;

  let connection;

  try {
    // Получаем соединение из пула
    connection = await pool.getConnection();

    const binds = {
      firstName,
      lastName,
      middleName,
      phoneNumber,
      departmentID,
      city,
      positionID,
      educationID,
      iin,
      birthDate,
      maritalStatus,
      passportNumber,
      employeeID: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
    };

    const result = await connection.execute(query, binds, { autoCommit: true });

    const createdEmployeeID = result.outBinds.employeeID[0];

    res.status(201).json({
      message: 'Пользователь успешно добавлен',
      employeeID: createdEmployeeID,
    });
  } catch (error) {
    console.error('Ошибка добавления пользователя:', error);
    res.status(500).json({ error: 'Ошибка при добавлении пользователя' });
  } finally {
    // Закрываем соединение
    if (connection) {
      try {
        await connection.close();
      } catch (closeError) {
        console.error('Ошибка при закрытии соединения:', closeError);
      }
    }
  }
});

// app.post('/employee', async (req, res) => {
//   const {
//     firstName,
//     lastName,
//     middleName,
//     phoneNumber,
//     departmentID,
//     city,
//     positionID,
//     educationID,
//     iin,
//     birthDate,
//     maritalStatus,
//     passportNumber,
//   } = req.body;

//   const username = localStorage.getItem('username'); // Имя пользователя, добавляющего сотрудника
//   const userId = localStorage.getItem('HeadID'); // ID пользователя, добавляющего сотрудника

//   if (!username || !userId) {
//     return res.status(400).send({ error: 'Не удалось извлечь данные о пользователе' });
//   }

//   try {
//     const connection = await oracledb.getConnection(dbConfig);

//     // Вставка нового сотрудника в таблицу сотрудников
//     const insertQuery = `
//       INSERT INTO employees (FIRST_NAME, LAST_NAME, MIDDLE_NAME, PHONE_NUMBER, CITY, 
//                              POSITION_ID, EDUCATION_ID, IIN, BIRTH_DATE, MARITAL_STATUS, PASSPORT_NUMBER, DEPARTMENT_ID)
//       VALUES (:firstName, :lastName, :middleName, :phoneNumber, :city, 
//               :positionID, :educationID, :iin, :birthDate, :maritalStatus, :passportNumber, :departmentID)
//     `;

//     await connection.execute(insertQuery, {
//       firstName,
//       lastName,
//       middleName,
//       phoneNumber,
//       city,
//       positionID,
//       educationID,
//       iin,
//       birthDate,
//       maritalStatus,
//       passportNumber,
//       departmentID,
//     });

//     // Запись в таблицу логов
//     const logQuery = `
//       INSERT INTO user_action_logs (USER_ID, USERNAME, ACTION_TYPE, TARGET_USER, DETAILS, ACTION_TIME)
//       VALUES (:user_id, :username, 'ADD', :targetUser, :details, CURRENT_TIMESTAMP)
//     `;
    
//     // Формируем подробности действия
//     const targetUser = `${firstName} ${lastName}`;  // Имя добавленного сотрудника
//     const details = `Добавлен сотрудник: ${firstName} ${lastName}`;

//     await connection.execute(logQuery, {
//       user_id: userId,           // ID текущего пользователя (кто добавляет)
//       username: username,        // Имя текущего пользователя (кто добавляет)
//       targetUser: targetUser,    // Имя добавленного сотрудника
//       details: details,          // Детали действия
//     });

//     // Подтверждаем транзакцию
//     await connection.commit();

//     res.send({ message: 'Сотрудник успешно добавлен!' });
//   } catch (error) {
//     console.error(error);
//     res.status(500).send({ error: 'Ошибка при добавлении сотрудника. Попробуйте еще раз.' });
//   }
// });


// Маршрут для получения списка заказов
app.get('/orders', async (req, res) => {
  let connection;

  try {
    connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute(`
      SELECT 
        OrderID, 
        OrderName, 
        TO_CHAR(OrderDate, 'YYYY-MM-DD') AS OrderDate, 
        OrderContent 
      FROM HR_Orders
    `);

    // Преобразуем данные в удобный формат
    const orders = result.rows.map(row => ({
      OrderID: row[0],
      OrderName: row[1],
      OrderDate: row[2],
      OrderContent: row[3],
    }));

    res.json(orders);
  } catch (error) {
    console.error('Ошибка при запросе данных о заказах:', error);
    res.status(500).json({ error: 'Ошибка при получении данных' });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (error) {
        console.error('Ошибка при закрытии соединения:', error);
      }
    }
  }
});

// Создание маршрута для получения данных из таблицы Archive


app.post('/api/deleteEmployee', async (req, res) => {
  const { employeeId, reason } = req.body;

  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);

    console.log(`Attempting to delete employee with ID: ${employeeId} and reason: ${reason}`);

    // Вызов процедуры из пакета EmployeeManagement
    const result = await connection.execute(
      `BEGIN 
        EmployeeManagement.DeleteEmployee(:employeeId, :reason);
      END;`,
      {
        employeeId: employeeId,
        reason: reason
      }
    );

    console.log('Procedure executed successfully');
    res.status(200).json({
      message: 'Employee archived and deleted successfully',
      result: result
    });

  } catch (err) {
    console.error('Error occurred:', err);
    res.status(500).json({ message: 'Error deleting employee', error: err.message });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('Error closing connection', err);
      }
    }
  }
});


// API для отметки низкой производительности
// app.post('/mark-low-performance', async (req, res) => {
//   const { employeeID, reason } = req.body;

//   try {
//     const connection = await oracledb.getConnection(dbConfig);

//     await connection.execute(
//       `BEGIN
//          EmployeePerformance.MarkLowPerformance(:employeeID, :reason);
//        END;`,
//       {
//         employeeID: employeeID,
//         reason: reason,
//       }
//     );

//     await connection.commit();
//     res.send({ message: `Сотрудник с ID ${employeeID} успешно отмечен.` });
//   } catch (error) {
//     console.error(error);
//     res.status(500).send({ error: 'Ошибка при выполнении операции' });
//   }
// });

app.post('/mark-low-performance', async (req, res) => {
  const { employeeID, reason, username, userId } = req.body; // Получаем данные из тела запроса
  
  // Если данные о пользователе не переданы, возвращаем ошибку
  if (!username || !userId) {
    return res.status(400).send({ error: 'Не удалось извлечь данные о пользователе' });
  }

  try {
    const connection = await oracledb.getConnection(dbConfig);

    // Выполняем процедуру для изменения состояния сотрудника
    await connection.execute(
      `BEGIN
         EmployeePerformance.MarkLowPerformance(:employeeID, :reason);
       END;`,
      {
        employeeID: employeeID,
        reason: reason,
      }
    );

    // Запись в таблицу логов
    const logQuery = `
      INSERT INTO user_action_logs (USER_ID, USERNAME, ACTION_TYPE, TARGET_USER, DETAILS, ACTION_TIME)
      VALUES (:user_id, :username, 'DELETE', :employeeID, :reason, CURRENT_TIMESTAMP)
    `;

    // Записываем в логи
    await connection.execute(logQuery, {
      user_id: userId, // ID текущего пользователя
      username: username, // Имя текущего пользователя
      employeeID: employeeID, // ID сотрудника, которого изменили
      reason: reason, // Причина изменения
    });

    // Подтверждаем транзакцию
    await connection.commit();

    res.send({ message: `Сотрудник с ID ${employeeID} успешно отмечен.` });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Ошибка при выполнении операции' });
  }
});



// API для получения количества сотрудников с низкой производительностью
app.get('/low-performance-count', async (req, res) => {
  try {
    const connection = await oracledb.getConnection(dbConfig);

    const result = await connection.execute(
      `BEGIN
         :count := EmployeePerformance.GetLowPerformanceCount();
       END;`,
      { count: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER } }
    );

    res.send({ count: result.outBinds.count });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Ошибка при выполнении операции' });
  }
});


// Роут для добавления записи в таблицу логов
app.post('/add-log', async (req, res) => {
  const { user_id, username, action_type, target_user, details } = req.body;

  // Проверка обязательных параметров
  if (!user_id || !username || !action_type) {
    return res.status(400).json({ error: 'Поля user_id, username и action_type обязательны' });
  }

  let connection;

  try {
    connection = await oracledb.getConnection(dbConfig);

    // SQL-запрос для вставки данных
    const sql = `
      INSERT INTO user_action_logs (user_id, username, action_type, target_user, details)
      VALUES (:user_id, :username, :action_type, :target_user, :details)
    `;

    const binds = {
      user_id,
      username,
      action_type,
      target_user: target_user || null, // Если target_user отсутствует, использовать NULL
      details: details || null // Если details отсутствуют, использовать NULL
    };

    await connection.execute(sql, binds, { autoCommit: true });

    res.status(201).json({ message: 'Запись успешно добавлена' });
  } catch (err) {
    console.error('Ошибка при добавлении записи:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('Ошибка при закрытии соединения:', err);
      }
    }
  }
});

// Создание пула при запуске сервера
createPool();

app.listen(port, () => {
  console.log(`Сервер запущен на http://localhost:${port}`);
});
