var express = require('express'),
    app = express(),
    hostname = process.env.HOSTNAME || 'localhost',
    port = parseInt(process.env.PORT, 10) || 3000;

app.use(express.static(__dirname + '/www'));

app.get('/', function(req, res) { res.redirect('/index.html'); });

console.log("Server listening at http://%s:%s", hostname, port);
app.listen(port, hostname);
