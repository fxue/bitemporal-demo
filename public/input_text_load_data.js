
/*takes a string of data returns an array of that data*/
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
    if(matches && matches[1]) {
      item.contentType = matches[1];
    }

    var matches2 = split[i].match(/Content-Disposition: ([\w\/]+); filename="([^"]+)"; category=([\w\/]+); format=([\w\/]+)/);
    var matches3 = split[i].match(/Content-Length: ([\d]+)/);
    var matches4 = split[i].match(/({[^$]*})/);

    if(matches2 && matches2[2]) {
      item.uri = matches2[2];
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

    if(item.content) {
      if (collection && (collection.indexOf('.') !== -1 && item.uri.substring(0, collection.indexOf('.')) === collection.substring(0, collection.indexOf('.'))) || collection === item.uri) {
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
    url: '/v1/search?pageLength=1000&format=json&collection='+collection,
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
        window.alert('Attention!\nNo data found in doc ' + collection); 
      }
    },
    error: function(jqXHR, textStatus, errorThrown) {
    // something went wrong. Take a look in jqXHR and find the status code
      if(textStatus === 'error') {
        window.alert('ERROR!\nThe status code is ' + jqXHR.statusCode() + '. The error thrown is ' + errorThrown);
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