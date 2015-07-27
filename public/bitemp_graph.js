/*global d3, moment */

function showCurrURI(uri) {
  document.getElementById('selectedURI').innerHTML = 'Selected URI: ' + uri.bold();
}

var barChart = function() {
  // default values for configurable input parameters
  var width = 600;
  var height = 300;
  var uri, isEditing, isViewing;
  var xMin = null;
  var xMax = null;
  var yMin = null;
  var yMax = null;
  var displayProperty = '';
  var lastDoc;
  var displayedProps = [];

  var margin = {
    top: 10,
    right: 0,
    bottom: 100,
    left: 100
  };
  var xAxisLabel = 'System Time';
  var yAxisLabel = 'Valid Time';

  var color =
    d3.scale.category10();

  var xScale, xAxis, xAxisCssClass;
  var yScale, yAxis, g;
  var axisLabelMargin;

  var chart = function(container) {

    for (var prop in container) {
      if (container.hasOwnProperty(prop))
        console.log(prop);
    }

    function setDimensions() {
      axisLabelMargin = 60;
    }

    function setupXAxis() {
      var mindate, maxdate;
      if (xMin) {
        mindate = xMin;
      }
      else {
        mindate =
          moment.min(data.map(function(d){
            return moment(d.content.sysStart);
          })).toDate();
      }
      if (xMax) {
        maxdate = xMax;
      }
      else {
        maxdate =
          moment.max(data.map(function(d){
            return moment(d.content.sysStart);
          })).add(10, 'y').toDate();
      }

      xScale = d3.time.scale()
        .domain([mindate, maxdate])
        .range([axisLabelMargin,width-margin.left-margin.right-axisLabelMargin]);

      if (data.length > 12 && width < 500) {
        xAxisCssClass = 'axis-font-small';
      } else {
        xAxisCssClass = '';
      }

      xAxis = d3.svg.axis()
        .scale(xScale)
        .ticks(10)
        .innerTickSize(-width + axisLabelMargin + margin.left + margin.right)
        .outerTickSize(0)
        .orient('bottom')
        .tickFormat(d3.time.format('%Y-%m-%d'));
    }

    function setupYAxis() {
      var mindate, maxdate;
      if (yMin) {
        mindate = yMin;
      }
      else {
        mindate =
          moment.min(data.map(function(d){
            return moment(d.content.valStart);
          })).toDate();
      }
      if (yMax) {
        maxdate = yMax;
      }
      else {
        maxdate =
          moment.max(data.map(function(d){
            return moment(d.content.valStart);
          })).add(5, 'y').toDate();
      }

      console.log('ymin='+mindate,' ymax='+maxdate);

      yScale = d3.time.scale()
        .domain([mindate, maxdate])
        .range([height - axisLabelMargin - margin.top - margin.bottom, axisLabelMargin]);

      var yAxisCssClass;
      if (data.length > 12 && width < 500) {
        yAxisCssClass = 'axis-font-small';
      } else {
        yAxisCssClass = '';
      }

      yAxis = d3.svg.axis()
        .scale(yScale)
        .ticks(15)
        .innerTickSize(-width + axisLabelMargin + margin.left + margin.right)
        .outerTickSize(0)
        .orient('left')
        .tickFormat(d3.time.format('%Y-%m-%d'));
    }

    function setupBarChartLayout() {

      g = container.append('svg')
        .attr('class', 'svg-chart')
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

      var colorDomain = [];
      data.map(function(d){
        colorDomain.push(d.content.data);
      });

      color.domain(colorDomain);
    }

    function addXAxisLabel() {

      g.append('g')
        .attr('class', 'xaxis ' + xAxisCssClass)
        .attr('transform', 'translate(' + axisLabelMargin + ',' +
          (height - axisLabelMargin - margin.top - margin.bottom) + ')')
        .call(xAxis)
        .append('text')
        .attr('class', 'axis-label')
        .attr('y', margin.bottom)
        .attr('x', (width-margin.left)/2)
        .text(xAxisLabel);
    }

    function addYAxisLabel() {

      g.append('g')
        .attr('class', 'yaxis ')
        .attr('transform', 'translate(' + axisLabelMargin + ', 0)')
        .call(yAxis)
        .append('text')
        .attr('class', 'axis-label')
        .attr('transform', 'rotate(-90)')
        .attr('y', -margin.left)
        .attr('x', -(height - margin.top - margin.bottom - axisLabelMargin) / 2)
        .style('text-anchor', 'middle')
        .text(yAxisLabel);

    }

    function addBackground() {

      g.append('rect')
        .attr('class', 'background')
        .attr('x', axisLabelMargin)
        .attr('y', -axisLabelMargin)
        .attr('width', width - axisLabelMargin - margin.left - margin.right)
        .attr('height', height - margin.top - margin.bottom);

    }
    function setLastDoc(ld) {
      lastDoc = ld;
    }

    function getLastDoc() {
      return lastDoc;
    }

    function addBarChartData() {

      split = g.selectAll('.split')
        .data(data)
        .enter()
        .append('g')
        .attr('class','split')
        .attr('stroke', 'black');
      var r;

        //.filter('random.json');
      
      r = split
        .append('rect')
        .on('click', function(datum, index) {
          document.getElementById('editButton').disabled = false;
          document.getElementById('deleteButton').disabled = false;
          document.getElementById('viewButton').disabled = false;

          if (!chart.getEditing() && !chart.getViewing()) {
            chart.setCurrentURI(datum.uri);
            showCurrURI(datum.uri);
            //Selection of a box in graph visualization
            $(this).attr('stroke', 'black');
            $(this).attr('stroke-width', '4');
            if (getLastDoc() !== this) {
              $(getLastDoc()).attr('stroke', 'grey');
              $(getLastDoc()).attr('stroke-width', '0');
            }
            setLastDoc(this);
          }
        })
        .attr('stroke', 'grey')
        .attr('stroke-width', '2')
        .attr('fill',function(d) {
          if(!displayProperty) {
            displayProperty = 'data';
          }
          else {
            if (displayProperty.indexOf('.') === -1) {
              return color(d.content[displayProperty]);
            }
            else {
              str = path(d, 'content.' + displayProperty);
              return color(str);
            }
          }
        })
        .attr('x', function(d) {
          var barx = xScale(moment(d.content.sysStart).toDate());
          return barx;
        })
        .attr('y', function(d) {
          var bary = yScale(moment(d.content.valEnd).toDate());
          return bary;
        })
        .attr('height', 0)
        .attr('width', 0)
        .style('opacity', 0)
        .transition()
        .duration(1500)
        .style('opacity', 1)
        .attr('height', function(d) {
          var bValStart = yScale(moment(d.content.valStart).toDate());
          var bValEnd = yScale(moment(d.content.valEnd).toDate());
          var h=-bValEnd+bValStart;
          return h;
        })
        .attr('width', function(d) {
          var bSysStart = xScale(moment(d.content.sysStart).toDate());
          var bSysEnd = xScale(moment(d.content.sysEnd).toDate());
          if (bSysEnd>width) {
            bSysEnd=width-axisLabelMargin;
          }
          var w=bSysEnd-bSysStart;
          return w;
        });

      split.append('text')
        .attr('class','tooltip-txt')
        .style('text-anchor', 'middle')
        .attr('x', function(d) {
          var barx1 = xScale(moment(d.content.sysStart).toDate());
          var barx2;
          if (!d.content.sysEnd) {
            return 75;
          }
          if (d.content.sysEnd.indexOf('9999') === 0) {
            barx2 = xScale(moment(d.content.sysStart).add(5, 'y').toDate());
            return (barx1+barx2)/2 + 40;
          }
          else {
            barx2 = xScale(moment(d.content.sysEnd).toDate());
            return (barx1+barx2)/2 + 40;
          }
        })
        .attr('y', function(d) {
          if (!d.content.valEnd) {
            return 0;
          }
          var bary1 = yScale(moment(d.content.valStart).toDate());
          var bary2;
          if (d.content.valEnd.indexOf('9999') === 0) {
            bary2 = yScale(moment(d.content.valStart).add(5, 'y').toDate());
            return (bary1+bary2)/2;
          }
          else {
            bary2 = yScale(moment(d.content.valEnd).toDate());
            return (bary1+bary2)/2;
          }
        })
        .text(function(d) {
          var str = '';
          if(!displayProperty) {
            displayProperty = 'data';
          }
          if (displayProperty.indexOf('.') === -1) {
            str = d.content[displayProperty];
          }
          else {
            str = path(d, 'content.' + displayProperty);
          }
          var alreadyInGraph = false;
          for(var i = 0; i < displayedProps.length; i++) {
            if(displayedProps[i] === str) {
              alreadyInGraph = true;
            } 
          }
          if(alreadyInGraph === false) {
            displayedProps.push(str);
            return str;
          }
        })
        .call(wrapText, 225);
    }

//Generic text wrap D3 function for long text. 
  function wrapText(text, width) {
    text.each(function () {
      var textEl = d3.select(this),
        words = textEl.text().split(/\s+|-+/).reverse(),
        word,
        line = [],
        linenumber = 0,
        lineHeight = 1.1, // ems
        x = textEl.attr('x');
        y = textEl.attr('y'),
        dx = parseFloat(textEl.attr('dx') || 0), 
        dy = parseFloat(textEl.attr('dy') || 0),
        tspan = textEl.text(null).append('tspan').attr('x', x).attr('y', y).attr('dy', dy + 'em');

      while (word = words.pop()) {
        line.push(word);
        tspan.text(line.join(' '));
        if (tspan.node().getComputedTextLength() > width) {
          line.pop();
          tspan.text(line.join(' '));
          line = [word];
          tspan = textEl.append('tspan').attr('x', x).attr('y', y).attr('dx', dx).attr('dy', ++linenumber * lineHeight + dy + 'em').text(word);
        }
    }
        });
    }


    function path(object, fullPath) {
      var selection = object;
      fullPath.split('.').forEach(function(path) { 
        selection = selection[path]; 
      });
      return selection;
    }

    setDimensions();
    setupXAxis();
    setupYAxis();
    setupBarChartLayout();
    addBackground();
    addXAxisLabel();
    addYAxisLabel();
    addBarChartData();

};
  d3.selection.prototype.size = function() {
    var n = 0;
    this.each(function() { ++n; });
    return n;
  };

  chart.data = function(value) {
    if (!arguments.length) {
      return data;
    }
    data = value;
    return chart;
  };

  chart.width = function(value) {
    if (!arguments.length) {
      return width;
    }
    width = value;
    return chart;
  };

  chart.height = function(value) {
    if (!arguments.length) {
      return height;
    }
    height = value;
    return chart;
  };

  chart.xMin = function(value) {
    if (!arguments.length) {
      return xMin;
    }
    xMin = value;
    return chart;
  };

  chart.xMax = function(value) {
    if (!arguments.length) {
      return xMax;
    }
    xMax = value;
    return chart;
  };

  chart.yMin = function(value) {
    if (!arguments.length) {
      return yMin;
    }
    yMin = value;
    return chart;
  };

  chart.yMax = function(value) {
    if (!arguments.length) {
      return yMax;
    }
    yMax = value;
    return chart;
  };

  chart.margin = function(value) {
    if (!arguments.length) {
      return margin;
    }
    margin = value;
    return chart;
  };

  chart.getEditing = function() {
    return isEditing;
  };

  chart.setEditing = function(bool) {
    isEditing = bool;
  };

  chart.getViewing = function() {
    return isViewing;
  };

  chart.setViewing = function(bool) {
    isViewing = bool;
  };

  chart.getCurrentURI = function() {
    return uri;
  };

  chart.setCurrentURI = function(u) {
    uri = u;
  };

  chart.xAxisLabel = function(value) {
    if (!arguments.length) {
      return xAxisLabel;
    }
    xAxisLabel = value;
    return chart;
  };

  chart.yAxisLabel = function(value) {
    if (!arguments.length) {
      return yAxisLabel;
    }
    yAxisLabel = value;
    return chart;
  };

  chart.getDisplayProperty = function() {
    return displayProperty;
  };

  chart.setDisplayProperty = function(str) {
    if(!str) {
      displayProperty = 'data';
    }
    else {
      displayProperty = str;
    }
    return chart;
  };

  return chart;
};
