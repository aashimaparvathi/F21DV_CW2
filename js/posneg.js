import dataPromise, {
  lightgrey,
  grey,
  contrast,
  brown,
  darkgrey,
  danger_red,
} from "./data.js";

var annotateDelay = 1000;
var coffeepercap_pn, happiness, productivity, landuse, ghgemission;
var positiveData, negativeData;
var filteredCoffee, filteredHappiness, filteredProductivity;
var mergedPositiveData, combinedPositiveData;

const delayOffset = 1500;
const shortDelayOffset = 500;
// const margin = { top: -20, right: 60, bottom: 0, left: 60 };
// const width = 1000 - margin.left - margin.right;
// const height = 500 - margin.top - margin.bottom;
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
});

function testData() {
  console.log(coffeepercap_pn);
  console.log(happiness);
  console.log(productivity);
  console.log(ghgemission);
  console.log(landuse);
}

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
}

function drawCorrelationMatrix() {
  var data = combinedPositiveData;
  console.log(data);

  const smallRectWidth = 50,
    smallRectHeight = 50;

  // Load data from CSV file

  // Extract variable names from data
  var variables = ["twodecimalplaces", "cantrilladderscore", "productivity"];

  console.log(variables);

  // Create a 2D array to hold the correlation values
  var corr = new Array(variables.length);
  for (var i = 0; i < variables.length; i++) {
    corr[i] = new Array(variables.length);
  }

  // Calculate mean and standard deviation for each variable
  var means = new Array(variables.length);
  var stdDevs = new Array(variables.length);
  for (var i = 0; i < variables.length; i++) {
    means[i] = d3.mean(data, function (d) {
      return +d[variables[i]];
    });
    stdDevs[i] = d3.deviation(data, function (d) {
      return +d[variables[i]];
    });
  }

  // Calculate correlation between each pair of variables
  for (var i = 0; i < variables.length; i++) {
    for (var j = 0; j < variables.length; j++) {
      if (i == j) {
        corr[i][j] = 1;
      } else {
        var sum = 0;
        for (var k = 0; k < data.length; k++) {
          var x = (+data[k][variables[i]] - means[i]) / stdDevs[i];
          var y = (+data[k][variables[j]] - means[j]) / stdDevs[j];
          sum += x * y;
        }
        corr[i][j] = sum / (data.length - 1);
      }
    }
  }

  // Create color scale to map correlation values to colors
  var colorScale = d3
    .scaleLinear()
    .domain([-1, 0, 1])
    .range(["red", "white", "green"]);

  // Create SVG element with responsive viewbox
  var svg = d3
    .select("#heatmap-div")
    .append("svg")
    .attr("viewBox", [0, 0, 500, 500])
    .attr("preserveAspectRatio", "xMidYMid meet");

  // Create a group for the matrix
  var matrix = svg.append("g").attr("transform", "translate(100,100)");

  // Create a rectangle for each pair of variables
  var rects = matrix
    .selectAll("rect")
    .data(corr)
    .enter()
    .append("g")
    .attr("transform", function (d, i) {
      return "translate(0," + i * smallRectWidth + ")";
    })
    .selectAll("rect")
    .data(function (d, i) {
      return d.map(function (e, j) {
        return {
          i: i,
          j: j,
          value: e,
        };
      });
    })
    .enter()
    .append("rect")
    .attr("x", function (d) {
      return d.j * smallRectHeight;
    })
    .attr("width", smallRectWidth)
    .attr("height", smallRectHeight)
    .style("fill", function (d) {
      return colorScale(d.value);
    });

  // // Add text labels for each variable
  // var labels = matrix.selectAll("text")
  //   .data(variables)
  //   .enter()
  //   .append("text")
  //   .text(function(d) { return d; })
  //   .attr("x", function(d, i) { return i * 25 + 12.5; })
  //   .attr("y",

  // Add text labels for each variable
  // var labels = matrix
  //   .selectAll("text")
  //   .data(variables)
  //   .enter()
  //   .append("text")
  //   .text(function (d) {
  //     if (d == "twodecimalplaces") return "Coffee Consumption";
  //     else if (d == "cantrilladderscore") return "Happiness Index";
  //     else return "Productivity";
  //   })
  //   .attr("x", function (d, i) {
  //     return i * smallRectWidth + 55;
  //   })
  //   .attr("y", -10)
  //   .style("text-anchor", "middle");

  // Add text labels for each variable
  var xLabels = matrix
    .selectAll(".xLabel")
    .data(variables)
    .enter()
    .append("text")
    .text(function (d) {
      return d;
    })
    .attr("x", function (d, i) {
      return i * smallRectWidth + 55;
    })
    .attr("y", -50)
    .attr("text-anchor", "end")
    .attr("class", "xLabel")
    .attr("transform", "rotate(-45)");

  var yLabels = matrix
    .selectAll(".yLabel")
    .data(variables)
    .enter()
    .append("text")
    .text(function (d) {
      return d;
    })
    .attr("x", 0)
    .attr("y", function (d, i) {
      return i * smallRectHeight + 25;
    })
    .attr("text-anchor", "end")
    .attr("class", "yLabel");
  // Add tooltips for each rectangle showing the correlation value
  rects.append("title").text(function (d) {
    return (
      variables[d.i] + " and " + variables[d.j] + ": " + d.value.toFixed(2)
    );
  });

  // Add legend for color scale
  var legend = svg.append("g").attr("transform", "translate(400,150)");

  var legendData = d3.range(-1, 1.01, 0.01);

  legend
    .selectAll("rect")
    .data(legendData)
    .enter()
    .append("rect")
    .attr("x", 0)
    .attr("y", function (d, i) {
      return i;
    })
    .attr("width", 20)
    .attr("height", 1)
    .style("fill", function (d) {
      return colorScale(d);
    });

  legend
    .append("text")
    .text("Strong negative correlation")
    .attr("x", 30)
    .attr("y", 0)
    .style("text-anchor", "start");

  legend
    .append("text")
    .text("Strong positive correlation")
    .attr("x", 30)
    .attr("y", 100)
    .style("text-anchor", "start");

  legend
    .append("text")
    .text("0 correlation")
    .attr("x", 30)
    .attr("y", 200)
    .style("text-anchor", "start");
}

function rankParameter(divIDStart) {
  const margin = { top: -20, right: 60, bottom: 0, left: 60 };
  const width = 1000 - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;

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
  g.attr("height", windowHeight);

  var lol_margin = { top: 50, right: 0, bottom: 100, left: 90 };

  var innerWidth = width - lol_margin.left - lol_margin.right + 50; //this is the width of the barchart
  var innerHeight = height - lol_margin.top - lol_margin.bottom; // this is the height of the barchart

  svg
    .append("text")
    .text(function (d) {
      if (divIDStart == "happiness")
        return "Countries ranked by the happiness of its people (Scale 1 to 10)";
      else
        return "Countries ranked by overall productivity of its people (GDP per hour worked $)";
    })
    .attr("transform", `translate(${lol_margin.left},${lol_margin.top - 15})`)
    .attr("font-size", "1.4em")
    // .attr("font-weight", "bold")
    .attr("text-anchor", "start")
    .attr("fill", darkgrey);

  var svgg = svg
    .append("g")
    .attr("id", "lollipop-group")
    .attr("transform", `translate(${lol_margin.left},${lol_margin.top})`)
    .attr("border", "1px solid black");
  // .attr();

  svgg
    .append("rect")
    .attr("x", -50)
    .attr("y", -5)
    .attr("width", innerWidth + 80)
    .attr("height", innerHeight + 90)
    .attr("rx", 10) // Set the horizontal radius of the corners
    .attr("ry", 10) // Set the vertical radius of the corners
    .style("fill", "none") // Set the fill to none to make it transparent
    .style("stroke", lightgrey) // Set the color of the border to black
    .style("stroke-width", 1); // Set the width of the border to 2 pixels

  createLollipopChart(svgg, innerWidth, innerHeight, divIDStart);
}

function createLollipopChart(svg, innerWidth, innerHeight, divIDStart) {
  const colorScale = d3
    .scaleOrdinal()
    .domain(selectedCountries)
    .range(d3.schemeCategory10);
  console.log("createLollipop Chart");

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
    .paddingInner(17)
    .paddingOuter(0.6);

  var extra = maxInd / 10;

  const yScale = d3
    .scaleLinear()
    .domain([0, maxInd + extra])
    .range([innerHeight, 0]);

  // Draw the circles for the lollipop chart
  const circles = svg
    .selectAll("circle")
    .data(data)
    .join("circle")
    .attr("cx", (d) => xScale(d.country) + xScale.bandwidth() / 2)
    .attr("cy", (d) => yScale(d.value))
    .attr("r", 10)
    .attr("fill", function (d) {
      return colorScale(d.isocode);
    })
    .attr("fill-opacity", 1);

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
    .attr("stroke-width", 1);

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
