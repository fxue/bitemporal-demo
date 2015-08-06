/*global d3, d3plus, moment */

function showCurrURI(uri) {
  document.getElementById('selectedURI').innerHTML = 'Selected URI: ' + uri.bold();
}

var barChart = function() {
  // default values for configurable input parameters
  var width = 600;
  var height = 300;
  var uri, isEditing, isViewing, isDeleting, logicURI;
  var xMin = null;
  var xMax = null;
  var yMin = null;
  var yMax = null;
  var displayProperty = '';
  var lastDoc;
  var data;
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

    function setDimensions() {
      axisLabelMargin = 60;
    }

    function setupXAxis() {
      // minStart: earliest sysStart
      // maxEnd: latest non-infinty sysEnd
      // maxStart: max sysStart time
      var minStart, maxEnd, maxStart;

      if (xMin) {
        minStart = xMin;
      }
      else {
        minStart =
          moment.min(data.map(function(d){
            return moment(d.content.sysStart);
          })).toDate();
      }
      maxStart =
        moment.max(data.map(function(d){
          return moment(d.content.start);
        })).add('y', 10);
      
      if (xMax) {
        maxEnd = xMax;
      }
      else {
        maxEnd =
          moment.max(data.map(function(d){
            if (d.content.sysEnd.startsWith('9999')) {
              return maxStart;
            }
            else {
              return moment(d.content.sysEnd);
            }
          })).toDate();
      }

      xScale = d3.time.scale()
        .domain([minStart, maxEnd])
        .range([axisLabelMargin,width-margin.left-margin.right-axisLabelMargin]);

      if (data.length > 12 && width < 500) {
        xAxisCssClass = 'axis-font-small';
      } else {
        xAxisCssClass = '';
      }

      xAxis = d3.svg.axis()
        .scale(xScale)
        .ticks(10)
        .tickFormat(d3.time.format('%Y-%m-%d'))
        .tickSize(8,0)
        .orient('end');

    }

    function setupYAxis() {
      // minStart: earliest sysStart
      // maxEnd: latest non-infinty sysEnd
      // maxStart: max sysStart time
      var minStart, maxEnd, maxStart;

      if (yMin) {
        minStart = yMin;
      }
      else {
        minStart =
          moment.min(data.map(function(d){
            return moment(d.content.valStart);
          })).toDate();
      }
      maxStart =
        moment.max(data.map(function(d){
          return moment(d.content.valStart);
        })).add('y', 10);
      
      if (yMax) {
        maxEnd = yMax;
      }
      else {
        maxEnd =
          moment.max(data.map(function(d){
            if (d.content.valEnd.startsWith('9999')) {
              return maxStart;
            }
            else {
              return moment(d.content.valEnd);
            }
          })).toDate();
      }

      yScale = d3.time.scale()
        .domain([minStart, maxEnd])
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
        .orient('left')
        .tickFormat(d3.time.format('%Y-%m-%d'))
        .tickSize(10,0);
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
      //Rotate ticks
      g.append('g')
        .attr('class', 'xaxis ' + xAxisCssClass)
        .attr('transform', 'translate(0,' +
          (height - axisLabelMargin - margin.top - margin.bottom) + ')')
        .call(xAxis)
        .selectAll('text')
          .style('text-anchor', 'end')
          .attr('dx', '-0.9em')
          .attr('transform', 'rotate(-60)');

      //Add x axis label
      g.append('g')
        .append('text')
        .attr('class', 'axis-label')
        .attr('y', height - 20)
        .attr('x', (width - margin.left)/2)
        .text(xAxisLabel);
    }

    function addYAxisLabel() {

      g.append('g')
        .attr('class', 'yaxis ')
        .attr('transform', 'translate('+axisLabelMargin+', 0)')
        .call(yAxis)
        .append('text')
        .attr('class', 'axis-label')
        .attr('transform', 'rotate(-90)')
        .attr('y', -margin.left)
        .attr('x', -(height - margin.top + margin.bottom - axisLabelMargin) / 2)
        .style('text-anchor', 'left')
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

      var split = g.selectAll('.split')
      var arr = [];

      split = g.selectAll('.split')
        .data(data)
        .enter()
        .append('g')
        .attr('class','split')
        .attr('stroke', 'black');

      var r;

      var propTooltip = d3.select('body')
        .append('div')
        .style('z-index', '10')
        .style('visibility', 'hidden')
        .style('word-wrap', 'break-word')
        .style('font-weight', 'bold')
        .style('font-size', '18px')
        .style('width', '32em')
        .text('');
      
      r = split
        .append('rect')
        .on('mouseover', function(d) {
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
          if(str && str.length > 15) {  //if you want all mouse overs to work, comment out
            propTooltip.text(str);
          }
          return propTooltip.style('visibility', 'visible');
        })
        .on('mouseout', function() {
          propTooltip.text('');
          return propTooltip.style('visibility', 'hidden');
        })
        .on('mousemove', function() {
          var coordinates = [0, 0];
          coordinates = d3.mouse(this);
          propTooltip.style('position', 'absolute')
            .style('top', coordinates[1] + 115 + 'px')
            .style('left', coordinates[0] + 110 + 'px');
        })
        .on('click', function(datum, index) {
          document.getElementById('editButton').disabled = false;
          document.getElementById('deleteButton').disabled = false;
          document.getElementById('viewButton').disabled = false;
          document.getElementById('deleteErrMessage').innerHTML = '';

          if (!chart.getEditing() && !chart.getViewing() && !chart.getDeleting()) {
            chart.setCurrentURI(datum.uri);
            showCurrURI(datum.uri);

            $(this).attr('stroke-width', '4');
            $(this).attr('stroke', 'black');
            $(this).attr('fill-opacity', 0.7);
            if (getLastDoc() !== this) {
              $(getLastDoc()).attr('stroke', 'grey');
              $(getLastDoc()).attr('stroke-width', '1');
              $(getLastDoc()).attr('fill-opacity', 0.9);
            }
            setLastDoc(this);
          }
        })
        .attr('stroke', 'grey')
        .attr('stroke-width', '1')
        .attr('fill', function(d) {
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
        .style('opacity', 0)
        .transition()
        .duration(1500)
        .style('opacity', 0.9)
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
        .attr('id', 'box')
        .style('fill', 'DarkMagenta')
        .attr('class','tooltip-txt')
        .style('opacity', 0)
        .transition()
        .duration(1500)
        .style('opacity', 1)
        .style('text-anchor', 'middle')
        .attr('x', function(d) {
          var barx1 = xScale(moment(d.content.sysStart).toDate());
          var barx2;
          if (!d.content.sysEnd) {
            return 75;
          }
          if (d.content.sysEnd.indexOf('9999') === 0) {
            barx2 = xScale(moment(d.content.sysStart).add(5, 'y').toDate());
            return (barx1+barx2)/2;
          }
          else {
            barx2 = xScale(moment(d.content.sysEnd).toDate());
            return (barx1+barx2)/2;
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
            if(str && str.length > 15) {
              str = str.substring(0, 15) + '...';
            }
            return str;
          }
        })
      };

    function path(object, fullPath) {
      var selection = object;
      fullPath.split('.').forEach(function(path) { 
        selection = selection[path]; 
      });
      return selection;
    }

    /*
      var x = { foo: { bar: { stuff: 'something' } } }
      var path = 'foo.bar.stuff'
      var selected = x;
      path.split('.').forEach(function(path) { selected = selected[path]; });
      selected
    */

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

  chart.getDeleting = function() {
    return isDeleting;
  };

  chart.setDeleting = function(bool) {
    isDeleting = bool;
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

  chart.setLogicalURI = function(str) {
    logicURI = str;
  };

  chart.getLogicalURI = function() {
    return logicURI;
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
