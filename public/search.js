var firstDoc;
var lastDoc;

//call to get the list of temporal collection
$.ajax(
  {
    url: "/manage/v2/databases/Documents/temporal/collections?format=json",
    success: function(response, textStatus)
    {
      console.log('got collections: ' + JSON.stringify(response));
      //adds names of the collections to the drop down list
      var addToDrop = $('#dropdown');
      //endpoint is the number of collections
      var endpoint = parseInt(response['temporal-collection-default-list']['list-items']['list-count'].value);

      //dropArray is the array containing all the temporal Collections
      var dropArray = [];
      for (var j = 0; j < endpoint; j++)
      {
        dropArray[j] = response['temporal-collection-default-list']['list-items']['list-item'][j].nameref;
      }
      //sorts the array (alphabetically) containing the temporal collections
      dropArray.sort();

      //this for loop appends the collection names to the drop down list
      for (var k = 0; k < dropArray.length; k++)
      {
        addToDrop.append($('<option>').text(dropArray[k])) ;
      }
    },
    error: function(jqXHR, textStatus, errorThrown)
    {
      console.log('problem');
    }
  });


//variable name for the bullet tag
var bullet = $('#bulletList');

//function when search button is clicked
$('#search').click(function()
  {
    firstDoc = 1;
    lastDoc = 10;
    $('#next').css({'visibility': 'visible'});
    $('#prev').css({'visibility': 'visible'});
    displayDocs(firstDoc, lastDoc);
  }
);

//function when the next button is clicked
$('#next').click(function()
  {
    firstDoc+=10;
    lastDoc+=10;
    displayDocs(firstDoc, lastDoc);
  }
);

//function when the prev button is clicked
$('#prev').click(function()
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
* @param start: the index of the first document you want to display
* @param end: the index of the last document you want to display (will always be 9 greater than start)
*/
function displayDocs( start, end)
{
  $('#bulletList').empty();
  var e = document.getElementById('dropdown');
  var selectedColl = e.options[e.selectedIndex].value;

  //call to get all documents (excluding .lsqt) from the collection selected in the drop down list
  var docs = $.ajax(
  {
    url: "/v1/search?structuredQuery={%20%22search%22:{%20%22query%22:{%20%22and-not-query%22:%20{%20%22positive-query%22:%20{%20%22collection-query%22:%20{%20%22uri%22:%20[%20%22"+selectedColl+"%22%20]%20}%20},%20%22negative-query%22:%20{%20%22collection-query%22:%20{%20%22uri%22:%20[%20%22lsqt%22%20]%20}%20}%20}%20},%20%22options%22:{%20%22search-option%22:[%22unfiltered%22]%20}%20}%20}&format=json&pageLength=10&category=content&category=collections&start="+start,
    headers:
    {
      'Accept': 'multipart/mixed'
    },
    success: onDisplayDocs,
    error: function(jqXHR, textStatus, errorThrown)
    {
      console.log('problem');
    }
  });

  function onDisplayDocs(data, textStatus, response)
  {
    console.log('got collections: ' + data);
    var totalDocLen = response.getResponseHeader('vnd.marklogic.result-estimate');
    if( totalDocLen > 0 )
    {
      docs = parseData(data, null, 2);
    }
    // Checks and sets boundary points.
    // Looks at the index of the first and last document (passed into the function)
    // and disables or enables the next/previous buttons based on those indexes.

    document.getElementById('prev').disabled = start <= 1;

    if( end >= totalDocLen)
    {
      document.getElementById('next').disabled = true;
      end = totalDocLen;
    }
    else
    {
      document.getElementById('next').disabled = false;
    }

    if (parseInt(totalDocLen) === 0)
    {
      document.getElementById('numDocs').innerHTML = start - 1 + ' to ' + end + ' of ' + totalDocLen;
    }
    else
    {
      document.getElementById('numDocs').innerHTML = start + ' to ' + end + ' of ' + totalDocLen;
    }

    //Loops through the documents to get the URI and the valid and system times
    //Calls functions to display the information on the search page
    for (var i=0; i < docs.length ; i++)
    {
      var uri = docs[i].uri;
      var uriLogical;
      var collArr = docs[i].collections.collections;
      for (var t = 0; t < collArr.length; t++)
      {
        if ( !collArr[t].includes( 'latest' ) && !collArr[t].includes(selectedColl))
        {
          uriLogical = collArr[t];
        }
      }
      bullet.append($("<hr id='break'>"));
      bullet.append($("<em id= 'physicalDoc'>").text(uri + '   '));
      bullet.append($("<a href = '/?collection="+uriLogical+"' id='links'>").text('('+uriLogical+')'));

      var sysStart = docs[i].content.sysStart;
      var sysEnd = docs[i].content.sysEnd;
      var validStart = docs[i].content.valStart;
      var validEnd = docs[i].content.valEnd;

      buildDate(new Date(validStart), new Date(validEnd), 'Valid Time: ', false);
      buildDate(new Date(sysStart), new Date(sysEnd), 'System Time: ', true);
    }
  }
}

/**
 * Appends the dates to the bullet list.
 *
 * @param start date: the starting date
 * @param end date: the end date
 * @param label: either 'System Time' or 'Valid Time'
 */
function buildDate( startDate, endDate, label )
{
  startDate = shortenDate( startDate );
  endDate = shortenDate( endDate );

  bullet.append($('<ul id="bold">').text(label));
  bullet.append( $('<ul>').text(startDate + ' -- ' + endDate));
  if ( label === 'System Time: ' )
  {
    bullet.append($('<p>').text(' '));
  }
}

/**
 * Shortens the date to only include the day, month, year, and time.
 * The time appears as hours, minutes, seconds, excluding 'GMT'
 *
 * @param date: the date to shorten
 */
function shortenDate( date )
{
  date = date.toString().split(' ');
  return  date[0]+'. '+date[1]+' '+date[2]+', '+date[3]+' '+date[4];
}

