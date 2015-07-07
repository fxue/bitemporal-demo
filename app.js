
var request = require('request');

/* express set up */
var express = require('express');
var app = express();
app.engine('.html', require('ejs').__express);
app.set('views', __dirname);
app.set('view engine', 'html');

/* MarkLogic set up */
var marklogic = require('marklogic');
var conn = require('./env.js').connection;
var db = marklogic.createDatabaseClient(conn);
var q = marklogic.queryBuilder;

function proxy(req, res) {
  var queryString = req.originalUrl.split('?')[1];
  console.log(req.method + ' ' + req.path + ' proxied to ' + conn.host + ':' + conn.port + req.path + (queryString ? '?' + queryString : ''));
  var mlReq = request({
    uri: 'http://' + conn.host + ':' + conn.port + req.originalUrl,
    method: req.method,
    path: req.path + (queryString ? '?' + queryString : ''),
    headers: req.headers,
    auth: {
      user: conn.user,
      password: conn.password,
      sendImmediately: false
    }
  }, function(error, message, response) {
    if (message.statusCode >= 300) {
      console.log('Error!\n' + response);
    }
  }).on('data', function(chunk) {
    res.write(chunk);
  });

  if (req.body !== undefined) {
    mlReq.write(JSON.stringify(req.body));
    mlReq.end();
  }
}

function getData(collection, res) {
  // query database for documents to be shown
  // use localhost:3000/data?collection=***
  var query = db.documents.query(q.where(q.collection(collection)));
  query.result(function(r){
    var i;
    // get result and log all uris
    console.log('GET DOCS from collection =' + collection);
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
  getData('addr.json', res);
});
app.get('/data/:collection', function(req, res) {
  getData(req.param('collection'), res);
});

app.all('/v1*', function(req, res){
  proxy(req, res);
});

app.all('/manage/*', function(req, res){
  proxy(req, res);
});

app.get('/delete', function(req, res) {
  // delete temporal document
  // TODO add your code here...

});

app.get('/', function(req, res) {
  res.sendfile(__dirname + '/index.html');
});

app.get('/index', function(req, res) {
  res.sendfile(__dirname + '/index.html');
});

app.get('/search', function(req, res) {
  res.sendfile(__dirname + '/search.html');
});



/* start listening */
app.listen(3000);
console.log('listening on port 3000');




