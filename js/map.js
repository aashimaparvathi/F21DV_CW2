import dataPromise, { lightgrey, grey } from "./data.js";

var coffeepercap1, coffeetotal, world;

const margin = { top: -20, right: 60, bottom: 0, left: 60 };
const width = 1000 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;
const mapscale = 130;
const yOffset = 185,
  xOffset = 0;
const circleRange = [10, 50];
const countryByCode = new Map();
const continentByCode = new Map();
const perCapByCode = new Map();
const continents = new Set();
const mapgrey = "#949494";

var circleRadiusScale, circleColorScale;
var projection;
var minMaxPerCap;

dataPromise.then(function ([coffeepercap1data, coffeetotaldata, worlddata]) {
  console.log("map.js");
  coffeepercap1 = coffeepercap1data;
  coffeetotal = coffeetotaldata;
  world = worlddata;

  /* Test that data is retrieved correctly */
  testData();
  fixData();
  drawMap();
});

function testData() {
  console.log(coffeepercap1);
  console.log(coffeetotal);
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
  var countries_group = d3.group(coffeepercap1, (d) => d.country);
  var isocode_group = d3.group(coffeepercap1, (d) => d.isocode);
  // console.log(continents_group);
  // console.log(countries_group);
  // console.log(isocode_group);

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
}

function drawMap() {
  var svg = d3
    .select("#map-div")
    .append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("viewBox", "0 0 " + width + " " + height)
    .attr("class", "svg")
    .attr("class", "map-svg")
    .attr("id", "map-svg");

  projection = d3
    .geoMercator()
    .rotate([-10, 0]) // Adjust the rotation of the projection
    .translate([width / 2 + xOffset, height / 2 + yOffset])
    .scale(mapscale);

  var path = d3.geoPath(projection);

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
  var circles = drawCircles(svg, projection);
  var gMap = d3.select("#map");

  var zoom = d3
    .zoom()
    .scaleExtent([1, 8])
    .on("zoom", function (event, d) {
      handleZoom(svg, event, d);
    });
  addZoom(svg, zoom);
}

function drawCircles(svg) {
  var circles = svg
    .select("#gCircles")
    .selectAll("circle")
    .data(world.features, function (d) {
      return d.id;
    });

  circles.exit().remove();

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
      count++;
      return d.id;
    })
    .attr("stroke", (d) => circleColorScale(continentByCode.get(d.id)))
    // .attr("stroke-width", "2px")
    .attr("fill-opacity", 0.4)
    .attr("stroke-opacity", 0.5)
    .attr("class", "hightlight")
    // .classed("highlight", true)
    .style("transition", "0.4s")
    .on("mouseover", function (event, d) {
      circleMouseOver(this, event, d);
    })
    .on("mouseout", function (event, d) {
      circleMouseOut(this, event, d);
    });

  console.log(count);
  return circles;
}

function circleMouseOver(thisCircle, event, data) {
  // console.log(data);
  // var continentColor = circleColorScale(data.continent);
  // d3.selectAll(".map-circle").attr("fill", grey).attr("stroke-opacity", 1);
  // d3.selectAll("circle").classed("highlight", false);
  //d3.select(thisCircle).attr("fill", continentColor).attr("fill-opacity", 1);
  // d3.selectAll(thisCircle).classed("highlight", true);
}

function circleMouseOut(thisCircle, event, data) {
  // console.log(data);
  // var continentColor = circleColorScale(data.continent);
  // d3.selectAll(".map-circle").attr("fill", grey).attr("stroke-opacity", 1);
  // // .classed("highlight", false);
  // d3.select(thisCircle).attr("fill", continentColor).attr("fill-opacity", 1);
  // // .classed("highlight", true);
}

function addZoom(svg, zoom) {
  // create a button
  var button = svg
    .append("g")
    .attr("transform", "translate(" + width / 2 + ", " + (height + 70) + ")") // position the button below the map
    .attr("class", "zoom-button")
    .attr("id", "zoom-button")
    .on("click", function (event) {
      svg.call(zoom);
    });

  // create a rectangle to act as the button
  button
    .append("rect")
    .attr("width", 60)
    .attr("height", 20)
    .attr("fill", "lightgrey");

  // add the text "Zoom" to the button
  button
    .append("text")
    .attr("x", 30)
    .attr("y", 14)
    .attr("text-anchor", "middle")
    .text("Zoom");
}

function handleZoom(svg, event, data) {
  const { transform } = event;
  var gMap = svg.select("#map");

  gMap.attr("transform", transform);
  var gCircle = svg.select("#gCircles");
  gCircle.attr("transform", transform);

  if (transform.k > 1 && transform.k < 1.5) {
    var circleRange = [10, 50];
    circleRadiusScale = d3.scaleSqrt().domain(minMaxPerCap).range(circleRange);

    drawCircles(svg);
  }
  if (transform.k > 1.5 && transform.k < 2) {
    var circleRange = [5, 40];
    circleRadiusScale = d3.scaleSqrt().domain(minMaxPerCap).range(circleRange);

    drawCircles(svg);
  }
  if (transform.k > 2 && transform.k < 2.5) {
    var circleRange = [2, 20];
    circleRadiusScale = d3.scaleSqrt().domain(minMaxPerCap).range(circleRange);

    drawCircles(svg);
  }
  if (transform.k > 2.5 && transform.k < 3) {
    var circleRange = [2, 10];
    circleRadiusScale = d3.scaleSqrt().domain(minMaxPerCap).range(circleRange);

    drawCircles(svg);
  }
}
