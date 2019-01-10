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

// Create a database variable outside of the database connection callback to reuse the connection pool in your app.
var db;

// Connect to the database before starting the application server.
mongodb.MongoClient.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/test", function (err, client) {
  if (err) {
    console.log(err);
    process.exit(1);
  }

  // Save database object from the callback for reuse.
  db = client.db();
  console.log("Database connection ready");

  // Initialize the app.
  var server = app.listen(process.env.PORT || 8080, function () {
    var port = server.address().port;
    console.log("App now running on port", port);
  });
});
