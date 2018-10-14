'use strict';

const PORT = process.env.PORT || 8000;
const express = require('express');
const app = express();

app.use(express.static('dist/main'));

const server = app.listen(PORT, function () {
  const host = server.address().address;
  const port = server.address().port;

  console.log('App listening at http://%s:%s', host, port);
});