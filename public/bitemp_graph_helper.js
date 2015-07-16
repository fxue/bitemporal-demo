/*global d3 */

function clearTextArea() {
  document.getElementById('contents').value = '';
}

function fillText(data, isEditing) {
  clearTextArea();
  var textArea = document.getElementById('contents');
  textArea.value += '{';
  for (var property in data) {
    if (data.hasOwnProperty(property)) {
      if ((property === 'sysStart' || property === 'sysEnd') && isEditing) {
        data[property] = null;
      }
      if (textArea.value === '{') {
        textArea.value += '\n\"' + property + '\": ' + '\"'+ data[property] +'\"';
      }
      else {
        textArea.value += ',\n\"' + property + '\": ' + '\"'+ data[property] +'\"';
      }
    }
  }
  textArea.value += '\n}';
  textArea.readOnly = !isEditing;
  
}

function save(chart) {
  data = document.getElementById('contents').value.replace(/\n/g, '');
  data = jQuery.parseJSON(data);
  console.log('Here\'s the parsed data object: ');
  console.log(data);

  var success = function() {
    alert('PUT call worked, closing textbox.');
    cancel(chart);
  };
  var fail = function(data) {
    alert('PUT didn\'t work: ' + data);
  };
  console.log('Saving');   // Almost close to working
  $.ajax({
    type: 'PUT',
    contentType: "application/json",
    url: 'http://localhost:3000/v1/documents/?uri=' + chart.getCurrentURI()+'&temporal-collection=myTemporal',
    processData: false,
    data: JSON.stringify(data),
    success: success,
    error: fail
  });
}

function setupTextArea(uri, isEditing) {
  $('#editButton').hide();
  $('#viewButton').hide();
  $('#deleteButton').hide();
  $('#cancelButton').show();
  $('#contents').show();
  if (isEditing) {
    $('#saveButton').show();
  }
   var successFunc = function(data) {
    console.log('Calling fill text, data = ' + data);
    fillText(data, isEditing);
  };
  $.ajax({
    url: 'http://localhost:3000/v1/documents/?uri=' + uri,
    success: successFunc,
    format: 'json'
  });

}


function cancel(chart) {
  clearTextArea();
  $('#editButton').show();
  $('#viewButton').show();
  $('#deleteButton').show();
  $('#cancelButton').hide();
  $('#contents').hide();
  $('#saveButton').hide();
  chart.setEditing(false);
  chart.setViewing(false);
  chart.setCurrentURI(undefined);
}

function view(uri) {
  if (uri) {
    setupTextArea(uri, false); //false so function knows the document is not being edited
  }
  else {
    alert('Please click a doc first');
  }
}

function edit(uri) {
  console.log('Editing ' + uri);
  if (uri) {
    setupTextArea(uri, true); //true so function knows the document is being edited
  }
  else {
    alert('Please click a doc first');
  }
}

function deleteDoc(uri) {
  var origUri = uri;
  if (!uri) { // Not given a valid document uri
    uri = 'addr.json';
  }
  else {
    var lastPeriodLoc = uri.lastIndexOf('.');
    var firstPeriodLoc = uri.indexOf('.');
    if (lastPeriodLoc !== firstPeriodLoc) { //More than '.', indicates a big number within uri.
      uri = uri.substring(0, firstPeriodLoc) + uri.substring(lastPeriodLoc, uri.length); // Remove the big number.
    }
  }
  $.ajax({
    url: 'http://localhost:3000/v1/documents/?temporal-collection=myTemporal&uri=' + uri,
    type: 'DELETE',
    success: function() {
      console.log('Delete worked');
      loadData(uri);
    },
    error: function() {
      alert('Delete failed');
    },
    format: 'json'
  });
}

var getBarChart = function (params) {

  var chart = barChart()
    .data(params.data)
    .width(params.width)
    .height(params.height);

  var selector = '#' + params.containerId;
  d3.select(selector + ' .chart').remove();
  var chartDiv = d3.select(selector).append('div').classed('chart', true).call(chart);
  
  $('#editButton').click(function() {
    edit(chart.getCurrentURI());
  });

  $('#deleteButton').click(function() {
    deleteDoc(chart.getCurrentURI());
  });

  $('#cancelButton').click(function() {
    cancel(chart);
  });
  
  $('#viewButton').click(function() {
    view(chart.getCurrentURI());
  });
  
  $('#saveButton').click(function() {
    save(chart);
  });

  //return svg;
};

