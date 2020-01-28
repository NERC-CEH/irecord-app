const PORT = process.env.PORT || 8000;
const express = require('express');
const fallback = require( 'express-history-api-fallback');

const app = express();

app.use(express.static('dist/main'));
app.use(express.static('other/'));

app.use(fallback('index.html', { root: 'dist/main' })); // BrowserHistory router

const server = app.listen(PORT, () => {
  const host = server.address().address;
  const port = server.address().port;

  console.log('App listening at http://%s:%s', host, port);
});
