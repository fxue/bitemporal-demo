# bitemporal-demo

This is a visualization app to show how MarkLogic bitemporal works.

You need node to run the app with node app.js

Dependencies under node_modules: d3,ejs,express,marklogic,moment

X axis - System time : represents when document is true for the database
Y axis - Valid time : represents when document is true in the real world / business logic

Each box represents a document version.

You can configure the server with the following:

1. First create element range index : valStart valEnd sysStart sysEnd
2. create axis
declareUpdate();
var temporal=require("/MarkLogic/temporal.xqy");
 
temporal.axisCreate("valid",
       cts.elementReference("valStart"),cts.elementReference("valEnd"))
temporal.axisCreate("system",
      cts.elementReference("sysStart"),cts.elementReference("sysEnd"))// query
      
3. create collection

declareUpdate();
var temporal=require("/MarkLogic/temporal.xqy");
 
temporal.collectionCreate("temporal","system","valid");

4. Refer to the workspace file for an example walk through
