import dataPromise, {
  lightgrey,
  grey,
  contrast,
  brown,
  darkgrey,
  danger_red,
} from "./data.js";
import { nextStop } from "./swarm.js";

var annotateDelay = 1000;
var coffeepercap_pn, happiness, productivity, landuse, ghgemission;
var positiveData, negativeData;
var filteredCoffee, filteredHappiness, filteredProductivity;
var mergedPositiveData, combinedPositiveData;

const delayOffset = 1500;
const shortDelayOffset = 500;
const selectedCountries = [
  "FIN",
  "NOR",
  "ISL",
  "DNK",
  "NLD",
  "SWE",
  "CHE",
  "BEL",
  "LUX",
  "CAN",
  "AUT",
  "ITA",
  "SVN",
  "BRA",
  "DEU",
  "FRA",
  "GRC",
  "HRV",
  "CYP",
  "ESP",
  "EST",
  "PRT",
  "USA",
];
const nordic = ["FIN", "NOR", "ISL", "DNK", "SWE"];

const colorScale = d3
  .scaleSequential()
  .domain([1, 7]) // Set the input domain
  .interpolator(d3.interpolateReds); // Set the color range

const format = d3.format(".1f"); // Format function that rounds to 1 decimal point

const rank_tooltip = d3
  .select("body")
  .append("div")
  .attr("class", "tooltip")
  .style("opacity", 0)
  .style("position", "absolute")
  .style("pointer-events", "none")
  .style("background-color", "#fff")
  .style("padding", "10px")
  .style("border-radius", "5px")
  .style("box-shadow", "0 2px 2px rgba(0,0,0,0.1)");

dataPromise.then(function ([
  coffeepercap_pn_data,
  coffeetotaldata,
  worlddata,
  sunshinedata,
  temperaturedata,
  leisuredata,
  happinessdata,
  productivitydata,
  landusedata,
  ghgemissiondata,
]) {
  console.log("posneg.js");
  coffeepercap_pn = coffeepercap_pn_data;
  happiness = happinessdata;
  productivity = productivitydata;
  ghgemission = ghgemissiondata;
  landuse = landusedata;

  /* Test that data is retrieved correctly */
  testData();
  fixData();
  rankParameter("happiness");
  rankParameter("productivity");
  //drawCorrelationMatrix();

  var svg = compositionParameter("ghg");
  compositionParameter("land");

  nextStop(svg, "swarm-container", "Top", -250, -150);
});

/*
  testData()
  Function to ensure data is correctly retrieved for all use in the current file
*/
function testData() {
  console.log(coffeepercap_pn);
  console.log(happiness);
  console.log(productivity);
  console.log(ghgemission);
  console.log(landuse);
}

/*
  fixData()
  Perform data analytics techniques on the data retrieved from the CSV files
  And prepare them for the visualizations.
  This function performs operations such as filter, sort, map, group etc.
*/
function fixData() {
  filteredHappiness = happiness.filter((d) =>
    selectedCountries.includes(d.isocode)
  );

  filteredProductivity = productivity.filter((d) =>
    selectedCountries.includes(d.isocode)
  );

  filteredCoffee = coffeepercap_pn.filter((d) =>
    selectedCountries.includes(d.isocode)
  );

  filteredHappiness = filteredHappiness.map(function (d) {
    return {
      country: d.country,
      isocode: d.isocode,
      value: +d.cantrilladderscore, // Convert value to a number
    };
  });

  filteredProductivity = filteredProductivity.map(function (d) {
    return {
      country: d.country,
      isocode: d.isocode,
      value: +d.productivity, // Convert value to a number
    };
  });

  filteredCoffee = filteredCoffee.map(function (d) {
    return {
      country: d.country,
      isocode: d.isocode,
      value: +d.twodecimalplaces, // Convert value to a number
    };
  });

  console.log(filteredHappiness);
  console.log(filteredProductivity);
  console.log(filteredCoffee);

  // Combine all isocodes from all datasets
  const isocodes = [
    ...new Set([
      ...filteredCoffee.map((d) => d.isocode),
      ...filteredHappiness.map((d) => d.isocode),
      ...filteredProductivity.map((d) => d.isocode),
    ]),
  ];

  // Create mergedData array
  mergedPositiveData = isocodes.map((isocode) => {
    const coffeeObj = filteredCoffee.find((d) => d.isocode === isocode);
    const happinessObj = filteredHappiness.find((d) => d.isocode === isocode);
    const productivityObj = filteredProductivity.find(
      (d) => d.isocode === isocode
    );

    return {
      isocode,
      country: coffeeObj.country,
      twodecimalplaces: coffeeObj.value,
      cantrilladderscore: happinessObj ? happinessObj.value : null,
      productivity: productivityObj ? productivityObj.value : null,
    };
  });

  console.log(mergedPositiveData);

  combinedPositiveData = [];
  filteredCoffee.forEach(function (d) {
    var match = filteredHappiness.find(function (e) {
      return e.country == d.country && e.isocode == d.isocode;
    });
    if (match) {
      var prodMatch = filteredProductivity.find(function (e) {
        return e.country == d.country && e.isocode == d.isocode;
      });
      if (prodMatch) {
        combinedPositiveData.push({
          country: d.country,
          isocode: d.isocode,
          twodecimalplaces: +d.value,
          cantrilladderscore: +match.value,
          productivity: +prodMatch.value,
        });
      }
    }
  });

  console.log(combinedPositiveData);

  ghgemission = ghgemission.map(function (d) {
    return {
      Entity: d.Entity,

      percentage: +d.percentage, // Convert value to a number
    };
  });

  landuse = landuse.map(function (d) {
    return {
      Entity: d.Entity,

      percentage: +d.percentage, // Convert value to a number
    };
  });
}

function rankParameter(divIDStart) {
  const margin = { top: 0, right: 20, bottom: 0, left: 80 };
  const width = 1000 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  var divID = "#" + divIDStart + "-div";
  var groupClass = "g" + divIDStart;
  var groupID = divIDStart + "-group";
  var svgClass = divIDStart + "-svg";
  var svgID = divIDStart + "-svg";

  var svg = d3
    .select(divID)
    .append("g")
    .attr("class", groupClass)
    .attr("id", groupID)
    .append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("viewBox", "0 0 " + width + " " + height)
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("class", "svg")
    .attr("class", svgClass)
    .attr("id", svgID);

  // Get the window height
  const windowHeight = window.innerHeight;

  // Select the group element
  const g = svg.select("g");

  // Set the height of the group element to the window height
  // /g.attr("height", windowHeight);

  var lol_margin = { top: 0, right: 50, bottom: 120, left: 80 };

  var innerWidth = width - lol_margin.left - lol_margin.right + 10; //this is the width of the barchart
  var innerHeight = height - lol_margin.top - lol_margin.bottom; // this is the height of the barchart

  svg
    .append("text")
    .text(function (d) {
      if (divIDStart == "happiness")
        return "Countries ranked by the happiness of its people (Scale 0 to 10)";
      else
        return "Countries ranked by overall productivity of its people (GDP per hour worked $)";
    })
    .attr(
      "transform",
      `translate(${lol_margin.left + innerWidth / 2},${
        innerHeight + margin.bottom + margin.top + 100
      })`
    )
    .attr("font-size", "1.4em")
    // .attr("font-weight", "bold")
    .attr("text-anchor", "middle")
    .attr("fill", darkgrey)
    .classed("underline", false);
  // .attr("font-weight", "bold");

  var svgg = svg
    .append("g")
    .attr("id", "lollipop-group")
    .attr("transform", `translate(${lol_margin.left},${lol_margin.top})`)
    .attr("border", "1px solid black");

  // Set the height of the group element to the window height
  svgg.attr("height", windowHeight);
  // .attr();

  svgg
    .append("rect")
    .attr("x", -50)
    .attr("y", -5)
    .attr("width", innerWidth + 80)
    .attr("height", innerHeight + 90)
    .attr("rx", 10)
    .attr("ry", 10)
    .style("fill", "none")
    .style("stroke", "none")
    .style("stroke-width", 1);

  createLollipopChart(svgg, innerWidth, innerHeight, divIDStart);
}

function createLollipopChart(svg, innerWidth, innerHeight, divIDStart) {
  const colorScale = d3
    .scaleOrdinal()
    .domain(selectedCountries)
    .range([
      "#1f77b4",
      "#ff7f0e",
      "#2ca02c",
      "#d62728",
      "#9467bd",
      "#8c564b",
      "#e377c2",
      "#7f7f7f",
      "#bcbd22",
      "#17becf",
      "#8f5902",
      "#9c9ede",
      "#737373",
      "#8c6d31",
      "#f2b0c9",
      "#c5b0d5",
      "#4f4a4a",
      "#cec7b7",
      "#ada397",
      "#ffbb78",
      "#2c6497",
      "#a05d56",
      "#ff9896",
      "#9467bd",
      "#d62728",
    ]);
  console.log("createLollipop Chart");

  const colorScale1 = d3
    .scaleSequential()
    .domain([25, 0]) // Set the input domain
    .interpolator(d3.interpolateGreens); // Set the color range

  /* Sort data based on chosen indicator */

  const indicator =
    divIDStart == "happiness" ? "cantrilladderscore" : "productivity";
  console.log(indicator);

  var data;

  if (divIDStart == "happiness") {
    console.log("1");
    data = filteredHappiness.sort(function (a, b) {
      return b.value - a.value;
    });
  } else {
    console.log("2");
    data = filteredProductivity.sort(function (a, b) {
      return b.value - a.value;
    });
  }
  console.log(data);

  var minInd = d3.min(data, (d) => +d.value);
  var maxInd = d3.max(data, (d) => +d.value);

  console.log(minInd + ", " + maxInd);

  // Define the scales for the chart
  const xScale = d3
    .scaleBand()
    .domain(data.map((d) => d.country))
    .range([0, innerWidth])
    .paddingInner(5)
    .paddingOuter(1);

  var extra = maxInd / 10;

  const yScale = d3
    .scaleLinear()
    .domain([0, maxInd + extra])
    .range([innerHeight, 0]);

  var i = 0;
  const total = 23;

  // Draw the circles for the lollipop chart
  const circles = svg
    .selectAll("circle")
    .data(data)
    .join("circle")
    .attr("cx", (d) => xScale(d.country) + xScale.bandwidth() / 2)
    .attr("cy", (d) => yScale(d.value))
    .attr("r", 10)
    .attr("fill", function (d) {
      i++;
      return colorScale1(i);
    })
    .attr("fill-opacity", function (d) {
      if (selectedCountries.slice(0, 10).includes(d.isocode)) return 1;
      else return 0.3;
    })
    .attr("class", function (d) {
      return "lol-circle-" + d.isocode;
    })
    .classed("lol-circle", true)
    .attr("id", function (d, i) {
      return i + "-rank-" + divIDStart;
    })
    .on("mouseover", function (event, d) {
      lollipop_mouseover(this, event, d, divIDStart, svg);
    })
    .on("mouseout", function (event, d) {
      lollipop_mouseout(this, event, d, divIDStart, svg);
    });

  // Draw the vertical lines for the lollipop chart
  const lines = svg
    .selectAll("line")
    .data(data)
    .join("line")
    .attr("x1", (d) => xScale(d.country) + xScale.bandwidth() / 2)
    .attr("y1", (d) => yScale(d.value) + 10)
    .attr("x2", (d) => xScale(d.country) + xScale.bandwidth() / 2)
    .attr("y2", innerHeight - 2)
    .attr("stroke", darkgrey)
    .attr("stroke-width", 1)
    .attr("stroke-opacity", function (d) {
      if (selectedCountries.slice(0, 10).includes(d.isocode)) return 1;
      else return 0.2;
    })
    .attr("class", function (d) {
      return "lol-stem-" + d.isocode;
    })
    .classed("lol-stem", true);

  // Add x-axis
  const xAxis = d3.axisBottom(xScale).tickSizeOuter(0);

  svg
    .append("g")
    .attr("transform", `translate(0, ${innerHeight})`)
    .call(xAxis)
    .attr("class", "axis")
    .call((g) => g.selectAll(".tick text").attr("font-size", "1.5em"))
    .call((g) => g.selectAll(".tick line").attr("color", lightgrey))
    .selectAll("text")
    .style("text-anchor", "end")
    .attr("transform", "rotate(-45)")
    .attr("fill", darkgrey);

  // Add y-axis
  const yAxis = d3.axisLeft(yScale);
  svg
    .append("g")
    .call(yAxis.ticks(5))
    .attr("class", "axis")
    .call((g) => g.selectAll(".tick text").attr("font-size", "1.5em"))
    .call((g) => g.selectAll(".tick line").attr("color", lightgrey))
    .selectAll("text")
    .attr("fill", darkgrey);
}

function lollipop_mouseover(currElement, event, d, divIDStart, svg) {
  console.log(d.isocode);
  var circle = d3.selectAll(".lol-circle-" + d.isocode);
  var stem = d3.selectAll(".lol-stem-" + d.isocode);
  console.log(circle);
  console.log(stem);

  d3.selectAll(".lol-circle").attr("fill-opacity", 0.2);
  d3.selectAll(".lol-stem").attr("stroke-opacity", 0.2);
  circle.attr("fill-opacity", 1);
  stem.attr("stroke-opacity", 1);

  /* 1-rank-happiness */
  /* 5-rank-productivity */

  var id;
  var ids = [];
  var ranks = [];
  var params = [];
  circle.each(function () {
    id = d3.select(this).attr("id");
    ids.push(id);
    ranks.push(+id.split("-")[0]);
    params.push(id.split("-")[2]);
  });
  console.log(ids);
  console.log(ranks);
  console.log(params);

  rank_tooltip
    .style("opacity", 1)
    .html(`${params[0]}: #${ranks[0] + 1} <br/>${params[1]}: #${ranks[1] + 1}`)
    .style("color", brown)
    .style("left", `${event.pageX}px`)
    .style("top", `${event.pageY}px`);
}

function lollipop_mouseout(currElement, event, d, divIDStart, svg) {
  var circle = d3.selectAll(".lol-circle");
  var stem = d3.selectAll(".lol-stem");

  circle.attr("fill-opacity", function (d) {
    if (selectedCountries.slice(0, 10).includes(d.isocode)) return 1;
    else return 0.2;
  });

  stem.attr("stroke-opacity", function (d) {
    if (selectedCountries.slice(0, 10).includes(d.isocode)) return 1;
    else return 0.2;
  });

  rank_tooltip.style("opacity", 0);
}

function compositionParameter(divIDStart) {
  const margin = { top: 30, right: 20, bottom: 110, left: 40 };
  const width = 200 - margin.left - margin.right;
  const height = 800 - margin.top - margin.bottom;

  var divID = "#" + divIDStart + "-div";
  var groupClass = "g" + divIDStart;
  var groupID = divIDStart + "-group";
  var svgClass = divIDStart + "-svg";
  var svgID = divIDStart + "-svg";

  // Define the SVG and add the margins
  const svg = d3
    .select(divID)
    .append("svg")
    .attr("viewBox", [
      0,
      0,
      width + margin.left + margin.right,
      height + margin.top + margin.bottom,
    ])
    .attr("class", "svg")
    .attr("class", svgClass)
    .attr("id", svgID)
    .append("g")
    .attr("class", groupClass)
    .attr("id", groupID)
    .attr("transform", `translate(${margin.left}, ${margin.top})`)
    .attr("preserveAspectRatio", "xMinYMin meet");

  //createStackedBar(svg, width, height, margin, divIDStart);
  createVertical(svg, width, height, margin, divIDStart);
  return svg;
}

function createVertical(svg, width, height, margin, divIDStart) {
  console.log("stacked bar");

  var data;

  if (divIDStart == "ghg") data = ghgemission;
  else data = landuse;

  // Filter the data for the first 5 countries and combine the rest into one "Others" data point
  const filteredData = data.slice(0, 6);
  const othersData = {
    Entity: "Others (26)",
    percentage: d3.sum(data.slice(6), (d) => d.percentage),
  };

  console.log(filteredData);

  console.log(othersData);
  // Combine the filtered data and the "Others" data into one array
  var stackedData = [...filteredData, othersData];

  console.log(stackedData);
  stackedData = stackedData.sort(function (a, b) {
    return a.percentage - b.percentage;
  });

  //scale to calculate height of rectangle
  const yScale = d3.scaleLinear().domain([0, 100]).range([0, height]);

  var x1, y1, x2, y2, rectw, recth, lastperc;
  rectw = width;
  x1 = 0;
  lastperc = 0;
  var curlyX1, curlyY1, curlyX2, curlyY2, mainX, mainY, coffeeX, coffeeY;
  var otherPerc, mainPerc;

  // Select the element to be observed
  /*
  const observerTarget = document.querySelector("#pos-div");

  // Set up  observer
  const observerOptions = {
    root: null,
    rootMargin: "0px",
    threshold: 1, // trigger when the element is 100% in view
  };


  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        */
  for (var i = 0; i < stackedData.length; i++) {
    console.log(stackedData[i]);
    var perc = stackedData[i].percentage;
    //console.log(perc);

    /* CALCULATIONS */
    y1 = perc + lastperc;
    recth = perc;
    lastperc = lastperc + perc;
    x2 = x1 + rectw;
    y2 = y1 - recth;

    var h = y1 - y2;
    // console.log("(x,y): " + "0," + y1);
    // console.log("(x,y): " + x2 + "," + y2);
    // console.log("height: " + h);

    console.log("(x,y): " + "0," + yScale(y1));
    console.log("(x,y): " + x2 + "," + yScale(y2));
    console.log("height: " + yScale(y1 - y2));

    /* Position check - do not remove
    svg.append("text").attr("x", 0).attr("y", 0).text("hello");
    svg
      .append("text")
      .attr("x", width)
      .attr("y", height - 20)
      .text("hello");
      */

    if (i == 0) {
      if (divIDStart == "ghg") {
        curlyX1 = x2 + 8;
      } else {
        curlyX1 = x1 - 8;
      }
      curlyY1 = yScale(y2);
    }
    if (i == 6) {
      if (divIDStart == "ghg") {
        curlyX2 = x2 + 8;
        mainX = curlyX2 + x2 / 2;
      } else {
        curlyX2 = x1 - 8;
        mainX = curlyX2 - x2 / 2;
      }

      curlyY2 = yScale(y2);
      otherPerc = stackedData[i].percentage;
      mainPerc = 100 - otherPerc;
      console.log(otherPerc);
      console.log(mainPerc);
      mainY = (curlyY2 - curlyY1) / 2;
    }

    if (stackedData[i].Entity == "Coffee") {
      if (divIDStart == "ghg") {
        coffeeX = x2;
      } else {
        coffeeX = x1;
      }
      coffeeY = yScale(y2) + yScale(y1 - y2) / 2 + 5;
    }

    svg
      .append("rect")
      .attr("x", x1)
      .attr("y", yScale(y2))
      .attr("width", width)
      .attr("height", 0)
      .attr("fill", function () {
        if (stackedData[i].Entity == "Others (26)") return lightgrey;
        else return colorScale(i + 1);
      })
      .attr("rx", 10)
      .attr("ry", 10)
      .attr("stroke", function () {
        if (i < 1) return lightgrey;
        else return "white";
      })
      .attr("stroke-width", 2)
      .transition()
      .duration(function () {
        return i * 500;
      })
      .attr("height", yScale(y1 - y2));

    svg
      .append("text")
      .attr("x", function () {
        if (divIDStart == "ghg") return x1 - 8;
        else return x2 + 8;
      })
      .attr("text-anchor", function () {
        if (divIDStart == "ghg") return "end";
        else return "start";
      })
      .attr("y", yScale(y2) + yScale(y1 - y2) / 2 + 5)
      .text(stackedData[i].Entity)
      .attr("class", "axis")
      .attr("font-weight", function () {
        if (stackedData[i].Entity == "Coffee") return "bold";
        else return "normal";
      })
      .attr("fill", darkgrey)
      .attr("font-size", "1.1em");

    svg
      .append("text")
      .attr("x", width / 2)
      .attr("text-anchor", "middle")
      .attr("y", yScale(y2) + yScale(y1 - y2) / 2 + 5)
      .text(format(stackedData[i].percentage) + " %")
      .attr("fill", function () {
        if (i < 2 || i == 6) return darkgrey;
        else return "white";
      })
      .attr("opacity", 0)
      .transition()
      .duration(function () {
        return i * 700;
      })
      .attr("opacity", 1);
  }

  var svgID = "#" + divIDStart + "-svg";

  d3.select(svgID)
    .append("text")
    .text(function () {
      if (divIDStart == "ghg") return "GHG Emissions per 100g of Protein";
      else return "Land Use per 100g of Protein";
    })
    .attr(
      "transform",
      `translate(${margin.left + width / 2}, ${
        margin.top + height + margin.bottom / 2
      })`
    )
    .attr("text-anchor", "middle")
    .attr("font-size", "1.5em")
    .attr("fill", darkgrey)
    .attr("class", "neg-caption");

  drawBracket(
    svg,
    width,
    divIDStart,
    curlyX1,
    curlyX2,
    curlyY1,
    curlyY2,
    mainX,
    mainY,
    mainPerc
  );

  annotateCoffee(svg, width, height, margin, divIDStart, coffeeX, coffeeY);

  /*
        // Disconnect observer
        observer.disconnect();
      }
    });
  }, observerOptions);
*/
}

function drawBracket(
  svg,
  width,
  divIDStart,
  curlyX1,
  curlyX2,
  curlyY1,
  curlyY2,
  mainX,
  mainY,
  mainPerc
) {
  const startPoint = { x: curlyX1, y: curlyY1 };
  const endPoint = { x: curlyX2, y: curlyY2 };
  const horizontalWidth = width / 20;

  // Create a <path> element to represent the square bracket
  const path = d3.path();
  path.moveTo(startPoint.x, startPoint.y);
  if (divIDStart == "ghg") {
    path.lineTo(startPoint.x + horizontalWidth, startPoint.y);
    path.lineTo(startPoint.x + horizontalWidth, endPoint.y);
  } else {
    path.lineTo(startPoint.x - horizontalWidth, startPoint.y);
    path.lineTo(startPoint.x - horizontalWidth, endPoint.y);
  }

  path.lineTo(endPoint.x, endPoint.y);
  //path.lineTo(startPoint.x, startPoint.y);

  svg
    .append("path")
    .attr("d", path.toString())
    .attr("stroke", grey)
    .attr("stroke-width", 2)
    .attr("fill", "none");

  svg
    .append("text")
    .attr("x", mainX)
    .attr("y", mainY)
    .text(format(mainPerc) + " %")
    .attr("text-anchor", function () {
      if (divIDStart == "ghg") return "end";
      else return "start";
    })
    .attr("fill", darkgrey);
}

function annotateCoffee(
  svg,
  width,
  height,
  margin,
  divIDStart,
  coffeeX,
  coffeeY
) {
  const startPoint = { x: coffeeX, y: coffeeY };
  const horizontalWidth = width;
  const endPoint = {
    x: coffeeX + horizontalWidth,
    y: coffeeY + height + margin.bottom,
  };

  // Create a <path> element to represent the square bracket
  const path = d3.path();
  path.moveTo(startPoint.x, startPoint.y);
  if (divIDStart == "ghg") {
    path.lineTo(startPoint.x + horizontalWidth, startPoint.y);
    path.lineTo(startPoint.x + horizontalWidth, endPoint.y);
  } else {
    path.lineTo(startPoint.x - horizontalWidth, startPoint.y);
    path.lineTo(startPoint.x - horizontalWidth, endPoint.y);
  }

  // path.lineTo(endPoint.x, endPoint.y);
  //path.lineTo(startPoint.x, startPoint.y);

  svg
    .append("path")
    .attr("d", path.toString())
    .attr("stroke", grey)
    .attr("stroke-width", 2)
    .attr("stroke-dasharray", "5 3")
    .attr("fill", "none");

  addAnnotationText("neg-annotation");
}

function addAnnotationText(divIDStart) {
  // const margin = { top: 0, right: 0, bottom: 0, left: 0 };
  // const width = 20 - margin.left - margin.right;
  // const height = 20 - margin.top - margin.bottom;
  // var divID = "#" + divIDStart + "-div";
  // var groupClass = "g" + divIDStart;
  // var groupID = divIDStart + "-group";
  // var svgClass = divIDStart + "-svg";
  // var svgID = divIDStart + "-svg";
  // // Define the SVG and add the margins
  // const svg = d3
  //   .select(divID)
  //   .append("svg")
  //   .attr("viewBox", [
  //     0,
  //     0,
  //     width + margin.left + margin.right,
  //     height + margin.top + margin.bottom,
  //   ])
  //   .attr("class", "svg")
  //   .attr("class", svgClass)
  //   .attr("id", svgID)
  //   .append("g")
  //   .attr("class", groupClass)
  //   .attr("id", groupID)
  //   .attr("transform", `translate(${margin.left}, ${margin.top})`)
  //   .attr("preserveAspectRatio", "xMinYMin meet");
}
