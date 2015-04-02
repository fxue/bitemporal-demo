
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
  var name = req.param('collection') || 'temporal';
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
app.get('/update', function(req, res) {
   console.log("UPDATE...");
  // input/update temporal document
  var tempcol = req.param('collection') || 'temporal';
  var uri = req.param('uri') || '1.json';
  var vs = req.param('validstart');
  var ve = req.param('validend');
  var sys = req.param('system');
  if (vs != null) vs+="T00:00:00Z";
  if (ve != null) ve+="T00:00:00Z";
  if (sys != null) sys+="T00:00:00Z";

  var content = req.param('content');
  var newdoc = 
    { uri: uri,
      contentType: 'application/json',
      temporalCollection : tempcol,
      content: { 
        sysStart : null,
        sysEnd : null,
        valStart : vs,
        valEnd : ve,
        data : content
      },
      systemTime : sys
    };

  console.log("INGEST DOCS ",newdoc);

  db.documents.write(newdoc)
  .result(
    function(){
      res.json({"error":null,"doc":newdoc});
    },
    function(error) {
      console.log("INGEST ERROR",JSON.stringify(error));
      res.json({"error":error});
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
