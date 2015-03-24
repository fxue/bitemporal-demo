var chart;
var getBarChart = function (params) {

  chart = barChart()
  .data(params.data)
  .width(params.width)
  .height(params.height);

  d3.select('body').append('div').attr('id', params.containerId).call(chart);

  var selector = '#' + params.containerId;
  var svg = d3.select(selector).node().outerHTML;
  d3.select(selector).remove();

  return svg;
};

var updateBarChart = function (collection) {
 console.log("updating...")
 $.get( "/data?collection="+collection, function( data ) {
  chart.updateBarChartData(data);
});
};

