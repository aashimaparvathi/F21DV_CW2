import dataPromise, {
  lightgrey,
  grey,
  contrast,
  brown,
  darkgrey,
  danger_red,
} from "./data.js";

import { drawParallelPlot } from "./parallel.js";

var coffeepercap1, coffeetotal, world, sunshine, temperature, leisure;
var annotateDelay = 1000;
const delayOffset = 1500;
const shortDelayOffset = 500;

const margin = { top: -20, right: 60, bottom: 0, left: 60 };
const width = 1000 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;
const mapscale = 140;
const yOffset = 170,
  xOffset = 0,
  buttonOffset = 15;
const circleRange = [10, 50];
export const countryByCode = new Map();
const continentByCode = new Map();
const perCapByCode = new Map();
const continents = new Set();
const mapgrey = "#949494";
const mapLabelOffset = 3;
const labelZoomFactor = 2.8;

/*
 TODO: Increase width of zoom button
 and change text to zoom in
 Toggle it to say zoom out when clicked
*/

const tooltip = d3
  .select("body")
  .append("div")
  .attr("class", "map-tooltip")
  .style("opacity", 0)
  .style("width", "500px")
  .style("height", "250px")
  .style("position", "absolute")
  .style("pointer-events", "none")
  .style("background-color", "#fff")
  .style("padding", "10px")
  .style("border-radius", "5px")
  .style("box-shadow", "0 2px 2px rgba(0,0,0,0.1)")
  .html(
    '<svg id="svgToolTip" viewBox="0 0 500 250" class="countryTip" width="100%" height="100%"></svg>'
  );

var circleRadiusScale, circleColorScale;
var projection, path, isocodes, filteredFeatures;
var minMaxPerCap;
var isEnabled = false;
var isocode_group, countries_group;

dataPromise.then(function ([
  coffeepercap1data,
  coffeetotaldata,
  worlddata,
  sunshinedata,
  temperaturedata,
  leisuredata,
]) {
  console.log("map.js");
  coffeepercap1 = coffeepercap1data;
  coffeetotal = coffeetotaldata;
  world = worlddata;
  sunshine = sunshinedata;
  temperature = temperaturedata;
  leisure = leisuredata;

  /* Test that data is retrieved correctly */
  testData();
  fixData();
  drawMap();
});

function testData() {
  console.log(coffeepercap1);
  console.log(coffeetotal);
  console.log(world);
  // console.log(sunshine);
  // console.log(temperature);
  // console.log(leisure);
}

function fixData() {
  coffeepercap1.forEach(function (d) {
    d.twodecimalplaces = +d.twodecimalplaces;
  });
  /* Sort in descending order of per capita consumption */
  coffeepercap1.sort(function (a, b) {
    return b.twodecimalplaces - a.twodecimalplaces;
  });
  console.log(coffeepercap1);

  /* TODO: Try to convert this into a loop.
    column = 'year' + year;
    d.`${column}` = +d.`${column}`;
    */
  coffeetotal.forEach(function (d) {
    d.year2000 = +d.year2000;
    d.year2001 = +d.year2001;
    d.year2002 = +d.year2002;
    d.year2003 = +d.year2003;
    d.year2004 = +d.year2004;
    d.year2005 = +d.year2005;
    d.year2006 = +d.year2006;
    d.year2007 = +d.year2007;
    d.year2008 = +d.year2008;
    d.year2009 = +d.year2009;
    d.year2010 = +d.year2010;
    d.year2011 = +d.year2011;
    d.year2012 = +d.year2012;
    d.year2013 = +d.year2013;
    d.year2014 = +d.year2014;
    d.year2015 = +d.year2015;
    d.year2016 = +d.year2016;
    d.year2017 = +d.year2017;
    d.year2018 = +d.year2018;
    d.year2019 = +d.year2019;
  });
  console.log(coffeetotal);

  // TODO: Remove unwanted groups later
  var continents_group = d3.group(coffeepercap1, (d) => d.continent);
  countries_group = d3.group(coffeepercap1, (d) => d.country);
  isocode_group = d3.group(coffeetotal, (d) => d.isocode);
  // console.log(continents_group);
  // console.log(countries_group);
  console.log("countriesGroup");
  console.log(countries_group);

  console.log("isoCodeGroup");
  console.log(isocode_group);

  const perCapValues = coffeepercap1.map((d) => d.twodecimalplaces);
  minMaxPerCap = d3.extent(perCapValues);
  console.log(minMaxPerCap);

  circleRadiusScale = d3.scaleSqrt().domain(minMaxPerCap).range(circleRange);

  coffeepercap1.map(function (d) {
    continentByCode.set(d.isocode, d.continent);
    countryByCode.set(d.isocode, d.country);
    perCapByCode.set(d.isocode, d.twodecimalplaces);
    continents.add(d.continent);
  });

  console.log("map2");
  console.log(continentByCode);
  console.log(countryByCode);
  console.log(perCapByCode);
  console.log(continents);

  /* Each color is chosen such that it has very good contrast against white background
    with the help of
    https://colorable.jxnblk.com/
    https://coolors.co/contrast-checker/005f7e-ffffff
  */
  circleColorScale = d3
    .scaleOrdinal()
    .domain(continents)
    .range(["#de1f1f", "#1f9bde", "#6b1fde", "#de1f78"]);
  // .range(["#007e08", "#00697e", "#02007e", "#7e0037"]);

  isocodes = coffeepercap1.map(function (d) {
    return d.isocode;
  });

  // Filter the world.features array to include only the features whose id matches any of the isocodes
  filteredFeatures = world.features.filter(function (d) {
    return isocodes.includes(d.id);
  });
}

function drawMap() {
  var svg = d3
    .select("#map-div")
    .append("g")
    .attr("class", "gMap")
    .attr("id", "map-group")
    .append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("viewBox", "0 0 " + width + " " + height)
    .attr("class", "svg")
    .attr("class", "map-svg")
    .attr("id", "map-svg");

  // Get the window height
  const windowHeight = window.innerHeight;

  // Select the group element
  const g = svg.select("g");

  // Set the height of the group element to the window height
  g.attr("height", windowHeight);

  //svg.append("text").text("Hello");

  projection = d3
    .geoMercator()
    .rotate([-10, 0]) // Adjust the rotation of the projection
    .translate([width / 2 + xOffset, height / 2 + yOffset - 30])
    .scale(mapscale);

  path = d3.geoPath(projection);

  console.log("world features");
  console.log(world.features);

  var countries = svg
    .append("g")
    .attr("id", "map")
    .selectAll(".map-country")
    .data(world.features)
    .enter()
    .append("path")
    .attr("class", "country")
    .attr("id", (d) => d.id)
    .attr("d", path)
    .attr("fill", grey)
    .attr("stroke", "white")
    .attr("stroke-width", 0.5);

  var gCircles = svg.append("g").attr("id", "gCircles");
  var zoomfactor = 1;
  var circles = drawCircles(svg, zoomfactor);
  var gMap = d3.select("#map");

  // Define the legend items
  const legendItems = [
    { label: "Asia", color: circleColorScale("Asia") },
    { label: "Europe", color: circleColorScale("Europe") },
    { label: "North America", color: circleColorScale("North America") },
    { label: "South America", color: circleColorScale("South America") },
  ];

  // Create a group element for the legend and position it
  const legend = svg
    .append("g")
    .attr("class", "legend")
    .attr("id", "map-legend")
    .attr("transform", "translate(10, " + (height - 70) + ")");

  // Append a rectangle and text element for each legend item
  legend
    .selectAll("rect")
    .data(legendItems)
    .enter()
    .append("rect")
    .attr("x", 50)
    .attr("y", (d, i) => i * 25)
    .attr("width", 20)
    .attr("height", 20)
    .attr("rx", 10)
    .attr("ry", 10)
    .attr("fill", (d) => d.color)
    .attr("fill-opacity", 0.8)
    .attr("stroke", (d) => d.color);

  legend
    .selectAll("text")
    .data(legendItems)
    .enter()
    .append("text")
    .attr("x", 50 + 25)
    .attr("y", (d, i) => i * 25 + 3.5)
    .attr("text-anchor", "start")
    .attr("dominant-baseline", "hanging")
    .text((d) => d.label)
    .attr("fill", darkgrey);

  mapAnnotate(svg);

  var zoom = d3
    .zoom()
    .scaleExtent([1, 8])
    .on("zoom", function (event, d) {
      handleZoom(svg, event, d);
    });
  addZoom(svg);

  drawParallelPlot(sunshine, temperature, leisure, coffeepercap1);
}

function drawCircles(svg, zoomfactor) {
  var circles = svg
    .select("#gCircles")
    .selectAll("circle")
    .data(world.features, function (d) {
      return d.id;
    });

  circles.exit().remove();

  var labels = svg.selectAll(".country-label");

  labels.exit().remove();

  var count = 0;

  var circleUpdate = circles
    .enter()
    .append("circle")
    .merge(circles)
    .attr("id", (d) => countryByCode.get(d.id))
    .attr("cx", (d) => projection(d3.geoPath().centroid(d.geometry))[0])
    .attr("cy", (d) => projection(d3.geoPath().centroid(d.geometry))[1])
    .attr("r", (d) => circleRadiusScale(perCapByCode.get(d.id)))
    .attr("fill", (d) => circleColorScale(continentByCode.get(d.id)))
    .attr("class", "map-circle")
    .attr("id", (d) => {
      return d.id;
    })
    .attr("stroke", (d) => circleColorScale(continentByCode.get(d.id)))
    // .attr("stroke-width", "2px")
    .attr("fill-opacity", (d) => {
      // console.log(zoomfactor);
      if (zoomfactor == 1) return 0.4;
      else if (zoomfactor < 2) return 0.6;
      else if (zoomfactor < 3) return 0.7;
      else if (zoomfactor < 5) return 0.8;
      else if (zoomfactor < 8) return 1;
      else return 1;
    })
    .attr("stroke-opacity", (d) => {
      if (zoomfactor == 1) return 1;
      else if (zoomfactor < 2) return 0.8;
      else if (zoomfactor < 3) return 0.5;
      else if (zoomfactor < 5) return 0.1;
      else if (zoomfactor < 8) return 0;
      else return 1;
    })
    .attr("class", "hightlight")
    // .classed("highlight", true)
    .style("transition", "0.4s")
    .on("mouseover", function (event, d) {
      var isoHover = d.id;

      var data = isocode_group.get(d.id);
      var country = d.properties.name;

      if (!(typeof data === "undefined"))
        tooltip.transition().duration(200).style("opacity", 0.9);
      // Position tooltip at mouse pointer
      console.log(d.id);
      tooltip
        // .html(getLineChartHtml1(d.id))
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 28 + "px");

      var svgToolTip = d3.select("#svgToolTip");
      // const svgToolTipWidth = +svgToolTip.attr("width");
      // const svgToolTipHeight = +svgToolTip.attr("height");

      // Extract viewBox values
      const viewBox = svgToolTip.attr("viewBox").split(" ");
      const svgToolTipWidth = viewBox[2];
      const svgToolTipHeight = viewBox[3];

      console.log("tooltip width and height");
      console.log(svgToolTipWidth + ", " + svgToolTipHeight);

      /* Margins if using line chart for total consumption */
      /* var margin = { top: 0, right: 0, bottom: 50, left: 50 }; */
      /* Margins if using lollipop chart for total consumption */
      var margin = { top: 20, right: 10, bottom: 30, left: 40 };

      var innerWidth = svgToolTipWidth - margin.left - margin.right; //this is the width of the barchart
      var innerHeight = svgToolTipHeight - margin.top - margin.bottom; // this is the height of the barchart

      // append the svg object to the body of the page
      var svg = svgToolTip
        .append("g")
        .attr("id", "line-group")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      svg
        .append("text")
        .text(
          "Total coffee consumed by " +
            country +
            " per year (in thousands of 60kg-bags)"
        )
        .attr("transform", `translate(${200},${-5})`)
        .attr("font-size", "0.9em")
        .attr("font-weight", "bold")
        .attr("text-anchor", "middle");
      const color = d3.scaleOrdinal().range(["red"]);

      /* Uncomment drawLineChart if using line chart */
      /* drawLineChart(svg, d.id, innerHeight, innerWidth, color); */
      createLollipopChart(svg, d.id, innerWidth, innerHeight, country);

      const mapCircles = d3.selectAll(".map-circle");
      const plotLines = d3.selectAll(".parallel-plot-line");

      const hoveredCircle = d3.select(this);

      // Set the selected circle to full opacity and all others to lower opacity
      mapCircles.classed("unselected", true);
      hoveredCircle.classed("selected", true);
      hoveredCircle.classed("unselected", false);

      const hoveredLineId = "#" + hoveredCircle.attr("id") + "-line";
      const hoveredLine = d3.select(hoveredLineId);

      plotLines.classed("unselected", true);
      hoveredLine.classed("selected", true);
      hoveredLine.classed("unselected", false);
    })
    .on("mouseout", function (event, d) {
      const mapCircles = d3.selectAll(".map-circle");
      const plotLines = d3.selectAll(".parallel-plot-line");

      tooltip.transition().duration(500).style("opacity", 0);
      const chartGroup = d3.select("#line-group");

      // Remove all the elements inside the group
      chartGroup.selectAll("*").remove();
      chartGroup.remove();

      mapCircles.classed("selected", false);
      mapCircles.classed("unselected", false);
      plotLines.classed("selected", false);
      plotLines.classed("unselected", false);
    });

  if (zoomfactor > labelZoomFactor) {
    // show country names
    var labels = svg
      .selectAll(".country-label")
      .data(filteredFeatures)
      .enter()
      .append("text")
      .attr("class", "country-label")
      // .attr("fill", "#1f315e")
      .attr("fill", brown)
      .attr("background-color", "white")
      .attr("visibility", "hidden")
      .text(function (d) {
        //console.log(d.properties.name);
        return d.properties.name;
      })
      .attr("x", function (d) {
        return (
          projection(d3.geoPath().centroid(d.geometry))[0] + mapLabelOffset
        );
      })
      .attr("y", function (d) {
        return projection(d3.geoPath().centroid(d.geometry))[1];
      })
      /*
      .attr("x", function (d) {
        return path.centroid(d)[0];
      })
      .attr("y", function (d) {
        return path.centroid(d)[1];
      })*/
      .style("text-anchor", "right");

    svg.selectAll(".country-label").attr("visibility", "visible");
  } else {
    // hide country names
    svg.selectAll(".country-label").attr("visibility", "hidden");
  }

  if (zoomfactor < 1.5) {
    d3.select("#map-legend").attr("opacity", 1);
    d3.select(".annotate-group").attr("opacity", 1);
  } else {
    d3.select("#map-legend").attr("opacity", 0);
    d3.select(".annotate-group").attr("opacity", 0);
  }

  return circles;
}

function addZoom(svg) {
  var zoom = "";
  // create a button
  var button = svg
    .append("g")
    .attr(
      "transform",
      "translate(" + width / 2 + ", " + (height - buttonOffset) + ")"
    ) // position the button below the map
    .attr("class", "zoom-button")
    .attr("id", "zoom-button");

  // create a rectangle to act as the button
  button
    .append("rect")
    .attr("width", 60)
    .attr("height", 40)
    .attr("rx", 10)
    .attr("ry", 10)
    .attr("class", "button-rect")
    .attr("fill", contrast)
    .on("click", function (event) {
      d3.select(this).classed("clicked", !d3.select(this).classed("clicked"));
    });

  // add the text "Zoom" to the button
  button
    .append("text")
    .attr("x", 30)
    .attr("y", 25)
    .attr("text-anchor", "middle")
    .attr("class", "button-text")
    .text("Zoom")
    .on("click", function () {
      d3.select(this.parentNode)
        .select("rect")
        .classed(
          "clicked",
          !d3.select(this.parentNode).select("rect").classed("clicked")
        );
    });

  button.on("click", function (event) {
    isEnabled = d3.select(this).select("rect").classed("clicked");
    console.log(
      isEnabled
        ? "zoom is disabled, enabling..."
        : "zoom is enabled, disalbing..."
    );
    // console.log(d3.select(this).select("rect").classed("clicked"));
    d3.select(this).classed("clicked", !d3.select(this).classed("clicked"));
    if (isEnabled == true) {
      console.log("zooming...");
      zoom = d3
        .zoom()
        .scaleExtent([1, 8])
        .on("zoom", function (event, d) {
          // console.log("inside event handler set up");
          handleZoom(svg, event, d);
        });
      svg.call(zoom);
    } else if (isEnabled == false) {
      console.log("not zooming...");
      // svg.call(zoom.transform, d3.zoomIdentity);
      svg.on(".zoom", null);
      svg
        .transition()
        .duration(750)
        .call(
          zoom.transform,
          d3.zoomIdentity,
          d3.zoomTransform(svg.node()).invert([width / 2, height / 2])
        );
    }
  });
}

function handleZoom(svg, event, data) {
  // console.log("inside actual event handler");
  const { transform } = event;
  var gMap = svg.select("#map");

  gMap.attr("transform", transform);
  var gCircle = svg.select("#gCircles");
  gCircle.attr("transform", transform);

  var labels = svg.selectAll(".country-label");
  // labels.exit().remove();

  labels
    .attr("transform", transform)
    .attr("font-size", 18 / transform.k)
    .attr("zindex", 9999);

  if (transform.k > 1 && transform.k < 1.5) {
    var circleRange = [10, 50];
    circleRadiusScale = d3.scaleSqrt().domain(minMaxPerCap).range(circleRange);

    drawCircles(svg, transform.k);
  }
  if (transform.k > 1.5 && transform.k < 2) {
    var circleRange = [5, 40];
    circleRadiusScale = d3.scaleSqrt().domain(minMaxPerCap).range(circleRange);

    drawCircles(svg, transform.k);
  }
  if (transform.k > 2 && transform.k < 2.5) {
    var circleRange = [2, 20];
    circleRadiusScale = d3.scaleSqrt().domain(minMaxPerCap).range(circleRange);

    drawCircles(svg, transform.k);
  }
  if (transform.k > 2.5 && transform.k < 3) {
    var circleRange = [2, 10];
    circleRadiusScale = d3.scaleSqrt().domain(minMaxPerCap).range(circleRange);

    drawCircles(svg, transform.k);
  }
  if (transform.k > 5) {
    var circleRange = [0.5, 3];
    circleRadiusScale = d3.scaleSqrt().domain(minMaxPerCap).range(circleRange);

    drawCircles(svg, transform.k);
  }
}

function drawLineChart(svg, isocode, innerHeight, innerWidth, color) {
  const chartGroup = d3.select("#line-group");

  // Remove all the elements inside the group
  chartGroup.selectAll("*").remove();

  var data = isocode_group.get(isocode);
  console.log(data);

  if (typeof data === "undefined") {
    console.log("myVariable is undefined");
    const chartGroup = d3.select("#line-group");

    // Remove all the elements inside the group
    chartGroup.selectAll("*").remove();
  } else {
    console.log("myVariable is defined");

    const consumption = Object.values(data[0]).slice(3); // Get consumption data
    console.log(consumption);

    const yearValues = Object.entries(data[0])
      .filter(([key, value]) => key.startsWith("year"))
      .map(([key, value]) => ({ year: +key.slice(4), value: value }));

    console.log(yearValues);

    var minYear = d3.min(yearValues, (d) => +d.year);
    var maxYear = d3.max(yearValues, (d) => +d.year);

    console.log(minYear + ", " + maxYear);

    var linexScale = d3
      .scaleLinear()
      .domain([minYear, maxYear])
      .range([0, innerWidth]);
    var lineyScale = d3
      .scaleLinear()
      .domain([0, d3.max(yearValues, (d) => d.value)])
      .range([innerHeight, 0]);

    const xAxis = d3.axisBottom(linexScale).tickFormat(d3.format("d"));
    const yAxis = d3.axisLeft(lineyScale);

    svg
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", "translate(0," + innerHeight + ")")
      .call(
        xAxis.ticks(10)
        // .tickValues(
        //   d3.timeMonth.every(1).range(new Date(2000, 2), new Date(2019, 2))
        // )
      );

    svg.append("g").attr("class", "y-axis").call(yAxis.ticks(6));

    var deathLine = svg.append("path").attr("class", "death-line");

    const deathLineFunction = d3
      .line()
      .x(function (d, i) {
        return linexScale(d.year);
      })
      .y(function (d) {
        console.log(d.value);
        console.log(lineyScale(d.value));
        return lineyScale(d.value);
      });

    deathLine
      .datum(yearValues)
      .attr("d", deathLineFunction)
      .attr("fill", "none")
      .attr("stroke", "black")
      .style("stroke-width", "1px");
  }
}

function createLollipopChart(group, isocode, innerWidth, innerHeight, country) {
  // const chartGroup = d3.select("#line-group");
  // // Remove all the elements inside the group
  // chartGroup.selectAll("*").remove();
  // chartGroup.remove();

  var data = isocode_group.get(isocode);
  console.log(data);

  if (typeof data === "undefined") {
    console.log("myVariable is undefined");
    tooltip.style("opacity", 0);
    const chartGroup = d3.select("#line-group");

    // Remove all the elements inside the group
    chartGroup.selectAll("*").remove();
  } else {
    console.log("myVariable is defined");

    const consumption = Object.values(data[0]).slice(3); // Get consumption data
    console.log(consumption);

    const yearValues = Object.entries(data[0])
      .filter(([key, value]) => key.startsWith("year"))
      .map(([key, value]) => ({ year: +key.slice(4), value: value }));

    console.log(yearValues);

    var minYear = d3.min(yearValues, (d) => +d.year);
    var maxYear = d3.max(yearValues, (d) => +d.year);

    console.log(minYear + ", " + maxYear);

    const sortedData = yearValues;

    // Define the scales for the chart
    const xScale = d3
      .scaleBand()
      .domain(sortedData.map((d) => d.year))
      .range([0, innerWidth])
      .paddingInner(0.5)
      .paddingOuter(0.5);

    var maxValue = d3.max(sortedData, (d) => d.value);
    var extra = maxValue / 10;

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(sortedData, (d) => d.value) + extra])
      .range([innerHeight, 0]);

    // Draw the circles for the lollipop chart
    const circles = group
      .selectAll("circle")
      .data(sortedData)
      .join("circle")
      .attr("cx", (d) => xScale(d.year) + xScale.bandwidth() / 2)
      .attr("cy", (d) => yScale(d.value))
      .attr("r", 7)
      .attr("fill", function (d) {
        if (d.value >= 10000) return danger_red;
        else return contrast;
      })
      .attr("fill-opacity", 1);

    // Draw the vertical lines for the lollipop chart
    const lines = group
      .selectAll("line")
      .data(sortedData)
      .join("line")
      .attr("x1", (d) => xScale(d.year) + xScale.bandwidth() / 2)
      .attr("y1", (d) => yScale(d.value) + 6)
      .attr("x2", (d) => xScale(d.year) + xScale.bandwidth() / 2)
      .attr("y2", innerHeight - 1)
      .attr("stroke", brown)
      .attr("stroke-width", 1);

    // Add x-axis
    const xAxis = d3.axisBottom(xScale).tickSizeOuter(0);
    group
      .append("g")
      .attr("transform", `translate(0, ${innerHeight})`)
      .call(xAxis)
      .attr("class", "axis")
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("transform", "rotate(-45)")
      .attr("fill", darkgrey);

    // Add y-axis
    const yAxis = d3.axisLeft(yScale);
    group
      .append("g")
      .call(yAxis.ticks(6))
      .attr("class", "axis")
      .selectAll("text")
      .attr("fill", darkgrey);
  }
}

function mapAnnotate(svg) {
  var isocode = "DNK";
  var countryGeometry;
  var countryFeature = world.features.find(function (d) {
    return d.id === isocode;
  });
  if (countryFeature) {
    console.log("Country found");
    countryGeometry = countryFeature.geometry;
  } else {
    console.log("Country not found");
  }

  var x = projection(d3.geoPath().centroid(countryGeometry))[0];
  var y = projection(d3.geoPath().centroid(countryGeometry))[1];

  console.log("x : " + x + ", y: " + y);

  const lineLength = height / 3;
  const lineLength2 = height / 3;
  const rectWidth = width / 5;
  const rectHeight = height / 5;
  const titleFontSize = "2rem";
  const textFontSize = "1rem";

  // Select the element to be observed
  const observerTarget = document.querySelector("#map-div");

  // Set up  observer
  const observerOptions = {
    root: null,
    rootMargin: "0px",
    threshold: 1, // trigger when the element is 100% in view
  };

  // Create observer
  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        // Animate annotation

        var gAnnotate = svg.append("g").attr("class", "annotate-group");

        // First line
        const line1 = gAnnotate
          .append("line")
          .attr("x1", x)
          .attr("y1", y)
          .attr("x2", x)
          .attr("y2", y)
          .style("stroke", "black")
          .style("stroke-width", 1)
          .transition()
          .duration(annotateDelay)
          .attr("y1", y - lineLength);

        annotateDelay = annotateDelay + shortDelayOffset;

        // second line
        const line2 = gAnnotate
          .append("line")
          .attr("x1", x)
          .attr("y1", y - lineLength)
          .attr("x2", x)
          .attr("y2", y - lineLength)
          .style("stroke", "black")
          .style("stroke-width", 1)
          .transition()
          .duration(annotateDelay)
          .attr("x2", x - lineLength2);

        // Add the Europe cluster annotation
        const rect = gAnnotate
          .append("rect")
          .attr("x", x - lineLength2 - rectWidth)
          .attr("y", y - lineLength - rectHeight)
          .attr("width", 0)
          .attr("height", rectHeight)
          .style("fill", "white")
          .style("stroke", "black")
          .style("stroke-width", 1)
          .transition()
          .duration(annotateDelay)
          .attr("width", rectWidth);

        const title = gAnnotate
          .append("text")
          .attr("x", x - lineLength - lineLength2 + 10)
          .attr("y", y - lineLength - rectHeight + 20)
          .text("Europe")
          .style("font-size", titleFontSize)
          .attr("font-weight", "bold")
          .attr("fill", (d) => circleColorScale("Europe"))
          .attr("dy", "0.5em")
          .attr("class", "annotate-title")
          .style("opacity", 0)
          .transition()
          .delay(shortDelayOffset)
          .duration(annotateDelay)
          .style("opacity", 1);

        const text = gAnnotate
          .append("text")
          .attr("x", x - lineLength - lineLength2 + 10)
          .attr("y", y - lineLength - rectHeight + 50)
          .text("A clear cluster in the")
          .style("font-size", textFontSize)
          .attr("dy", "1em")
          .attr("class", "annotate-content")
          .style("opacity", 0)
          .transition()
          .delay(shortDelayOffset)
          .duration(annotateDelay)
          .style("opacity", 1);

        const text2 = gAnnotate
          .append("text")
          .attr("x", x - lineLength - lineLength2 + 10)
          .attr("y", y - lineLength - rectHeight + 70)
          .text("North West.")
          .style("font-size", textFontSize)
          .attr("dy", "1em")
          .attr("class", "annotate-content")
          .style("opacity", 0)
          .transition()
          .delay(shortDelayOffset)
          .duration(annotateDelay)
          .style("opacity", 1);

        // Disconnect observer
        observer.disconnect();
      }
    });
  }, observerOptions);

  // begin observing target element
  observer.observe(observerTarget);
}
