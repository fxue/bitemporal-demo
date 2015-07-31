/*globals d3, jQuery, loadData, barChart */
var drawChart = function(params, docProp) {
  var chart;
  if( params.timeRanges ) {
    chart = barChart()
      .data(params.data)
      .width(params.width)
      .height(params.height)
      .xMin(params.timeRanges.sysStart)
      .xMax(params.timeRanges.sysEnd)
      .yMin(params.timeRanges.valStart)
      .yMax(params.timeRanges.valEnd)
      .setDisplayProperty(docProp);
  }
  else {
    chart = barChart()
      .data(params.data)
      .width(params.width)
      .height(params.height)
      .setDisplayProperty(docProp);
  }

  var selector = '#' + params.containerId;
  d3.select(selector + ' .chart').remove();
  d3.select(selector).append('div').classed('chart', true).call(chart);

  return chart;
};

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
      strToAdd += '\n\"' + property + '\": ';
      if (data[property]) {
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
  $('#sysTimeDiv').addClass('hideSysTimeBoxes');
}

function save(chart) {
  var data = document.getElementById('contents').value.replace(/\n/g, '');
  data = jQuery.parseJSON(data);

  if (document.getElementById('sysStartBox').value) {
    data.sysStart = document.getElementById('sysStartBox').value;
  }
  if (document.getElementById('sysEndBox').value) {
    data.sysStart = document.getElementById('sysEndBox').value;
  }

  var success = function() {
    window.alert('PUT call worked, closing textbox.');
    cancel(chart);
  };
  var fail = function(data) {
    window.alert('PUT didn\'t work: ' + data);
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

function view(uri) {
  if (uri) {
    setupTextArea(uri, false); //false so function knows the document is not being edited
    $('#sysTimeDiv').addClass('hideSysTimeBoxes');
  }
  else {
    window.alert('Please click a doc first');
  }
}

function edit(uri) {
  if (uri) {
    setupTextArea(uri, true); //true so function knows the document is being edited
    $('#sysTimeDiv').removeClass('hideSysTimeBoxes');
  }
  else {
    window.alert('Please click a doc first');
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
    url: 'http://localhost:3000/v1/documents/?temporal-collection=myTemporal&uri=' + uri, //Need to get actual collection of document
    type: 'DELETE',
    success: function() {
      console.log('Delete worked');
      loadData(uri);
    },
    error: function() {
      window.alert('Delete failed');
    },
    format: 'json'
  });
}

function changeTextInGraph(chart, params) {
  var docProp = $('input[name = documentProperty]').val();
  if (docProp === '') {
    window.alert('Please enter a document property.');
  }
  var propExists = false;

  for(var i = 0; i < params.data.length && !propExists; i++) {
    for(var prop in params.data[i].content) {
      if (params.data[i].content.hasOwnProperty(prop)) {
        if(prop === docProp) {
          propExists = true;
        }
      }
    }
  }
  if(propExists) {
    drawChart(params, docProp);
    getBarChart(params, docProp);
  }
  else {
    if(docProp !== '')	{
      window.alert('Sorry. That property does not exist in any document in the collection');
    }
  }
}

function addDataToMenu(chart, params) {
  if(!params.timeRanges) {
    console.log('DoesNOThaveTimeRanges');
    $('#select-prop').empty();
    var propsInGraph = {};
    propsInGraph['Choose a property'] = true;

    for(var i = 0; i < params.data.length; i++) {
      for(var prop in params.data[i].content) {
        if (params.data[i].content.hasOwnProperty(prop)) {
        	propsInGraph[prop] = true;
        }
      }
    }
    var select = document.getElementById('select-prop');

    for(var property in propsInGraph) {
      var opt = property;
      var el = document.createElement('option');
      el.textContent = opt;
      el.value = opt;
      select.appendChild(el);
    }
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
  $('#select-prop').unbind('change');
};

function initButtons() {
  document.getElementById('editButton').disabled = true;
  document.getElementById('deleteButton').disabled = true;
  document.getElementById('viewButton').disabled = true;
  document.getElementById('selectedURI').innerHTML = 'Selected URI: ' + 'null'.bold();
}

var getBarChart = function (params, docProp) {
  var chart = drawChart(params, docProp);
  if(docProp) {
    chart = drawChart(params, docProp);
  }
  else {
    chart = drawChart(params, null);
  }

  if (params) {
    addDataToMenu(chart, params);
  }
  removeButtonEvents();
  if( params.timeRanges === null) {
    initButtons();
  }

  $('#editButton').click(function() {
    edit(chart.getCurrentURI());
    chart.setEditing(true);
  });

  $('#deleteButton').click(function() {
    deleteDoc(chart.getCurrentURI(),chart.get);
  });

  $('#cancelButton').click(function() {
    cancel(chart);
  });

  $('#viewButton').click(function() {
    view(chart.getCurrentURI());
    chart.setViewing(true);
  });

  $('#saveButton').click(function() {
    save(chart);
  });

  $('#change-prop').click(function() {
    changeTextInGraph(chart, params);
  });

  $('#select-prop').change(function() {
    var selectedText = $(this).find('option:selected').text();
    drawChart(params, selectedText);
    getBarChart(params, selectedText);
  });
};
