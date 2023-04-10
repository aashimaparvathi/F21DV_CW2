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
  //dracoffeeMap();
  drawCorrelationMatrix1();
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

function dracoffeeMap() {
  var svg = d3
    .select("#heatmap-div")
    .append("g")
    .attr("class", "gHeatMap")
    .attr("id", "heatmap-group")
    .append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("viewBox", "0 0 " + width + " " + height)
    .attr("class", "svg")
    .attr("class", "heatmap-svg")
    .attr("id", "heatmap-svg");

  // Determine the range and domain of the data
  var coffeeValues = mergedPositiveData.map(function (d) {
    return +d.twodecimalplaces;
  });
  var happinessValues = mergedPositiveData.map(function (d) {
    return +d.cantrilladderscore;
  });
  var productivityValues = mergedPositiveData.map(function (d) {
    return +d.productivity;
  });

  var xScale = d3
    .scaleLinear()
    .domain([d3.min(coffeeValues), d3.max(coffeeValues)])
    .range([0, 400]);

  var yScale = d3
    .scaleLinear()
    .domain([d3.min(happinessValues), d3.max(happinessValues)])
    .range([400, 0]);

  var colorScale = d3
    .scaleSequential()
    .domain([d3.min(productivityValues), d3.max(productivityValues)])
    .interpolator(d3.interpolateViridis);

  // Create the axes for the heatmap
  var xAxis = d3.axisBottom(xScale);
  var yAxis = d3.axisLeft(yScale);

  svg
    .append("g")
    .attr("transform", "translate(" + height / 3 + "," + width / 2 + ")")
    .call(xAxis);

  svg
    .append("g")
    .attr("transform", "translate(" + height / 3 + "," + 50 + ")")
    .call(yAxis);

  // Bind the data to the heatmap cells
  var cells = svg
    .selectAll("rect")
    .data(mergedPositiveData)
    .enter()
    .append("rect")
    .attr("x", function (d) {
      return xScale(d.twodecimalplaces) + 50;
    })
    .attr("y", function (d) {
      return yScale(d.cantrilladderscore) + 50;
    })
    .attr("width", 40)
    .attr("height", 40)
    .attr("fill", function (d) {
      return colorScale(d.productivity);
    });
}

/*
function drawCorrelationMatrix() {
  // Define the dimensions of the heatmap
  var width = 500;
  var height = 500;
  var margin = { top: 50, right: 50, bottom: 50, left: 50 };
  var innerWidth = width - margin.left - margin.right;
  var innerHeight = height - margin.top - margin.bottom;

  // Create the SVG container
  var svg = d3
    .select("#heatmap-div")
    .append("svg")
    .attr("viewBox", "0 0 " + innerWidth + " " + innerHeight)
    .attr("preserveAspectRatio", "xMinYMin meet")
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  var data = combinedPositiveData;

  var corr = [];
  for (var i = 0; i < data.length; i++) {
    corr[i] = [];
    for (var j = 0; j < data.length; j++) {
      var var1 = +data[i]["twodecimalplaces"];
      var var2 = +data[i]["cantrilladderscore"];
      var var3 = +data[i]["productivity"];
      var mean1 = d3.mean(data, function (d) {
        return +d["twodecimalplaces"];
      });
      var mean2 = d3.mean(data, function (d) {
        return +d["cantrilladderscore"];
      });
      var mean3 = d3.mean(data, function (d) {
        return +d["productivity"];
      });
      var std1 = d3.deviation(data, function (d) {
        return +d["twodecimalplaces"];
      });
      var std2 = d3.deviation(data, function (d) {
        return +d["cantrilladderscore"];
      });
      var std3 = d3.deviation(data, function (d) {
        return +d["productivity"];
      });
      var cov12 =
        d3.sum(data, function (d) {
          return (
            (+d["twodecimalplaces"] - mean1) *
            (+d["cantrilladderscore"] - mean2)
          );
        }) /
        (data.length - 1);
      var cov13 =
        d3.sum(data, function (d) {
          return (
            (+d["twodecimalplaces"] - mean1) * (+d["productivity"] - mean3)
          );
        }) /
        (data.length - 1);
      var cov23 =
        d3.sum(data, function (d) {
          return (
            (+d["cantrilladderscore"] - mean2) * (+d["productivity"] - mean3)
          );
        }) /
        (data.length - 1);
      if (i == j) {
        corr[i][j] = 1;
      } else if (i > j) {
        corr[i][j] = corr[j][i];
      } else {
        corr[i][j] =
          cov12 / (std1 * std2) + cov13 / (std1 * std3) + cov23 / (std2 * std3);
      }
    }
  }

  // Create a scale for the correlation values
  // var colorScale = d3.scaleSequential(d3.interpolateRdBu).domain([-1, 1]);

  var colorScale = d3
    .scaleLinear()
    .domain([-1, 0, 1])
    .range(["#DB4437", "#F4B400", "#0F9D58"]);

  var matrix = svg.append("g").attr("transform", "translate(0,0)");

  // Create a rectangle for each pair of variables
  var rects = matrix
    .selectAll("rect")
    .data(corr)
    .enter()
    .append("g")
    .attr("transform", function (d, i) {
      return "translate(0," + i * 25 + ")";
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
      return d.j * 25;
    })
    .attr("width", 25)
    .attr("height", 25)
    .style("fill", function (d) {
      return colorScale(d.value);
    });

  // Add text labels for each variable
  var labels = matrix
    .selectAll("text")
    .data(data.columns.slice(1))
    .enter()
    .append("text")
    .text(function (d) {
      return d;
    })
    .attr("x", function (d, i) {
      return i * 25 + 12.5;
    })
    .attr("y", -30)
    .style("text-anchor", "middle");

  // Add tooltips to show correlation values on hover
  rects.append("title").text(function (d) {
    return (
      data.columns[d.i + 1] +
      " vs " +
      data.columns[d.j + 1] +
      ": " +
      d.value.toFixed(2)
    );
  });
}
*/

function drawCorrelationMatrix1() {
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
    .attr("x", 150)
    .attr("y", function (d, i) {
      return i * smallRectHeight + 25;
    })
    .attr("text-anchor", "start")
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
