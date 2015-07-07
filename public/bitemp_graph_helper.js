/*global d3 */

var chart;
var getBarChart = function (params) {

  chart = barChart()
    .data(params.data)
    .width(params.width)
    .height(params.height);

  var selector = '#' + params.containerId;
  d3.select(selector).call(chart);

};
