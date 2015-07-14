
/* takes a string containing a multipart/mixed response from MarkLogic and a collection name like addr.json and returns an array of objects representing physical documents.*/
function parseData(data, collection) {
  var split = data.split('--ML_BOUNDARY');
  var items = [];

  for (var i=0; i < split.length; i++) {
    var item = {
      category: null,
      content: null,
      contentLength: null,
      contentType: null,
      format: null,
      uri: null
    };

    var matches = split[i].match(/Content-Type: ([\w\/]+)/);
    var matches2 = split[i].match(/Content-Disposition: ([\w\/]+); filename="([^"]+)"; category=([\w\/]+); format=([\w\/]+)/);
    var matches3 = split[i].match(/Content-Length: ([\d]+)/);
    var matches4 = split[i].match(/({[^$]*})/);

    if(matches && matches[1]) {
      item.contentType = matches[1];
    }
    if(matches2) {
      if(matches2[2]) {
        item.uri = matches2[2];
      }
      if(matches2[3]) {
        item.category = matches2[3];
      }
      if(matches2[4]) {
        item.format = matches2[4];
      }
    }
    if(matches3 && matches3[1]) {
      item.contentLength = matches3[1];
    }  
    if(matches4 && matches4[1]) {
      item.content = JSON.parse(matches4[1]);
    }
/*
Before pushing an item to the array items, the conditional checks to see that 
1.) the physical document has some content/data (not null)
and either 
   2.) collection is not null AND the collection's substring up to the '.' matches the substring of the physical doc's uri up to the '.'. So 'addr.json' would match 'addr.48329578923.json', since 'addr' matches 'addr'.
   OR
   3.) collection is not null AND matches the file name of the physical doc. so 'addr.json' matches 'addr.json'

If the condition is met, then push to the array. 
*/
    if(item.content) {
      if (collection && ((collection.indexOf('.') !== -1 && item.uri.substring(0, collection.indexOf('.')) === collection.substring(0, collection.indexOf('.'))) || collection === item.uri)) {
        items.push(item);
      }
    }
  }

  return items;
}

function loadData(collection) {
  var url = '';
  if (collection !== undefined) {
    url += '/' + collection;
  }
  else {
    collection = 'addr.json';
  }
  $.ajax({
    url: '/v1/search?pageLength=1000',
    data: {
      format: 'json',
      collection: collection
    },
    type: 'POST',
    headers: {
      Accept: 'multipart/mixed'
    },
    success: function ( data ) { 
      var arrData = parseData(data, collection);
      getBarChart({
        data: arrData,
        width: 800,
        height: 600,
        xAxisLabel: 'System',
        yAxisLabel: 'Valid',
        containerId: 'bar-chart-large'
      });
      if(arrData.length === 0 && url !== '') {
        window.alert('Attention!\n\nNo data found in document ' + collection);
      }
    },
    error: function(jqXHR, textStatus, errorThrown) {
    // something went wrong. Take a look in jqXHR and find the status code
      if(textStatus === 'error') {
        window.alert('ERROR!\n\nThe error status is ' + jqXHR.status + '. The error thrown is ' + errorThrown + '.');
        return false;
      }
    }
  }); 
}

loadData();

$('#pick-doc').click( function() {
  var uriCollection = $('input[name = collection]').val();
  if(uriCollection === '') {
    window.alert('Please enter a uri.');
  }
  else {
    loadData(uriCollection);
  }
});





