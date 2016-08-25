var PORT = 8000;
var NETWORK = 'localhost';

if (process.argv.length >= 2) {
  if(process.argv.indexOf('mobile') >= 2){
    NETWORK = '192.168.1.1';
  }
}

var express = require('express');
var app = express();

app.use(express.static('dist/main'));

var server = app.listen(PORT, NETWORK, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('App listening at http://%s:%s', host, port)

});