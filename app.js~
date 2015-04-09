
/* express set up */
var express = require('express');
var app = express();
app.engine('.html', require('ejs').__express);
app.set('views', __dirname);
app.set('view engine', 'html');

/* MarkLogic set up */
var marklogic = require("marklogic")
var conn = require("./env.js").connection
var db = marklogic.createDatabaseClient(conn)
var q = marklogic.queryBuilder

/* use Express as http server */
app.use('/public', express.static(__dirname+'/public'));
app.get('/data', function(req, res) {
  // query database for documents to be shown
  // use localhost:3000/data?collection=***
  var name = req.param('collection') || 'myTemporal';
  var query = db.documents.query(q.where(q.collection(name)));
  query.result(function(r){
  	// get result and log all uris
    console.log("GET DOCS from collection =",name);
    console.log("result =");
    for (i=0; i<r.length; i++) 
      console.log(r[i].uri);
  	return r;
  }).
  then(function(r){
    // send json back to http response
  	console.log("redering....");
  	res.json(r);
  });
});
app.get('/delete', function(req, res) {
  // delete temporal document
  // TODO add your code here...

});
app.get('/', function(req, res) {
  res.sendfile(__dirname + '/index.html');
});

/* start listening */
app.listen(3000);
console.log('listening on port 3000');
