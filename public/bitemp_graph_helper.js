/*global d3 */

//var chart;
var getBarChart = function (params) {

 var chart = barChart()
    .data(params.data)
    .width(params.width)
    .height(params.height);

  d3.select('body').append('div').attr('id', params.containerId).call(chart);

  var selector = '#' + params.containerId;
  var svg = d3.select(selector).node().outerHTML;
  d3.select(selector).remove();

  return svg;
};

