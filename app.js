var express = require('express');
var app = express();
var marklogic = require("marklogic")
var conn = require("./env.js").connection
var db = marklogic.createDatabaseClient(conn)
var fs = require("fs")


app.engine('.html', require('ejs').__express);
app.set('views', __dirname);
app.set('view engine', 'html');

app.locals.barChartHelper = require('./public/bar_chart_helper');
var db = marklogic.createDatabaseClient(conn)
var q = marklogic.queryBuilder

app.use('/public', express.static(__dirname+'/public'));
app.get('/data', function(req, res) {
  var name = req.param('name');
  var query = db.query(q.where(q.collection("temporal")));
  query.result(function(r){
  	console.log(r);
  	return r;
  }).
  then(function(r){
  	console.log("redering....");
  	res.json(r);
  });
});

app.get('/', function(req, res) {
  res.sendfile(__dirname + '/index.html');
});


app.listen(3000);
console.log('listening on port 3000');
