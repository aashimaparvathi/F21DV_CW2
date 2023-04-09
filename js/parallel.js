import { grey, darkgrey } from "./data.js";
import { countryByCode } from "./map.js";

const selectedCountries = [
  "FIN",
  "NOR",
  // "ISL",
  "DNK",
  "NLD",
  "SWE",
  // "CHE",
  "BEL",
  // "LUX",
  "CAN",
  "AUT",
  "ITA",
  "SVN",
  "DEU",
  "FRA",
  "GRC",
  "ESP",
  "EST",
  "PRT",
  "USA",
];

/*
  TODO:
  Add title and annotations - "Let's see if the top coffee consuming countries
  have high leisure hours, low temperatures", and low sunshine duration.

  Link the map and parallel plot lines on hover over either - did one way
  hover over circle and only the corresponding line remains

  Add hover over line (code nearly in place) to show the country corresponding to the ISO code.
  Go to: Set up tooltip here
*/

var filteredSunshine,
  filteredTemperature,
  filteredLeisure,
  mergedData,
  coffeepercap2,
  filteredCoffee;

export function drawParallelPlot(
  sunshine,
  temperature,
  leisure,
  coffeepercap1
) {
  coffeepercap2 = coffeepercap1;
  console.log("Inside parallel plot function");
  testData(sunshine, temperature, leisure, coffeepercap2);
  fixData(sunshine, temperature, leisure, coffeepercap2);
  renderParallelPlot();
}

function testData(sunshine, temperature, leisure, coffeepercap2) {
  console.log(coffeepercap2);
  console.log(sunshine);
  console.log(temperature);
  console.log(leisure);
}

function fixData(sunshine, temperature, leisure, coffeepercap2) {
  filteredSunshine = sunshine.filter((d) =>
    selectedCountries.includes(d.isocode)
  );
  filteredTemperature = temperature.filter((d) =>
    selectedCountries.includes(d.isocode)
  );
  // var filteredLeisureByYear = leisure.filter((d) => d.year === "2010");
  filteredLeisure = leisure.filter((d) =>
    selectedCountries.includes(d.isocode)
  );

  filteredCoffee = coffeepercap2.filter((d) =>
    selectedCountries.includes(d.isocode)
  );

  /* Filter and sort data */

  filteredSunshine.sort(function (a, b) {
    return a.Dec - b.Dec;
  });

  filteredTemperature.sort(function (a, b) {
    return a.last - b.last;
  });

  filteredLeisure.sort(function (a, b) {
    return b.leisuretime - a.leisuretime;
  });

  filteredCoffee.sort(function (a, b) {
    return b.twodecimalplaces - a.twodecimalplaces;
  });

  /* Retain only required columns */

  // Retain only the "country" and "value" columns
  filteredSunshine = filteredSunshine.map(function (d) {
    return {
      country: d.country,
      isocode: d.isocode,
      value: +d.Dec, // Convert value to a number
    };
  });

  filteredTemperature = filteredTemperature.map(function (d) {
    return {
      country: d.country,
      isocode: d.isocode,
      value: +d.last, // Convert value to a number
    };
  });

  filteredLeisure = filteredLeisure.map(function (d) {
    return {
      country: d.country,
      isocode: d.isocode,
      value: +d.leisuretime, // Convert value to a number
    };
  });

  filteredCoffee = filteredCoffee.map(function (d) {
    return {
      country: d.country,
      isocode: d.isocode,
      value: +d.twodecimalplaces, // Convert value to a number
    };
  });

  console.log(filteredSunshine);
  console.log(filteredTemperature);
  console.log(filteredLeisure);
  console.log(filteredCoffee);

  /* Merging */
  mergedData = d3.merge([
    filteredCoffee.map((d) => ({
      isocode: d.isocode,
      twodecimalplaces: d.value,
    })),
    filteredLeisure.map((d) => ({
      isocode: d.isocode,
      leisuretime: d.value,
    })),
    filteredTemperature.map((d) => ({
      isocode: d.isocode,
      temperature: d.value,
    })),
    filteredSunshine.map((d) => ({
      isocode: d.isocode,
      sunshine: d.value,
    })),
  ]);

  console.log(mergedData);
}

/*
function renderParallelPlot() {
  // Set up the dimensions and margins of the chart
  const margin = { top: 30, right: 10, bottom: 10, left: 10 },
    width =
      document.querySelector("#param1-div").getBoundingClientRect().width -
      margin.left -
      margin.right,
    height = window.innerHeight * 0.7 - margin.top - margin.bottom;

  // Create the svg element with viewBox for responsive design
  const svg = d3
    .select("#param1-div")
    .append("svg")
    .attr(
      "viewBox",
      `0 0 ${width + margin.left + margin.right} ${
        height + margin.top + margin.bottom
      }`
    )
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // Define the dimensions of the parallel coordinates plot
  const dimensions = [
    {
      key: "leisuretime",
      name: "Leisure Hours",
      unit: "hours",
      type: "number",
    },
    { key: "temperature", name: "Temperature", unit: "°C", type: "number" },
    {
      key: "sunshine",
      name: "Sunshine Duration",
      unit: "hours",
      type: "number",
    },
  ];

  // Define the scales for each dimension
  const yScales = {};
  dimensions.forEach((dim) => {
    yScales[dim.key] = d3
      .scaleLinear()
      .domain(d3.extent(mergedData, (d) => d[dim.key]))
      .range([height, 0]);
  });

  // Define the lines for each country
  const line = d3
    .line()
    .defined(
      (d) =>
        !isNaN(d[dimensions[0].key]) &&
        !isNaN(d[dimensions[1].key]) &&
        !isNaN(d[dimensions[2].key])
    )
    .x((d) => x(dimensions[0].key))
    .y((d, i) => yScales[dimensions[i].key](d[dimensions[i].key]));

  // Define the x scale for the dimensions
  const x = d3
    .scalePoint()
    .domain(dimensions.map((d) => d.key))
    .range([0, width])
    .padding(0.5);

  // Create a group for each dimension
  const dimensionGroups = svg
    .selectAll(".dimension")
    .data(dimensions)
    .enter()
    .append("g")
    .attr("class", "dimension");

  // Add the x axis for each dimension group
  dimensionGroups
    .append("g")
    .attr("class", "axis")
    .attr("transform", (d) => `translate(${x(d.key)},0)`)
    .each(function (d) {
      d3.select(this).call(d3.axisLeft().scale(yScales[d.key]).ticks(5));
    })
    .append("text")
    .attr("class", "title")
    .attr("y", -10)
    .text((d) => `${d.name} (${d.unit})`);
  /*
  // Create a group for each country
  const countryGroups = svg
    .selectAll(".country")
    .data(mergedData)
    .enter()
    .append("g")
    .attr("class", "country");

  // Draw the lines for each country
  countryGroups
    .append("path")
    .attr("class", "line")
    .attr("d", (d) =>
      line(dimensions.map((dim) => ({ [dim.key]: d[dim.key] })))
    );


  // Create a group for each country
  const countryGroups = svg
    .selectAll(".country")
    .data(mergedData)
    .enter()
    .append("g")
    .attr("class", "country");

  // Draw the lines for each country
  countryGroups
    .append("path")
    .attr("class", "line")
    .attr("d", (d) => {
      console.log(d);
      line(dimensions.map((dim) => ({ [dim.key]: d[dim.key] })));
    });
}
*/

function renderParallelPlot() {
  const margin = { top: 30, right: 80, bottom: 40, left: 30 },
    width =
      document.querySelector("#param1-div").getBoundingClientRect().width -
      margin.left -
      margin.right,
    height = window.innerHeight * 0.7 - margin.top - margin.bottom;
  const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

  // Define the keys to be used in the parallel plot
  const keys = ["twodecimalplaces", "leisuretime", "temperature", "sunshine"];

  // Group the data by "isocode" to create a nested array
  const nestedData = d3.group(mergedData, (d) => d.isocode);

  console.log(nestedData);

  // Define the scales for the parallel plot
  const x = d3.scalePoint().domain(keys).range([0, width]);

  const y = new Map(
    keys.map((key) => [
      key,
      d3
        .scaleLinear()
        .domain(d3.extent(mergedData, (d) => +d[key]))
        .range([height, 0]),
    ])
  );

  // Define the line generator for each path
  const line = d3
    .line()
    .defined((d) => !isNaN(d[1]))
    .x((d, i) => x(keys[i]) + margin.left)
    .y((d) => y.get(d[0])(d[1]) + margin.top);

  // Create the SVG container for the visualization
  const svg = d3
    .select("#param1-div")
    // .append("g")
    // .attr("class", "group")
    // .attr("id", "gParallel")
    .append("svg")
    .attr("viewBox", [
      0,
      0,
      width + margin.left + margin.right,
      height + margin.top + margin.bottom,
    ])
    .attr("preserveAspectRatio", "xMinYMin meet")
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // Create a group element for each path
  const path = svg
    .selectAll("path")
    .data(nestedData)
    .join("path")
    .attr("fill", "none")
    .attr("stroke", (d) => {
      console.log(d[0]);
      return colorScale(d[0]);
    })
    .attr("stroke-opacity", 0.5)
    .attr("stroke-width", 2)
    .attr("d", (d) =>
      line(keys.map((key) => [key, d[1].find((e) => e[key])?.[key]]))
    )
    .attr("class", "parallel-plot-line")
    .attr("id", (d) => d[0] + "-line");

  // Add the x-axis to the visualization
  const xAxis = svg
    .append("g")
    .attr("transform", `translate(${margin.left},${height + margin.top})`)
    .call(d3.axisBottom(x))
    .attr("color", "white");

  // Add the y-axes to the visualization
  const yAxis = svg
    .selectAll("g.y-axis")
    .data(keys)
    .join("g")
    .attr("class", "y-axis")
    .attr("transform", (d) => `translate(${x(d) + margin.left}, ${margin.top})`)
    .each(function (d) {
      d3.select(this).call(d3.axisLeft(y.get(d)));
    })
    .call((g) => g.selectAll(".tick text").attr("color", darkgrey))
    .call((g) => g.selectAll(".tick line").attr("color", grey))
    // .call((g) => g.selectAll(".tick label").attr("fill", "red"))
    .call((g) =>
      g
        .append("text")
        .attr("class", "axis-title")
        .attr("text-anchor", "middle")
        .attr("y", -15)
        .html(function (d) {
          if (d == "twodecimalplaces") return "Coffee (per cap)";
          else if (d === "leisuretime") return "Leisure (h)";
          else if (d === "temperature") return "Temperature (°C)";
          else return "Sunshine (h)";
        })
        .attr("fill", darkgrey)
        .attr("font-weight", "bold")
    )
    .attr("font-size", "0.7rem")
    .attr("color", grey);

  const mapCircles = d3.selectAll(".map-circle");
  const plotLines = d3.selectAll(".parallel-plot-line");

  // Add mouseover event listener to parallel plot lines
  plotLines.on("mouseover", function () {
    const hoveredLine = d3.select(this);
    const isoHover = hoveredLine.attr("id").slice(0, -5);
    console.log(isoHover);
    console.log(countryByCode.get(isoHover));

    /* Set up tooltip here */

    /*
    const hoveredLine = d3.select(this);

    // Set the selected line to full opacity and all others to lower opacity
    plotLines.classed("unselected", true);
    hoveredLine.classed("selected", true);
    hoveredLine.classed("unselected", false);

    // Get the id of the hovered line and select the corresponding map circle
    const hoveredCircleId = "#" + hoveredLine.attr("id").slice(0, -5);
    const hoveredCircle = d3.select(hoveredCircleId);

    // Set the selected circle to full opacity and all others to lower opacity
    mapCircles.classed("unselected", true);
    hoveredCircle.classed("selected", true);
    hoveredCircle.classed("unselected", false);
    */
  });

  // Add mouseout event listener to parallel plot lines
  plotLines.on("mouseout", function () {
    // Set all circles and lines to their original color and full opacity
    /*
    mapCircles.classed("selected", false);
    mapCircles.classed("unselected", false);
    plotLines.classed("selected", false);
    plotLines.classed("unselected", false);
    */
  });
}
