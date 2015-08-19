var request = require('request');

/* express set up */
var express = require('express');
var app = express();
app.engine('.html', require('ejs').__express);

app.set('views', __dirname);
app.set('view engine', 'html');

/* MarkLogic set up */
var marklogic = require('marklogic');
var conn;
try {
  conn = require('./local-env.js').connection;
} catch (e) {
  conn = require('./env.js').connection;
}
var db = marklogic.createDatabaseClient(conn);
var q = marklogic.queryBuilder;

// Proxy requests to the MarkLogic REST API
function proxy(req, port, res) {

  var queryString = req.originalUrl.split('?')[1];
  console.log(req.method + ' ' + req.path + ' proxied to ' + conn.host + ':' + port + req.path + (queryString ? '?' + queryString : ''));

  var headers = req.headers;
  if (port === 8002) {
    // TODO: The /manage/v2/databases/Documents/temporal/collections has been
    // giving an HTML useless response to this when queried from jQuery. After
    // switching user-agent to pretend to be curl, it's fine. Not clear why.
    headers['user-agent'] = 'curl/7.37.1';
  }

  var mlReqOptions = {
    uri: 'http://' + conn.host + ':' + port + req.originalUrl,
    method: req.method,
    path: req.path + (queryString ? '?' + queryString : ''),
    headers: headers,
    auth: {
      user: conn.user,
      password: conn.password,
      sendImmediately: false
    }
  };

  if (req.headers['content-type'] === 'application/json') {
    mlReqOptions.json = true;
  }

  var mlReq = request(mlReqOptions);

  req.pipe(mlReq).pipe(res);

  mlReq.on('error', function(error) {
    console.log('error: ' + error);
  });
}

function getData(collection, res) {
  // query database for documents to be shown
  // use localhost:3000/data?collection=***
  var query = db.documents.query(q.where(q.collection(collection)));
  query.result(function(r){
    var i;
    // get result and log all uris
    console.log('GET DOCS from collection = ' + collection);
    console.log('result =');
    for (i=0; i<r.length; i++) {
      console.log(r[i].uri);
    }
    return r;
  }).
  then(function(r){
    // send json back to http response
    console.log('rendering....');
    res.json(r);
  });
}

/* use Express as http server */
app.use('/public', express.static(__dirname+'/public'));

app.get('/data', function(req, res) {
  getData( 'addr.json' , res);
});

app.get('/data/:collection', function(req, res) {
  getData(req.param('collection'), res);
});

app.all('/v1*', function(req, res){
  proxy(req, conn.port, res);
});

app.all('/manage/*', function(req, res){
  proxy(req, 8002, res);
});

app.get('/delete', function(req, res) {
  // delete temporal document
  // TODO add your code here...

});

app.get('/', function(req, res) {
  res.sendfile(__dirname + '/index.html');
});

app.get('/search', function(req, res) {
  res.sendfile(__dirname + '/search.html');
});

/* start listening */
app.listen(3000);
console.log('listening on port 3000');




