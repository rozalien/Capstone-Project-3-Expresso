require('./migration.js');

const bodyParser = require('body-parser');

const cors = require('cors');

const express = require('express');
const app = express();

app.use(cors());

const apiRouter = require('./api/api');


const PORT = process.env.PORT || 4000;

app.use(bodyParser.json());

app.use('/api', apiRouter);

app.listen(PORT, () => {
  console.log('Listening on port: ' + PORT);
});

module.exports = app;

