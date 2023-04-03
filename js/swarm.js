import dataPromise from "./data.js";

var coffeepercap;

const margin = { top: 0, right: 100, bottom: 0, left: 30 };
const padding = { top: 0, right: 0, bottom: 0, left: 10 };
const centerX = 0;
const width = 1000 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

/* Color from https://colorable.jxnblk.com/62350e/ffffff */
const brown = "#62350e";

const tooltip = d3
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

dataPromise.then(function ([coffeepercapdata]) {
  console.log("swarm.js");
  coffeepercap = coffeepercapdata;

  /* Test that data is retrieved correctly */
  testData();
  fixData();
  console.log(coffeepercap);

  drawSwarm();
});

function testData() {
  console.log(coffeepercap);
}

function fixData() {
  coffeepercap.forEach(function (d) {
    d.percapitaconsumption = +d.percapitaconsumption;
  });
  /* Sort in descending order of per capita consumption */
  coffeepercap.sort(function (a, b) {
    return b.percapitaconsumption - a.percapitaconsumption;
  });
}

function drawSwarm() {
  const svg = d3
    .select("#swarm-svg-container")
    .append("svg")
    .attr(
      "viewBox",
      `0 0 ${width + margin.left + margin.right} ${
        height + margin.top + margin.bottom
      }`
    )
    .attr("preserveAspectRatio", "xMidYMid meet")
    .style("width", "90%")
    .style("height", "auto")
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const xScale = d3
    .scaleLinear()
    .domain([4, 13])
    .range([margin.left, width + margin.left]);

  const yScale = d3
    .scaleLinear()
    .domain([0, 1])
    .range([height / 2, height / 2]);

  const gAxis = svg
    .append("g")
    .attr("transform", `translate(${centerX}, ${height / 2})`)
    .call(
      d3
        .axisBottom(xScale)
        .ticks(9)
        .tickFormat((d) => d + "kg")
    )
    .call((g) => g.select(".domain").remove())
    .call((g) =>
      g
        .selectAll(".tick line")
        .clone()
        .attr("y2", -height / 4)
        .attr("stroke-opacity", 0.1)
        .attr("color", brown)
    )
    .call((g) =>
      g
        .selectAll(".tick text")
        .attr("y", -height / 4)
        .attr("dy", "-0.5em")
        .attr("color", brown)
    );

  const gCircles = svg
    .append("g")
    .attr("transform", `translate(${centerX}, ${-height / 4})`);

  // group the data by percapitaconsumption
  const nestedData = d3.group(coffeepercap, (d) => d.percapitaconsumption);
  console.log(nestedData);

  // create an array of objects with tick and numCircles properties
  const ticksData = Array.from(nestedData, ([key, values]) => {
    return {
      tick: key,
      numCircles: values.length,
    };
  });

  console.log(ticksData);

  // execute the rest of your code with ticksData

  ticksData.forEach((d) => {
    const tick = d.tick;
    const numCircles = d.numCircles;
    const angleStep = (2 * Math.PI * Math.sin(0.5)) / numCircles;
    // const angleStep = d.y;

    for (let i = 0; i < numCircles; i++) {
      const radius = 30 + 10 * i;
      const angle = i * angleStep + Math.PI / 2;
      const cx = xScale(tick) + radius * Math.cos(angle);
      const cy = yScale(Math.random()) + radius * Math.sin(angle);

      const country = nestedData.get(tick)[i].country;
      console.log(country);
      console.log(nestedData.get(tick)[i]);

      /* TODO: Set alt-text for image */
      gCircles
        .append("image")
        .attr("xlink:href", "./images/bean2.png")
        // .data(nestedData.get(tick)[i])
        .attr("x", cx - 8)
        .attr("y", cy - 8)
        .attr("width", 16)
        .attr("height", 16)
        .attr("class", "bean")
        .datum(nestedData.get(tick)[i])
        .on("mouseover", (event, d) => {
          var country = d.country;
          tooltip
            .style("opacity", 1)
            .html(`${country}`)
            .style("color", brown)
            .style("left", `${event.pageX}px`)
            .style("top", `${event.pageY}px`);
        })
        .on("mouseout", () => {
          tooltip.style("opacity", 0);
        });
    }
  });

  // Window resize behavior
  d3.select(window).on("resize", () => {
    // New dimensions of the SVG
    const newWidth =
      parseInt(svg.style("width"), 10) - margin.left - margin.right;
    const newHeight =
      parseInt(svg.style("height"), 10) - margin.top - margin.bottom;

    // Update the viewBox attribute on resize for responsiveness
    svg.attr(
      "viewBox",
      `0 0 ${newWidth + margin.left + margin.right} ${
        newHeight + margin.top + margin.bottom
      }`
    );

    // Update the event listeners for the bean elements
    svg.selectAll(".bean").on("mouseover", (event, d) => {
      tooltip
        .style("opacity", 1)
        .html(`${d.country}`)
        .style("left", `${event.pageX}px`)
        .style("top", `${event.pageY}px`);
    });
  });
}

// function drawSwarm() {
//   // Define the dimensions of the SVG
//   const margin = { top: 50, right: 50, bottom: 50, left: 50 };
//   const width = window.innerWidth - margin.left - margin.right;
//   const height = window.innerHeight - margin.top - margin.bottom;

//   // Append the SVG to the container div
//   const svg = d3
//     .select("#swarm-container")
//     .append("svg")
//     .attr("width", width)
//     .attr("height", height);

//   // Set the x scale and axis
//   const xScale = d3
//     .scaleLinear()
//     .domain([0, 12])
//     .range([margin.left, width - margin.right]);
//   const xAxis = d3.axisBottom(xScale).tickSize(0).tickPadding(10);

//   const yScale = d3
//     .scaleLinear()
//     .domain([5,6,7,8,9,10,11,12])
//     .range([]);
//   // Append the x axis to the SVG
//   svg
//     .append("g")
//     .attr("transform", `translate(0, ${height / 2})`)
//     .call(xAxis)
//     .call((g) => g.select(".domain").remove())
//     .call((g) =>
//       g
//         .selectAll(".tick")
//         .select("text")
//         .attr("y", "15")
//         .style("font-size", "12px")
//         .style("font-weight", "bold")
//     );

//   // Load the rice consumption data from the CSV file

//   // Append the rice grain images to the SVG
//   svg
//     .selectAll("image")
//     .data(coffeepercap)
//     .enter()
//     .append("svg:image")
//     .attr("xlink:href", "./images/bean.png")
//     .attr("width", "20")
//     .attr("height", "20")
//     .attr("x", (d) => xScale(d.percapitaconsumption))
//     .attr("y", (d) => {
//       return height / 2 - d.y;
//       // let yPositions = {
//       //   5: [10, 20, 30, 40, 50, 60],
//       //   6: [10, 20, 30, 40, 50, 60, 70],
//       //   7: [10, 20, 30, 40, 50],
//       //   8: [10],
//       //   9: [10, 20, 30, 40],
//       //   10: [10],
//       //   12: [10],
//       // };
//       // return yPositions[d.percapitaconsumption][
//       //   Math.floor(Math.random() * yPositions[d.percapitaconsumption].length)
//       // ];
//     });

//   // Set the title of the webpage
//   d3.select("title").text("per capita rice consumption");

//   // Make the webpage responsive
//   d3.select(window).on("resize", function () {
//     const w = window.innerWidth;
//     svg.attr("width", w);
//     xScale.range([margin.left, w - margin.right]);
//     svg
//       .select("g")
//       .attr("transform", `translate(0, ${height / 2})`)
//       .call(xAxis);
//   });
// }
