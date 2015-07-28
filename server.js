var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    errorHandler = require('errorhandler'),
    methodOverride = require('method-override'),
    hostname = process.env.HOSTNAME || 'localhost',
    port = parseInt(process.env.PORT, 10) || 8080,
    publicDir = __dirname,
    bower = require('./bower.json');

app.use(methodOverride());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static(publicDir));
app.use(errorHandler({
  dumpExceptions: true,
  showStack: true
}));

app.set('views', './views');
app.set('view engine', 'jade');

app.locals.pretty = true;
app.set('bower', bower);

app.get('/', function(req, res) { res.redirect('/startup.html'); });
app.get('/startup.html', function(req, res) { res.render('startup'); });
app.get('/snap.html', function(req, res) { res.render('snap'); });

console.log("Server listening at http://%s:%s", hostname, port);
app.listen(port, hostname);
