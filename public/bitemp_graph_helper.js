/*global d3 */

var getBarChart = function (params) {

  var chart = barChart() 
    .data(params.data)
    .width(params.width)
    .height(params.height);
    
    
  
  var selector = '#' + params.containerId;
  d3.select(selector).call(chart);      
  
  $('#editButton').click(function() {
    console.log('chart = ' + chart.toString());
    console.log('chart.getURI(): ' + chart.getCurrentURI());
    edit(chart.getCurrentURI());
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

};
function save(chart) {
  console.log('Saving');   
 //How should the browser appearance behave here? ex. close edit box?
}

function view(uri) {
  console.log('viewing: ' + uri);
  if (uri) {
    setupTextArea(uri, false); //false so function knows the document is not being edited
  }
}

function edit(uri) {
  console.log('Editing ' + uri);
  if (uri) {
    setupTextArea(uri, true); //true so function knows the document is being edited
  }
};

function cancel(chart) {
  clearTextArea();
  $('#editButton').show();
  $('#viewButton').show();
  $('#cancelButton').hide();
  $('#contents').hide();
  $('#saveButton').hide();
  chart.setEditing(false);
  chart.setViewing(false);
  chart.setCurrentURI(undefined);
}

function setupTextArea(uri, isEditing) {
  $('#editButton').hide();
  $('#viewButton').hide();
  $('#cancelButton').show();
  $('#contents').show();
  if (isEditing) {
    $('#saveButton').show();
  }
   var successFunc = function(data) {
    console.log('Calling fill text, data = ' + data);
    fillText(data, isEditing);
  }
  $.ajax({
    url: 'http://localhost:3000/v1/documents/?uri=' + uri,
    success: successFunc,
    format: 'json'
  });            
}

function clearTextArea() {
  document.getElementById('contents').value = '';
}

function fillText(data, isEditing) {
  clearTextArea();
  
  var textArea = document.getElementById('contents');
  textArea.value += '{\n'; 
  for (var property in data) {
    if (data.hasOwnProperty(property)) {
      if ((property === 'sysStart' || property === 'sysEnd') && isEditing) {
        data[property] = null;
      }
      textArea.value += '\'' + property + '\': ' + '\''+data[property] +'\'\n';
    }
  }
  textArea.value += '}';
  textArea.readOnly = !isEditing;
} 
