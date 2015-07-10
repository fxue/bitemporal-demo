  var firstDoc;
  var lastDoc;

  //call to get the list of temporal collection
  var response = $.ajax(
    {
      url: "/manage/v2/databases/Documents/temporal/collections?format=json",
      success: function(data, textStatus) {
        console.log('got collections: ' + data);
      },
      error: function(jqXHR, textStatus, errorThrown) {
        console.log('problem');
      },
      async: false
    });

  response = JSON.parse( response.responseText );

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
      url: "http://localhost:3000/v1/search?structuredQuery={%20%22search%22:{%20%22query%22:{%20%22and-not-query%22:%20{%20%22positive-query%22:%20{%20%22collection-query%22:%20{%20%22uri%22:%20[%20%22"+selectedColl+"%22%20]%20}%20},%20%22negative-query%22:%20{%20%22collection-query%22:%20{%20%22uri%22:%20[%20%22lsqt%22%20]%20}%20}%20}%20},%20%22options%22:{%20%22search-option%22:[%22unfiltered%22]%20}%20}%20}&format=json&pageLength=1000",
        success: function(data, textStatus) {
        console.log('got collections: ' + data);
      },
      error: function(jqXHR, textStatus, errorThrown) {
        console.log('problem');
      },
      async: false,
    });
    docs = JSON.parse( docs.responseText );

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

    if( end >= docs.total)
    {
      document.getElementById("next").disabled = true;
      end = docs.total;
    }
    else
    {
      document.getElementById("next").disabled = false;
    }

    var docLen = docs.total;
    document.getElementById("numDocs").innerHTML = start.toString() + " to " + end.toString() + " of " + docLen;

    //adds all document URI's into an array, in order to display the results alphabetically sorted
    var uriArray = [];
    for (var k = 0; k < docs.total; k++) {
      uriArray[k] = docs['results'][k]['uri'];
    }
    uriArray.sort();

    //nested for loop to loop through the different URI's in the sorted array of URI's, and add the URI to the bullet list.
    //then under each uri the system start, system end, valid start, valid end times will be displayed
    //NOTE: this outer loop will not display every URI in the array, it only displays a specified range 
    for (var i=start; i < end; i++)
    {
       var uri = uriArray[i];
       //getting a list of collections the document belongs to for each URI
       var docColl = $.ajax(
        {
          url: "http://localhost:3000/v1/documents?uri="+uri+"&category=collections&format=json",
            success: function(data, textStatus) {
            console.log('got collections: ' + data);
          },
          error: function(jqXHR, textStatus, errorThrown) {
            console.log('problem');
          },
          async: false,
        });

       docColl = JSON.parse(docColl.responseText);

       var uriLogical;
       var collArr = docColl.collections;
       //gets the name of the logical for each physical document
       for (var t = 0; t < collArr.length; t++) {
         if (!collArr[t].includes( "latest" ) && !collArr[t].includes( selectedColl ) )
         {
           uriLogical = collArr[t];
         }
       }
       bullet.append($("<hr id='break'>"));
       bullet.append($("<em id= 'physicalDoc'>").text(uri + "   "));
       bullet.append($("<a href = 'index' id='links'>").text("("+uriLogical+")"));
       
      var dateArray = [];
      for( var getDocs = 0; getDocs < docs.total; getDocs++)
      {
        if( uri === docs["results"][getDocs]["uri"])
        {
          dateArray = docs["results"][getDocs]["matches"][0]["match-text"][0].split(" ");
        }
      }
    
      //loops through the Dates for each document and displays them on the page under the URI
      for( var j = 0; j < dateArray.length-1; j=j+2)
       { 
          var times = "";
          if (j===0)
          {
            times = "Valid Time: ";
          }
          else
          {
            times = "System Time: ";
          }

          var startDate = new Date(dateArray[j]);
          var endDate = new Date(dateArray[j+1]);

          startDate = startDate.toString().split(" ");
          endDate = endDate.toString().split(" ");

          startDate = startDate[0]+". "+startDate[1]+" "+startDate[2]+", "+startDate[3];
          endDate = endDate[0]+". "+endDate[1]+" "+endDate[2]+", "+endDate[3];

          bullet.append($("<ul id='bold'>").text(times));
          bullet.append( $("<ul>").text(startDate + " -- " + endDate));
          if (times === "System Time: ") {
            bullet.append($("<p>").text(" "));
          }
       }
    }
  }