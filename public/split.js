function parseData(data, collections)
{
  var split = data.split('--ML_BOUNDARY');
 
  console.log('split ' + split[1]);
 
  var items = [];
 
  for (var i=1; i < split.length -1; i=i+2)
  {
    var item =
    {
      category: null,
      content: null,
      contentLength: null,
      contentType: null,
      format: null,
      uri: null,
      collections: null
    };
 
    var matches = split[i].match(/Content-Type: ([\w\/]+)/);
    if(matches && matches[1])
    {
      item.contentType = matches[1];
    }
 
    var matches2 = split[i].match(/Content-Disposition: ([\w\/]+); filename="([^"]+)"; category=([\w\/]+); format=([\w\/]+)/);
    if(matches2 && matches2[2])
    {
      item.uri = matches2[2];
      if(matches2[3]) {
        item.category = matches2[3];
      }
      if(matches2[4]) {
        item.format = matches2[4];
      }
    }
 
    var matches3 = split[i].match(/Content-Length: ([\d]+)/);
    if(matches3 && matches3[1])
    {
      item.contentLength = matches3[1];
    }
 
    var matches4 = split[i+1].match(/({[^$]*})/);
    if(matches4 && matches4[1])
    {
      item.content = JSON.parse(matches4[1]);
    }
 
    var collArr = split[i].match(/({[^$]*})/);
    if(collArr && collArr[1])
    {
      item.collections = JSON.parse(collArr[0]);
    }
 
    items.push(item);
  }
  return items;
}