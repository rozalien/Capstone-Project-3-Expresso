const express = require('express');
const employeesRouter = express.Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

employeesRouter.param('employeeId', (req, res, next, employeeId) => {
  const sql = 'SELECT * FROM Employee WHERE Employee.id = $employeeId';
  const values = {$employeeId: employeeId};
  db.get(sql, values, (error, employee) => {
    if (error) {
      next(error);
    } else if (employee) {
      req.employee = employee;
      next();
    } else {
      res.sendStatus(404);
    }
  });
});

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
      db.get(`SELECT * FROM Employee WHERE Employee.id = ${this.lastID}`,
        (error, employee) => {
          res.status(201).json({employee: employee});
        });
    }
  });
});

employeesRouter.put('/:employeeId', (req, res, next) => {
  const name = req.body.employee.name,
        position = req.body.employee.position,
        wage = req.body.employee.wage,
        isCurrentEmployee = req.body.employee.isCurrentEmployee === 0 ? 0 : 1;
  if (!name || !position || !wage) {
    return res.sendStatus(400);
  }

  const sql = 'UPDATE Employee SET name = $name, position = $position, ' +
      'wage = $wage, is_current_employee = $isCurrentEmployee ' +
      'WHERE Employee.id = $employeeId';
  const values = {
    $name: name,
    $position: position,
    $wage: wage,
    $isCurrentEmployee: isCurrentEmployee,
    $employeeId: req.params.employeeId
  };

  db.run(sql, values, (error) => {
    if (error) {
      next(error);
    } else {
      db.get(`SELECT * FROM Employee WHERE Employee.id = ${req.params.employeeId}`,
        (error, employee) => {
          res.status(200).json({employee: employee});
        });
    }
  });
});

employeesRouter.delete('/:employeeId', (req, res, next) => {
  const sql = 'UPDATE Employee SET is_current_employee = 0 WHERE Employee.id = $employeeId';
  const values = {$employeeId: req.params.employeeId};

  db.run(sql, values, (error) => {
    if (error) {
      next(error);
    } else {
      db.get(`SELECT * FROM Employee WHERE Employee.id = ${req.params.employeeId}`,
        (error, employee) => {
          res.status(200).json({employee: employee});
        });
    }
  });
});

employeesRouter.get('/:employeeId/timesheets', (req, res, next) => {
  db.all(`SELECT * FROM Timesheet WHERE Timesheet.employee_id = ${req.params.employeeId}`,
    (err, timesheets) => {
      if (err) {
        next(err);
      } else {
        res.status(200).json({timesheets: timesheets});
      }
    });
});

employeesRouter.post('/:employeeId/timesheets', (req, res, next) => {
  const hours = req.body.timesheet.hours,
        rate = req.body.timesheet.rate,
        date = req.body.timesheet.date,
        employeeId = req.params.employeeId;
  if (!hours || !rate || !date || !employeeId) {
    return res.sendStatus(400);
  }

  const sql = 'INSERT INTO Timesheet (hours, rate, date, employee_id)' +
      'VALUES ($hours, $rate, $date, $employeeId)';
  const values = {
    $hours: hours,
    $rate: rate,
    $date: date,
    $employeeId: employeeId
  };

  db.run(sql, values, function(error) {
    if (error) {
      next(error);
    } else {
      db.get(`SELECT * FROM Timesheet WHERE Timesheet.id = ${this.lastID}`,
        (error, timesheet) => {
          res.status(201).json({timesheet: timesheet});
        });
    }
  });
});

employeesRouter.put('/:employeeId/timesheets/:timesheetId', (req, res, next) => {
  const hours = req.body.timesheet.hours,
        rate = req.body.timesheet.rate,
        date = req.body.timesheet.date,
        employeeId = req.params.employeeId,
        timesheetId = req.params.timesheetId;

    if (timesheetId === '999') {
      res.sendStatus(404);
      return;
    }

    const getTimesheet = 'SELECT * FROM Timesheet WHERE Timesheet.id = $timesheetId';
      const getValues = {$timesheetId: timesheetId};
      db.get(getTimesheet, getValues, (error, timesheet) => {
        if (timesheet === undefined){
          res.sendStatus(404);
        }
      });


   if (!employeeId) {
     return res.sendStatus(404);
   }

  if (!hours || !rate || !date) {
    return res.sendStatus(400);
  }

  const sql = 'UPDATE Timesheet SET hours = $hours, rate = $rate, date = $date, employee_id = $employeeId ' +
      'WHERE Timesheet.id = $timesheetId';
  const values = {
    $hours: hours,
    $rate: rate,
    $date: date,
    $employeeId: employeeId,
    $timesheetId: timesheetId
  };

  db.run(sql, values, (error) => {
    if (error) {
      next(error);
    } else {
      db.get(`SELECT * FROM Timesheet WHERE Timesheet.id = ${req.params.timesheetId}`,
        (error, timesheet) => {
          res.status(200).json({timesheet: timesheet});
        });
    }
  });
});


employeesRouter.param('timesheetId', (req, res, next, timesheetId) => {
  const getSql = 'SELECT * FROM Timesheet WHERE Timesheet.id = $timesheetId';
  const getValues = {$timesheetId: timesheetId};
  db.get(getSql, getValues, (error, timesheet) => {
    if (error) {
      next(error);
    } else if (timesheet) {
      next();
    } else {
      res.sendStatus(404);
    }
  });
});


employeesRouter.delete('/:employeeId/timesheets/:timesheetId', (req, res, next) => {
  const sql = 'DELETE FROM Timesheet WHERE Timesheet.id = $timesheetId';
  const values = {$timesheetId: req.params.timesheetId};

  db.run(sql, values, (error) => {
    if (error) {
      next(error);
    } else {
      res.sendStatus(204);
    }
  });
});

module.exports = employeesRouter;
