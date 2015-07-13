var firstDoc;
var lastDoc;

//call to get the list of temporal collection
$.ajax(
  {
    url: "/manage/v2/databases/Documents/temporal/collections?format=json",
    success: function(response, textStatus) {
      //console.log('got collections: ' + JSON.stringify(response));
      //adds names of the collections to the drop down list
      var addToDrop = $("#dropdown");
      //endpoint is the number of collections
      var endpoint = parseInt(response["temporal-collection-default-list"]["list-items"]["list-count"]["value"]);

      //dropArray is the array containing all the temporal Collections
      var dropArray = [];
      for (var i = 0; i < endpoint; i++) {
        dropArray[i] = response["temporal-collection-default-list"]["list-items"]["list-item"][i]["nameref"];
      }
      //sorts the array (alphabetically) containing the temporal collections
      dropArray.sort();

      //this for loop appends the collection names to the drop down list
      for (var i = 0; i < dropArray.length; i++)
      {
        addToDrop.append($("<option>").text(dropArray[i])) ;
      }
    },
    error: function(jqXHR, textStatus, errorThrown) {
      //console.log('problem');
    }
  });


//variable name for the bullet tag
var bullet = $("#bulletList");

//function when search button is clicked
$("#search").click(function(){
  firstDoc = 0;
  lastDoc = 10;
  $("#next").css({"visibility": "visible"});
  $("#prev").css({"visibility": "visible"});
  displayDocs(firstDoc, lastDoc);
});

//function when the next button is clicked
$("#next").click(function()
  {
    firstDoc+=10;
    lastDoc+=10;
    displayDocs(firstDoc, lastDoc);
  }
);

//function when the prev button is clicked
$("#prev").click(function()
  {
      firstDoc-=10;
      lastDoc-=10;
      displayDocs(firstDoc, lastDoc);
  }
);

/**
* Display docs is a function that displays the physical and logcial documents
* corresponding to the collection selected in the dropdown box.
* For each document the System and Valid times are displayed
*
* Note: We create an array of all physical and logical documents, in order
*       to be able to display a range of documents (so we have only 10 documents
*       appearing per page)
*
* @param start: the index of the first document you want to display
* @param end: the index of the last document you want to display
*/
function displayDocs( start, end)
{
  $("#bulletList").empty();
  var e = document.getElementById("dropdown");
  var selectedColl = e.options[e.selectedIndex].value;

  //call to get all documents (excluding .lsqt) from the collection selected in the drop down list
  var docs = $.ajax(
  {
    url: "/v1/search?structuredQuery={%20%22search%22:{%20%22query%22:{%20%22and-not-query%22:%20{%20%22positive-query%22:%20{%20%22collection-query%22:%20{%20%22uri%22:%20[%20%22"+selectedColl+"%22%20]%20}%20},%20%22negative-query%22:%20{%20%22collection-query%22:%20{%20%22uri%22:%20[%20%22lsqt%22%20]%20}%20}%20}%20},%20%22options%22:{%20%22search-option%22:[%22unfiltered%22]%20}%20}%20}&format=json&pageLength=10&category=content&category=collections&start="+start,
    headers: {
      'Accept': 'multipart/mixed'
    },
    success: onDisplayDocs,
    error: function(jqXHR, textStatus, errorThrown) {
      //console.log('problem');
    }
  });

  function onDisplayDocs(data, textStatus)
  {
    console.log('got collections: ' + data);
    docs = parseData(data, null);
    console.log( docs );

    //Checks and sets boundary points.
    //Looks at the index of the first and last document (passed into the function)
    //and disables or enables the next/previous buttons based on those indexes.
    if( start <= 1 )
    {
      document.getElementById("prev").disabled = true;
    }
    else
    {
      document.getElementById("prev").disabled = false;
    }

    if( end >= docs.length)
    {
      document.getElementById("next").disabled = true;
      end = docs.length;
    }
    else
    {
      document.getElementById("next").disabled = false;
    }

    var docLen = docs.length;
    if (docLen === 0) {
      document.getElementById("numDocs").innerHTML = start + " to " + end + " of " + docLen;
    }
    else {
      document.getElementById("numDocs").innerHTML = start + 1 + " to " + end + " of " + docLen;
    }
    //adds all document URI's into an array, in order to display the results alphabetically sorted
    var uriArray = [];
    var uriLogical;
    for (var k = 0; k < docs.length; k++) {
      uriArray[k] = docs[k].uri;

    }
    uriArray.sort();

    //nested for loop to loop through the different URI's in the sorted array of URI's, and add the URI to the bullet list.
    //then under each uri the system start, system end, valid start, valid end times will be displayed
    //NOTE: this outer loop will not display every URI in the array, it only displays a specified range
    for (var i=start; i < end ; i++)
    {
       var uri = uriArray[i];
       var uriLogical;

       var varToUse;
       for( var k = 0; k < docs.length; k++)
       {
        if( uri === docs[k].uri )
        {
          varToUse=k;
        }
       }

       var collArr = docs[varToUse].collections.collections;
       console.log( collArr.length );
       //gets the name of the logical for each physical document
       for (var t = 0; t < collArr.length; t++) {
         if ( !collArr[t].includes( "latest" ) && !collArr[t].includes( selectedColl ) )
         {

           uriLogical = collArr[t];

           console.log("URI LOGICAL" + uriLogical);
         }
       }
       bullet.append($("<hr id='break'>"));
       bullet.append($("<em id= 'physicalDoc'>").text(uri + "   "));
       bullet.append($("<a href = 'index' id='links'>").text("("+uriLogical+")"));

      var dateArray = [];
      for( var j = 0; j < docs.length; j++)
      {
        if( uri === docs[j].uri)
        {
          console.log(docs[j].uri);
          console.log(uriLogical);

          //dateArray = docs[j].content[0].split(" ");
          var sysStart = docs[j].content.sysStart;
          var sysEnd = docs[j].content.sysEnd;
          var validStart = docs[j].content.valStart;
          var validEnd = docs[j].content.valEnd;

          buildDate(new Date(validStart), new Date(validEnd), 'Valid Time: ', false);
          buildDate(new Date(sysStart), new Date(sysEnd), 'System Time: ', true);
        }
      }
    }
  }
}

function buildDate( startDate, endDate, label )
{
  startDate = shortenDate( startDate );
  endDate = shortenDate( endDate );

  bullet.append($('<ul id="bold">').text(label));
  bullet.append( $('<ul>').text(startDate + ' -- ' + endDate));
  if ( label === 'System Time: ' ) {
    bullet.append($('<p>').text(' '));
  }
}

function shortenDate( date )
{
  date = date.toString().split(' ');
  return  date[0]+'. '+date[1]+' '+date[2]+', '+date[3]+' '+date[4];
}

