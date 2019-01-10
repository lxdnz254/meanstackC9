var express = require('express');
var wagner = require('wagner-core');
var bodyParser = require('body-parser');
var mongodb = require('mongodb');

require('./models')(wagner);
require('./dependencies')(wagner);

var app = express();

app.use(bodyParser.json());

app.use(function(req, res, next) {
	res.append('Access-Control-Allow-Origin', req.headers.origin || '*');
	res.append('Access-Control-Allow-Credentials', 'true');
	res.append('Access-Control-Allow-Methods', 'GET, OPTIONS, PUT, POST');
	res.append('Access-Control-Allow-Headers',
		'Origin, X-Requested-With, Content-Type, Accept');
	next();
});

app.use(require('morgan')("combined"));

wagner.invoke(require('./auth'), { app: app });

app.use('/api/v1', require('./api')(wagner));

// Serve up static HTML pages from the file system.
// For instance, '/6-examples/hello-http.html' in
// the browser will show the '../6-examples/hello-http.html'
// file.
app.use(express.static('myApp/www/', { maxAge: 4 * 60 * 60 * 1000 /* 2hrs */ }));


// Initialize the app.
var server = app.listen(process.env.PORT || 8080, function () {
	var port = server.address().port;
	console.log("App now running on port", port);
});

