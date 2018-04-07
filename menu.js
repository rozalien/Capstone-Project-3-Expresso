employeesRouter.get('/', (req, res, next) => {
  db.all('SELECT * FROM Employee WHERE Employee.is_current_employee = 1',
    (err, employees) => {
      if (err) {
        next(err);
      } else {
        res.status(200).json({employees: employees});
      }
    });
});

employeesRouter.get('/:employeeId', (req, res, next) => {
  res.status(200).json({employee: req.employee});
});

employeesRouter.post('/', (req, res, next) => {
  const name = req.body.employee.name,
        position = req.body.employee.position,
        wage = req.body.employee.wage,
        isCurrentEmployee = req.body.employee.isCurrentEmployee === 0 ? 0 : 1;
  if (!name || !position || !wage) {
    return res.sendStatus(400);
  }

  const sql = 'INSERT INTO Employee (name, position, wage, is_current_employee)' +
      'VALUES ($name, $position, $wage, $isCurrentEmployee)';
  const values = {
    $name: name,
    $position: position,
    $wage: wage,
    $isCurrentEmployee: isCurrentEmployee
  };

  db.run(sql, values, function(error) {
    if (error) {
      next(error);
    } else {
      db.get(`SELECT * FROM employee WHERE employee.id = ${this.lastID}`,
        (error, employee) => {
          res.status(201).json({employee: employee});
        });
    }
  });
});
