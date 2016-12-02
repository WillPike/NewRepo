var express = require('express'),
    app = express(),
<<<<<<< HEAD
    bodyParser = require('body-parser'),
    errorHandler = require('errorhandler'),
    methodOverride = require('method-override'),
    hostname = process.env.HOSTNAME || '0.0.0.0',
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

var devCredentials;
devCredentials = require('./credentials.json').galaxies;

app.get('/', function(req, res) { res.redirect('/startup.html'); });
app.get('/empty.html', function(req, res) { res.render('empty', { devCredentials: devCredentials }); });
app.get('/flash.html', function(req, res) { res.render('flash', { devCredentials: devCredentials }); });
app.get('/reset.html', function(req, res) { res.render('reset', { devCredentials: devCredentials }); });
app.get('/startup.html', function(req, res) { res.render('startup', { devCredentials: devCredentials }); });
app.get('/snap_classic.html', function(req, res) { res.render('snap_classic', { devCredentials: devCredentials }); });
app.get('/snap_galaxies.html', function(req, res) { res.render('snap_galaxies', { devCredentials: devCredentials }); });
=======
    hostname = process.env.HOSTNAME || 'localhost',
    port = parseInt(process.env.PORT, 10) || 3000;

app.use(express.static(__dirname + '/www'));

app.get('/', function(req, res) { res.redirect('/index.html'); });
>>>>>>> 8caf959da8f7546d302bd5cbf5caaa778bf7334b

console.log("Server listening at http://%s:%s", hostname, port);
app.listen(port, hostname);
