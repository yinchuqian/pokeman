'use strict';

(function() {

  let data = "no data";
  let svgContainer = ""; // keep SVG reference in global scope
  const measurements = {
    width: 1000,
    height: 500,
    marginAll: 50
}
  const colors = {

    "Bug": "#4E79A7",

    "Dark": "#A0CBE8",

    "Electric": "#F28E2B",

    "Fairy": "#FFBE7D",

    "Fighting": "#59A14F",

    "Fire": "#8CD17D",

    "Ghost": "#B6992D",

    "Grass": "#499894",

    "Ground": "#86BCB6",

    "Ice": "#FABFD2",

    "Normal": "#E15759",

    "Poison": "#FF9D9A",

    "Psychic": "#79706E",

    "Steel": "#BAB0AC",

    "Water": "#D37295"

}

  // load data and make scatter plot after window loads
  window.onload = function() {
    svgContainer = d3.select('body')
      .append('svg')
      .attr('width', 1000)
      .attr('height', 500);

    // d3.csv is basically fetch but it can be be passed a csv file as a parameter
    d3.csv("pokemon.csv")
      .then((data) => makeScatterPlot(data));
  }

  // make scatter plot with trend line
  function makeScatterPlot(csvData) {
    data = csvData // assign data as global variable
    
    // get arrays of fertility rate data and life Expectancy data
    let def = data.map((row) => parseFloat(row["Sp. Def"]));
    let total = data.map((row) => parseFloat(row["Total"]));

    // find data limits
    let axesLimits = findMinMax(def, total);

    // draw axes and return scaling + mapping functions
    let mapFunctions = drawAxes(axesLimits, "Sp. Def", "Total");

    // plot data as points and add tooltip functionality
    plotData(mapFunctions);

    // draw title and axes labels
    makeLabels();

  }


  // make title and axes labels
  function makeLabels() {
    svgContainer.append('text')
      .attr('x', 100)
      .attr('y', 40)
      .style('font-size', '14pt')
      .text("Pokemon: Special Defense vs Total Stats");

    svgContainer.append('text')
      .attr('x', 500)
      .attr('y', 490)
      .style('font-size', '10pt')
      .text('Sp.def');

    svgContainer.append('text')
      .attr('transform', 'translate(15, 300)rotate(-90)')
      .style('font-size', '10pt')
      .text('Total');
  }

  // plot all the data points on the SVG
  // and add tooltip functionality
  function plotData(map) {
    // mapping functions
    let xMap = map.x;
    let yMap = map.y;
    // make tooltip
    let div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);



    // append data to SVG and plot as points
      svgContainer.selectAll('.dot')
      .data(data)
      .enter()
      .append('circle')
        .attr('cx', xMap)
        .attr('cy', yMap)
        .attr('r', 5)
        .attr('fill', (d) => {return colors[d["Type 1"]]})
        // add tooltip functionality to points
        .on("mouseover", (d) => {
          div.transition()
            .duration(200)
            .style("opacity", .9);
          div.html(d["Name"] + "<br/>" + d["Type 1"] + "<br/>" + d["Type 2"])
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", (d) => {
          div.transition()
            .duration(500)
            .style("opacity", 0);
        });
        


          d3.select("#generation").on("change", function(){
            var newdata = data;
            var generation = d3.select(this).property("value");
            var legend = d3.select("#legendary").property('value');
            if(generation != "All"){
                newdata = newdata.filter(function(d){return d['Generation'] == generation;});
            }
            if(legend != "All"){
                newdata = newdata.filter(function(d){return d['Legendary'] == legend;});
            }
            update(newdata);
        });

        d3.select("#legendary").on("change", function(){
            var newdata = data;
            var legend = d3.select(this).property("value");
            var generation = d3.select("#generation").property('value');
            if(generation != "All"){
                newdata = newdata.filter(function(d){return d['Generation'] == generation;});
            }
            if(legend != "All"){
                newdata = newdata.filter(function(d){return d['Legendary'] == legend;});
            }
            update(newdata);
        });

        function update(newdata){
            let def = newdata.map((row) => parseFloat(row["Sp. Def"]));
            let total = newdata.map((row) => parseFloat(row["Total"]));
            svgContainer.selectAll("g").remove()
            let limits = findMinMax(def, total);
            let xScale = d3.scaleLinear()
            .domain([limits.xMin - 10, limits.xMax + 10]) // give domain buffer room
            .range([0 + measurements.marginAll, measurements.width - measurements.marginAll]);

            let xAxis = d3.axisBottom().scale(xScale);
            svgContainer.append("g")
            .attr('transform', 'translate(0, 450)')
            .call(xAxis);

            let yScale = d3.scaleLinear()
            .domain([limits.yMax + 10, limits.yMin - 5]) // give domain buffer
            .range([0 + measurements.marginAll, measurements.height - measurements.marginAll - 5]);
            let yAxis = d3.axisLeft().scale(yScale);
            svgContainer.append('g')
            .attr('transform', 'translate(50, 0)')
                .call(yAxis);

            const xMap = function(d) { return xScale(+d["Sp. Def"])} 
            const yMap = function(d) { return yScale(+d["Total"])}   
            svgContainer.selectAll("circle").remove()
            svgContainer.selectAll('.dot')
             .data(newdata)
             .enter()
             .append('circle')
             .attr('cx', xMap)
             .attr('cy', yMap)
             .attr('r', 5)
             .attr('fill', (d) => {return colors[d["Type 1"]]})
            // add tooltip functionality to points
             .on("mouseover", (d) => {
             div.transition()
             .duration(200)
             .style("opacity", .9);
             div.html(d["Name"] + "<br/>" + d["Type 1"] + "<br/>" + d["Type 2"])
             .style("left", (d3.event.pageX) + "px")
             .style("top", (d3.event.pageY - 28) + "px");
          })
             .on("mouseout", (d) => {
             div.transition()
             .duration(500)
             .style("opacity", 0);
        });
            
        }

     
        
  }

  // draw the axes and ticks
  function drawAxes(limits, x, y) {
    // return x value from a row of data
    let xValue = function(d) { return +d[x]; }

    // function to scale x value
    let xScale = d3.scaleLinear()
      .domain([limits.xMin - 20, limits.xMax + 0.5]) // give domain buffer room
      .range([0 + measurements.marginAll, measurements.width - measurements.marginAll]);

    // xMap returns a scaled x value from a row of data
    let xMap = function(d) { return xScale(xValue(d)); };
    // plot x-axis at bottom of SVG
    let xAxis = d3.axisBottom().scale(xScale);
    svgContainer.append("g")
      .attr('transform', 'translate(0, 450)')
      .call(xAxis);

    // return y value from a row of data
    let yValue = function(d) { return +d[y]}

    // function to scale y
    let yScale = d3.scaleLinear()
      .domain([limits.yMax + 10, limits.yMin - 5]) // give domain buffer
      .range([0 + measurements.marginAll, measurements.height - measurements.marginAll - 5]);

    // yMap returns a scaled y value from a row of data
    let yMap = function (d) { return yScale(yValue(d)); };

    // plot y-axis at the left of SVG
    let yAxis = d3.axisLeft().scale(yScale);
    svgContainer.append('g')
      .attr('transform', 'translate(50, 0)')
      .call(yAxis);

    // return mapping and scaling functions
    return {
      x: xMap,
      y: yMap,
      xScale: xScale,
      yScale: yScale
    };
  }

  // find min and max for arrays of x and y
  function findMinMax(x, y) {

    // get min/max x values
    let xMin = d3.min(x);
    let xMax = d3.max(x);

    // get min/max y values
    let yMin = d3.min(y);
    let yMax = d3.max(y);

    // return formatted min/max data as an object
    return {
      xMin : xMin,
      xMax : xMax,
      yMin : yMin,
      yMax : yMax
    }
  }

  // format numbers
  function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

})();
