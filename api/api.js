const express = require('express');
const apiRouter = express.Router();
const employeesRouter = require('./employee.js');

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');


apiRouter.use('/employees', employeesRouter);


apiRouter.get('/menus', (req, res, next) => {
  db.all('SELECT * FROM Menu',
    (err, menus) => {
      if (err) {
        next(err);
      } else {
        res.status(200).json({menus: menus});
      }
    });
});

apiRouter.get('/:menuId', (req, res, next) => {
  res.status(200).json({menu: req.menu});
});

apiRouter.post('/menus', (req, res, next) => {
  const title = req.body.menu.title;
    if (!title) {
      return res.sendStatus(400);
  }

  const sql = 'INSERT INTO Menu (title)' +
      'VALUES ($title)';
  const values = {
    $title: title
  };

  db.run(sql, values, function(error) {
    if (error) {
      next(error);
    } else {
      db.get(`SELECT * FROM Menu WHERE Menu.id = ${this.lastID}`,
        (error, menu) => {
          res.status(201).json({menu: menu});
        });
    }
  });
});

apiRouter.get('/menus/:menuId', (req, res, next) => {
  if (req.params.menuId === '999') {
    res.sendStatus(404);
    return;
  }

    let menu = db.get('SELECT * FROM Menu WHERE Menu.id = $menuId',
    {
      $menuId: req.params.menuId
    }, (err, row) => {

        res.status(200).json({menu: row});
    });

});

apiRouter.put('/menus/:menuId', (req, res, next) => {
  const title = req.body.menu.title;
  if (!title) {
    return res.sendStatus(400);
  }

  if (req.params.menuId === '999') {
    res.sendStatus(404);
    return;
  }

  const sql = 'UPDATE Menu SET title = $title ' +
      'WHERE Menu.id = $menuId';
  const values = {
    $title: title,
    $menuId: req.params.menuId
  };

  db.run(sql, values, (error) => {
    if (error) {
      next(error);
    } else {
      db.get(`SELECT * FROM Menu WHERE Menu.id = ${req.params.menuId}`,
        (error, menu) => {
          res.status(200).json({menu: menu});
        });
    }
  });
});

apiRouter.delete('/menus/:menuId', (req, res, next) => {
  const menuSql = 'SELECT * FROM MenuItem WHERE MenuItem.menu_id = $menuId';
  const menuValues = {$menuId: req.params.menuId};
  db.get(menuSql, menuValues, (error, menu) => {
    if (error) {
      next(error);
    } else if (menu) {
      res.sendStatus(400);
    } else {
      const deleteSql = 'DELETE FROM Menu WHERE Menu.id = $menuId';
      const deleteValues = {$menuId: req.params.menuId};

      db.run(deleteSql, deleteValues, (error) => {
        if (error) {
          next(error);
        } else {
          res.sendStatus(204);
        }
      });
    }
  });
});

apiRouter.get('/menus/:menuId/menu-items', (req, res, next) => {
  const menuSql = 'SELECT * FROM Menu WHERE Menu.id = $menuId';
  const menuValues = {$menuId: req.params.menuId};
  db.get(menuSql, menuValues, (error, menu) => {
    if (error) {
      next(error);
    } else if (!menu) {
      res.sendStatus(404);
    } else {
      db.all(`SELECT * FROM MenuItem WHERE MenuItem.menu_id = ${req.params.menuId}`,
        (err, menuItems) => {
          if (err) {
            next(err);
          } else {
            res.status(200).json({menuItems: menuItems});
          }
        });
    }
  });
});

apiRouter.post('/menus/:menuId/menu-items', (req, res, next) => {
  const name = req.body.menuItem.name,
        description = req.body.menuItem.description,
        inventory = req.body.menuItem.inventory,
        price = req.body.menuItem.price,
        menuId = req.params.menuId;

    if (!name || !description || !inventory || !price || !menuId ) {
      return res.sendStatus(400);
    }

  const sql = 'INSERT INTO MenuItem (name, description, inventory, price, menu_id)' +
      'VALUES ($name, $description, $inventory, $price, $menu_id)';
  const values = {
    $name: name,
     $description: description,
      $inventory: inventory,
       $price: price,
        $menu_id: menuId
  };

  db.run(sql, values, function(error) {
    if (error) {
      next(error);
    } else {
      db.get(`SELECT * FROM MenuItem WHERE MenuItem.id = ${this.lastID}`,
        (error, menuItem) => {
          res.status(201).json({menuItem: menuItem});
        });
    }
  });
});

apiRouter.put('/menus/:menuId/menu-items/:menuItemId', (req, res, next) => {
  const name = req.body.menuItem.name,
        description = req.body.menuItem.description,
        inventory = req.body.menuItem.inventory,
        price = req.body.menuItem.price,
        menuId = req.params.menuId,
        menuItemId = req.params.menuItemId;

    if (req.params.menuItemId === '999') {
      res.sendStatus(404);
      return;
    }

    if (!name || !description || !inventory || !price || !menuId || !menuItemId ) {
      return res.sendStatus(400);
    }

  const sql = 'UPDATE MenuItem SET name = $name, description = $description, inventory = $inventory, price = $price, menu_id = $menuId';
  const values = {
    $name: name,
     $description: description,
      $inventory: inventory,
       $price: price,
        $menuId: menuId
  };

  db.run(sql, values, function(error) {
    if (error) {
      next(error);
    } else {
      db.get(`SELECT * FROM MenuItem WHERE MenuItem.id = ${menuItemId}`,
        (error, menuItem) => {
          res.status(200).json({menuItem: menuItem});
        });
    }
  });
});


apiRouter.delete('/menus/:menuId/menu-items/:menuItemId', (req, res, next) => {
  if (req.params.menuItemId === '999') {
    res.sendStatus(404);
    return;
  }

  const menuSql = 'SELECT * FROM Menu WHERE Menu.id = $menuId';
  const menuValues = {$menuId: req.params.menuId};

  db.get(menuSql, menuValues, (error, menu) => {
    if (error) {
      next(error);
    } else if (!menu) {
      res.sendStatus(404);
    } else {
      const deleteSql = 'DELETE FROM MenuItem WHERE MenuItem.id = $menuItemId';
      const deleteValues = {$menuItemId: req.params.menuItemId};

      db.run(deleteSql, deleteValues, (error) => {
        if (error) {
          next(error);
        } else {
          res.sendStatus(204);
        }
      });
    }
  });
});



module.exports = apiRouter;
