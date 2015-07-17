/*global d3 */

function clearTextArea() {
  document.getElementById('contents').value = '';
}

function fillText(data, isEditing) {
  clearTextArea();
  var textArea = document.getElementById('contents');
  textArea.value += '{';
  var strToAdd;
  for (var property in data) {
    strToAdd = '';
    if (data.hasOwnProperty(property)) {
      if ((property === 'sysStart' || property === 'sysEnd') && isEditing) {
        data[property] = null;
      }
      if (textArea.value !== '{') { //Add a comma onto previous line, if not on the first item.
        strToAdd += ',';
      }
      strToAdd += '\n\"' + property + '\": '; //+ '\"'+ data[property] +'\"';
      if (data[property]) {
        strToAdd += '\"'+ data[property] + '\"';
      }
      else { // if the property has a null value then don't put quotes around it.
        strToAdd += data[property];
      }
        strToAdd += '\"'+ data[property] + '\"';
      }
      else { // if the property has a null value then don't put quotes around it.
        strToAdd += data[property];
      }
      textArea.value += strToAdd;
    }
  }
  textArea.value += '\n}';
  textArea.readOnly = !isEditing;

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
  $('#sysTimeDiv').addClass('hideSysTimeBoxes');
}

function save(chart) {
  data = document.getElementById('contents').value.replace(/\n/g, '');
  data = jQuery.parseJSON(data);

  var success = function() {
    alert('PUT call worked, closing textbox.');
    cancel(chart);
  };
  var fail = function(data) {
    alert('PUT didn\'t work: ' + data);
  };
  console.log('Saving');   //Only working on mac, bug filed with MarkLogic
  $.ajax({
    type: 'PUT',
    contentType: 'application/json',
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
  $('#sysStartVal').hide();
  $('#sysEndVal').hide();
  chart.setEditing(false);
  chart.setViewing(false);
  chart.setCurrentURI(undefined);
}

function view(uri) {
  if (uri) {
    setupTextArea(uri, false); //false so function knows the document is not being edited
    $('#sysTimeDiv').addClass('hideSysTimeBoxes');
  }
  else {
    alert('Please click a doc first');
  }
}

function edit(uri) {
  console.log('Editing ' + uri);
  if (uri) {
    setupTextArea(uri, true); //true so function knows the document is being edited
    $('#sysTimeDiv').removeClass('hideSysTimeBoxes');
  }
  else {
    alert('Please click a doc first');
  }
}

function deleteDoc(uri) {
  if (!uri) { // Not given a valid document uri
    uri = 'addr.json';
  }
  else {
    var lastPeriodLoc = uri.lastIndexOf('.');
    var firstPeriodLoc = uri.indexOf('.');
    if (lastPeriodLoc !== firstPeriodLoc) { //More than one '.', indicates a big number within uri.
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

function changeTextInGraph(chart, params) {
  var docProp = $('input[name = documentProperty]').val();
  if (docProp === '') {
    window.alert('Please enter a document property.');
  }
  else {
    getBarChart(params, docProp);
  }
}

var removeButtonEvents = function () {
  //Clear these buttons' previous event handlers
  $('#editButton').unbind('click');
  $('#deleteButton').unbind('click');
  $('#cancelButton').unbind('click');
  $('#viewButton').unbind('click');
  $('#saveButton').unbind('click');
  $('#change-prop').unbind('click');
};

var drawChart = function (params, docProp) {
  var chart = barChart()
    .data(params.data)
    .width(params.width)
    .height(params.height)
    .setDisplayProperty(docProp);

  var selector = '#' + params.containerId;
  d3.select(selector + ' .chart').remove();
  d3.select(selector).append('div').classed('chart', true).call(chart);

  return chart;
};

var getBarChart = function (params, docProp) {
  var chart = drawChart(params, docProp);

  removeButtonEvents();
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

  $('#change-prop').click(function() {
    changeTextInGraph(chart, params);
  });
};

