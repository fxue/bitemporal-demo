      var firstDoc;
      var lastDoc;

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

      var dropArray = [];
      for (var i = 0; i < endpoint; i++) {
        dropArray[i] = response["temporal-collection-default-list"]["list-items"]["list-item"][i]["nameref"];
      }
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

      $("#next").click(function()
        {
          firstDoc+=10;
          lastDoc+=10;
          displayDocs(firstDoc, lastDoc);
        }
      );

      $("#prev").click(function()
        {
            firstDoc-=10;
            lastDoc-=10;
            displayDocs(firstDoc, lastDoc);
        }
      );

      function displayDocs( start, end)
      {
        $("#bulletList").empty();
        var e = document.getElementById("dropdown");
        var selectedColl = e.options[e.selectedIndex].value;

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

        //checks and sets boundary points
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


        var uriArray = [];
        for (var k = 0; k < docs.total; k++) {
          uriArray[k] = docs['results'][k]['uri'];
        }
        uriArray.sort();

        //nested for loop to loop through the different URI's in the JSON file, and add the URI to the bullet list.
        //then under each uri the system start, system end, valid start, valid end times will be displayed
        for (var i=start; i <= end-1; i++)
        {

           var strLink = uriArray[i];
           var docCollection = $.ajax(
            {
              url: "http://localhost:3000/v1/documents?uri="+strLink+"&category=collections&format=json",
                success: function(data, textStatus) {
                console.log('got collections: ' + data);
              },
              error: function(jqXHR, textStatus, errorThrown) {
                console.log('problem');
              },
              async: false,
            });

           docCollection = JSON.parse(docCollection.responseText);

           var logicalDoc;
           var collectArray = docCollection.collections;
           for (var t = 0; t < collectArray.length; t++) {
             if (!collectArray[t].includes("latest") && !collectArray[t].includes(selectedColl))
             {
               logicalDoc = collectArray[t];
             }
           }
           bullet.append($("<hr id='break'>"));
           bullet.append($("<em id= 'physicalDoc'>").text(strLink + "   "));
           bullet.append($("<a href = 'index' id='links'>").text("("+logicalDoc+")"));
           
          var dateArray = [];
          for( var getDocs = 0; getDocs < docs.total; getDocs++)
          {
            if( strLink === docs["results"][getDocs]["uri"])
            {
              dateArray = docs["results"][getDocs]["matches"][0]["match-text"][0].split(" ");
            }
          }
        
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
              var endDate = new Date(dateArray[j+1])
              var strStart= startDate.toString().replace( "GMT-0800 (Pacific Standard Time)", "");
              var strEnd = endDate.toString().replace( "GMT-0800 (Pacific Standard Time)", "");

              bullet.append($("<ul id='bold'>").text(times));
              bullet.append( $("<ul>").text(strStart + "-- " + strEnd));
              if (times === "System Time: ") {
                bullet.append($("<p>").text(" "));
              }
           }
        }
      }
    