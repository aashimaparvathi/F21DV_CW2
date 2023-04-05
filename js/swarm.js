import dataPromise from "./data.js";

var coffeepercap;

const margin = { top: -20, right: 60, bottom: 0, left: 60 };
const padding = { top: 0, right: 0, bottom: 0, left: 10 };
const centerX = 0;
const width = 1000 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

/*
  Color from https://colorable.jxnblk.com/62350e/ffffff
  10.32AAA
  https://coolors.co/contrast-checker/62350e-ffffff
*/
const brown = "#62350e";
const contrast = "#6291d3";
const grey = "#b4b2b2";
const darkgrey = "#909090";
const duration_small = 500;
const duration_medium = 1000;
const duration_large = 2000;

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
  //draw svg
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
    .style("width", "100%")
    .style("height", "auto")
    .append("g")
    .attr("transform", `translate(${0},${0})`);

  svg
    .append("text")
    .text(
      "Annual coffee consumption per person in various countries (quantity of dry coffee in kilogram kg)"
    )
    .attr("fill", "#b4b2b2")
    .attr("transform", `translate(${margin.left - 5}, ${height / 8})`)
    .attr("class", "caption")
    .attr("id", "swarm-caption");

  const xScale = d3
    .scaleLinear()
    .domain([4, 13])
    .range([margin.left, width + margin.left]);

  const yScale = d3
    .scaleLinear()
    .domain([0, 12])
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
    .attr("color", "#909090")
    .call((g) => g.select(".domain").remove())
    .call((g) =>
      g
        .selectAll(".tick line")
        .clone()
        .attr("y2", function (d) {
          if (d != 12) return -height / 6;
          else return -height / 6;
        })
        .attr("stroke-opacity", function (d) {
          if (d < 8 || d == 11 || d == 13 || d == 10) return 0.2;
          else return 0.5;
        })
        .attr("class", "axis-line")
        .attr("id", "swarm-axis-line")
        .attr("stroke", function (d) {
          if (d == 12) return contrast;
          else if (d == 10) return brown;
          else return grey;
        })
    )
    .call((g) =>
      g
        .selectAll(".tick text")
        .attr("y", -height / 4 + 10)
        .attr("dy", "-0.5em")
        .attr("color", function (d) {
          if (d < 8) return grey;
          else if (d != 12) return brown;
          else return contrast;
        })
        .attr("class", "axis-text")
        .attr("id", "swarm-axis-text")
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
      const radius = 30; //* i;
      const angle = i * angleStep + Math.PI / 2;
      const cx = xScale(tick) + radius * Math.cos(angle);
      const cy = yScale(Math.random()) + radius * Math.sin(angle);

      const country = nestedData.get(tick)[i].country;
      console.log(country);
      console.log(nestedData.get(tick)[i]);

      /* TODO: Set alt-text for image */
      gCircles
        .append("image")
        .attr("xlink:href", function (d) {
          if (tick < 8) {
            return "./images/bean_grey.png";
          } else if (tick < 12) {
            return "./images/bean_average.png";
          } else {
            return "./images/bean_extreme.png";
          }
        })
        .attr("x", cx - 8)
        .attr("y", cy - 20)
        .attr("width", 20)
        .attr("height", 20)
        .attr("class", "bean")
        .datum(nestedData.get(tick)[i])
        .attr("id", function (d) {
          return d.country + "-bean";
        })
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
        })
        .transition()
        .duration(1000)
        .delay(i * 250)
        .attr("y", cy - 8);
    }
  });

  finlandAnnotation(svg, gAxis);
  norwayAnnotation(svg, gAxis);
  averageAnnotation(svg, gAxis);
  othersAnnotations(svg, gAxis);

  nextStop(svg);

  // svg
  //   .append("image")
  //   .attr("xlink:href", "./images/context1.png")
  //   .attr("width", "50%")
  //   .attr("height", "30%")
  //   .attr("x", -60)
  //   .attr("y", height / 1.5 + 20);

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

function finlandAnnotation(svg, gAxis) {
  // finland tick
  const tickFinland = gAxis.select(".tick:nth-of-type(9)");

  tickFinland.attr("color", contrast);

  tickFinland
    .append("rect")
    .attr("transform", `translate(${-50}, ${height / 3})`)
    .attr("x", -53)
    .attr("y", -height / 4 - 30)
    // .attr("fill", "white")
    .attr("stroke", brown)
    .attr("stroke-width", 2)
    .attr("class", "tick-box")
    .attr("id", "swarm-tick-box")
    .attr("opacity", 0)
    .transition()
    .duration(2000)
    .delay(1000)
    .attr("opacity", 1);

  const finlandText = tickFinland
    .append("text")
    .attr("transform", `translate(${centerX}, ${height / 3 + 15})`)
    .attr("x", 0)
    .attr("y", -height / 4 - 20)
    .attr("class", "tick-box-text");

  finlandText
    .text("FINLAND")
    .attr("font-weight", "bold")
    .attr("fill", "white")
    .attr("dy", "0.5em")
    .attr("class", "tick-box-text")
    .attr("id", "swarm-tick-box-title");

  finlandText
    .append("tspan")
    .text("Home to the biggest 'Kahvi' lovers !")
    .attr("x", 0)
    .attr("dy", "3em")
    .attr("class", "tick-box-content")
    .attr("id", "swarm-tick-box-line1");

  finlandText
    .append("tspan")
    .text("At 20% higher than the next country,")
    .attr("x", 0)
    .attr("dy", "1em")
    .attr("class", "tick-box-content")
    .attr("id", "swarm-tick-box-line2");

  finlandText
    .append("tspan")
    .text("and miles above the global average.")
    .attr("x", 0)
    .attr("dy", "1em")
    .attr("class", "tick-box-content")
    .attr("id", "swarm-tick-box-line3");

  finlandText
    .append("tspan")
    .text("It's the only country in the world with")
    .attr("x", 0)
    .attr("dy", "1em")
    .attr("class", "tick-box-content")
    .attr("id", "swarm-tick-box-line4");

  finlandText
    .append("tspan")
    .text("coffee breaks mandated by law.")
    .attr("font-weight", "bold")
    .attr("x", 0)
    .attr("dy", "1em")
    .attr("class", "tick-box-content")
    .attr("id", "swarm-tick-box-line4");
}

function norwayAnnotation(svg, gAxis) {
  const tickNorway = gAxis.select(".tick:nth-of-type(7)");

  tickNorway.attr("color", brown).attr("stroke-opacity", 0.5);

  const transform = tickNorway.attr("transform");
  const [, pos] = transform.split("(");
  const [x, y] = pos.split(",").map(parseFloat);

  // End position of line and rectangle
  const lineEndY = y + height - 420;
  const rectX = x - 10;
  const rectY = lineEndY + 5; // for aligning line and rectangle

  // Create a group g for the line and rectangle
  const gLineRect = svg
    .append("g")
    .attr("transform", `translate(${centerX}, ${height / 2 + 10})`);

  // Append a line element to the group
  gLineRect
    .append("line")
    .attr("x1", x)
    .attr("y1", y)
    .attr("x2", x)
    .attr("y2", lineEndY)
    .attr("stroke", brown)
    .attr("stroke-opacity", 0.2)
    .attr("opacity", 0)
    .transition()
    .duration(duration_medium)
    .delay(500)
    .attr("opacity", 1);

  // Append a rect element to the group
  const norwayRect = gLineRect
    .append("rect")
    .attr("transform", `translate(${0}, ${0})`)
    .attr("class", "tick-box")
    .attr("id", "norway-tick-box")
    .attr("x", rectX - 70)
    .attr("y", rectY)
    .attr("fill", brown)
    .attr("opacity", 0)
    .transition()
    .duration(duration_medium)
    .delay(500)
    .attr("opacity", 1);

  // Append text element to the rectangle
  const norwayText = gLineRect
    .append("text")
    .attr("opacity", 0)
    .text("NORWAY")
    .attr("x", rectX + 10)
    .attr("y", rectY + 20)
    .attr("dy", "0.5em")
    .transition()
    .duration(duration_medium)
    .delay(500)
    .attr("opacity", 1)
    .attr("text-anchor", "middle")
    .attr("class", "tick-box-text")
    .attr("id", "norway-tick-box-title");

  gLineRect
    .append("text")
    .text("Second with their 'kaffeslabberas'")
    .attr("x", rectX + 10)
    .attr("y", rectY + 50)
    .attr("class", "tick-box-text")
    .attr("id", "norway-tick-box-line1");

  gLineRect
    .append("text")
    .text("or Coffee parties!")
    .attr("x", rectX + 10)
    .attr("y", rectY + 60)
    .attr("class", "tick-box-content")
    .attr("id", "norway-tick-box-line1");
}

function averageAnnotation(svg, gAxis) {
  const tickAverages = gAxis.select(".tick:nth-of-type(5)");

  tickAverages
    .append("rect")
    .attr("transform", `translate(${0}, ${height / 3})`)
    .attr("x", -30)
    .attr("y", -height / 4 - 30)
    .attr("class", "tick-box")
    .attr("id", "averages-tick-box");

  const averagesText = tickAverages
    .append("text")
    .attr("transform", `translate(${centerX}, ${height / 3 + 15})`)
    .attr("x", 50)
    .attr("y", -height / 4 - 30)
    .attr("class", "tick-box-content");

  averagesText
    .text("Iceland, Denmark, Netherlands, Sweden, Switzerland")
    .attr("fill", brown)
    .attr("class", "tick-box-avg-content")
    .attr("opacity", 0)
    .transition()
    .duration(duration_medium)
    .delay(250)
    .attr("opacity", 1);

  averagesText
    .append("tspan")
    .attr("x", 50)
    .attr("dy", "1em")
    .text("we have all 5 Nordic countries in the top 10! ->")
    .attr("font-weight", "bold")
    .attr("fill", brown)
    .attr("class", "tick-box-avg-content");
}

function othersAnnotations(svg, gAxis) {
  const tickOthers = gAxis.select(".tick:nth-of-type(3)");

  tickOthers
    .append("rect")
    .attr("transform", `translate(${0}, ${height / 3})`)
    .attr("x", -80)
    .attr("y", -height / 4 - 30)
    .attr("class", "tick-box")
    .attr("id", "others-tick-box")
    .attr("opacity", 0)
    .transition()
    .duration(duration_large)
    .delay(1500)
    .attr("opacity", 1);

  const othersText = tickOthers
    .append("text")
    .attr("transform", `translate(${centerX}, ${height / 3 + 15})`)
    .attr("x", -95)
    .attr("y", -height / 4 - 30)
    .attr("class", "tick-box-content")
    .attr("text-anchor", "start")
    .attr("text-align", "justify");
  othersText
    .text("Belgium, Luxembourg, Canada")
    .attr("fill", grey)
    .attr("class", "tick-box-other-content");

  var countries_others = [
    // "Canada",
    "Bosnia and Herzegovina",
    "Austria",
    "Italy",
    "Slovenia",
    "Brazil",
    "Germany",
    "France",
    "Greece",
    "Croatia",
    "Cyprus",
    "Lebanon",
    "Spain",
    "Estonia",
    "Portugal",
    "United States of America",
  ];

  for (var i = 0; i < countries_others.length; i++) {
    othersText
      .append("tspan")
      .attr("x", -95)
      .attr("dy", "1em")
      .attr("text-anchor", "start")
      .transition()
      .duration(duration_medium)
      .delay(i * 10)
      .text(function (d) {
        return (
          countries_others[i] +
          ", " +
          countries_others[++i] +
          ", " +
          countries_others[++i]
        );
      })
      .attr("fill", grey)
      .attr("class", "tick-box-others-content");
  }
}

function nextStop(svg) {
  const gButton = svg
    .append("g")
    .attr("transform", `translate(${margin.left}, ${height - 150})`);

  const button = gButton
    .append("circle")
    .attr("r", 25)
    .attr("cx", 50)
    .attr("cy", 45)
    .attr("class", "next-button")
    .attr("id", "swarm-next-button");

  button
    .attr("opacity", 0)
    .transition()
    .duration(1000)
    .delay(2000)
    .attr("opacity", 1);

  const buttonText = gButton
    .append("text")
    .text("Next")
    // .attr("transform", `translate(30, 30)`)
    .attr("x", 49)
    .attr("y", 44)
    .attr("text-anchor", "middle")
    .attr("class", "next-button-text")
    .attr("id", "swarm-next-button-text")
    .attr("dominant-baseline", "central")
    .attr("fill", "white")
    .style("font-size", "14px")
    .style("font-weight", "bold")
    .style("pointer-events", "none")
    .attr("opacity", 0)
    .transition()
    .duration(1000)
    .delay(2000)
    .attr("opacity", 1);

  setTimeout(function () {
    animateButton();
  }, 3000);

  button.on("click", function () {
    // const currentDiv = document.querySelector(".active");
    // const nextDiv = document.getElementById("#map-container");
    // console.log(nextDiv);
    // window.scrollTo({ top: nextDiv.offsetTop, behavior: "smooth" });

    // Navigate to the next div on the same page with a given ID
    const nextDiv = d3.select("#map-container");
    const yOffset = 0;
    const y =
      nextDiv.node().getBoundingClientRect().top + window.pageYOffset + yOffset;
    window.scrollTo({ top: y, behavior: "smooth" });
  });
}

function animateButton() {
  d3.select("#swarm-next-button")
    .transition()
    .duration(duration_medium)
    .delay(2000)
    .ease(d3.easeBounceOut)
    .attr("transform", "translate(0, 0)")
    .transition()
    .duration(duration_medium)
    .ease(d3.easeBounceOut)
    .attr("transform", "translate(0, 20)")
    .transition()
    .duration(duration_medium)
    .ease(d3.easeBounceOut)
    .attr("transform", "translate(0, 0)")
    .on("end", animateButton);

  d3.select("#swarm-next-button-text")
    .transition()
    .duration(duration_medium)
    .delay(2000)
    .ease(d3.easeBounceOut)
    .attr("transform", "translate(0, 0)")
    .transition()
    .duration(duration_medium)
    .ease(d3.easeBounceOut)
    .attr("transform", "translate(0, 20)")
    .transition()
    .duration(duration_medium)
    .ease(d3.easeBounceOut)
    .attr("transform", "translate(0, 0)")
    .on("end", animateButton);
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
