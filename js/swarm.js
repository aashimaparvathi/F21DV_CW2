/*
  swarm.js
  The file corresponding to the first visualization, i.e., swarm plot

  Functions:
  testData() - to test data is retrieved correctly
  fixData() - prep the data for visualizations with analytics techniques
  drawSwarm() - draw the swarm plot

  Functions to add insight annotations:
  othersAnnotations();
  averageAnnotation();
  norwayAnnotation();
  finlandAnnotation();

  Function to add a button that helps the user navigate through the visualizations.
  This function is exported and used by other files in the code project.
  nextStop(svg, whereto, content, xpos, ypos);

*/

import dataPromise from "./data.js";
import {
  brown,
  contrast,
  lightgrey,
  grey,
  darkgrey,
  duration_large,
  duration_medium,
  duration_small,
} from "./data.js";

var coffeepercap;

const margin = { top: -20, right: 60, bottom: 0, left: 60 };
const centerX = 0;
const width = 1000 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

var annotateDelay = 1000;
const delayOffset = 1500;

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

/*
  testData()
  Function to ensure data is correctly retrieved for all use in the current file
*/
function testData() {
  console.log(coffeepercap);
}

/*
  fixData()
  Perform data analytics techniques on the data retrieved from the CSV files
  And prepare them for the visualizations.
  This function performs operations such as filter, sort, map, group etc.
*/
function fixData() {
  coffeepercap.forEach(function (d) {
    d.percapitaconsumption = +d.percapitaconsumption;
  });
  /* Sort in descending order of per capita consumption */
  coffeepercap.sort(function (a, b) {
    return b.percapitaconsumption - a.percapitaconsumption;
  });
}

/*
  drawSwarm()
  Function to draw the swarm plot
*/
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
  //console.log(nestedData);

  // create an array of objects with each tick representing the per capita consumption
  // and the number of countries that belong to each category.
  const ticksData = Array.from(nestedData, ([key, values]) => {
    return {
      tick: key,
      numCircles: values.length,
    };
  });

  //console.log(ticksData);

  ticksData.forEach((d) => {
    const tick = d.tick;
    const numCircles = d.numCircles;
    const angleStep = (2 * Math.PI * Math.sin(0.5)) / numCircles;

    for (let i = 0; i < numCircles; i++) {
      const radius = 30; //* i;
      const angle = i * angleStep + Math.PI / 2;
      const cx = xScale(tick) + radius * Math.cos(angle);
      const cy = yScale(Math.random()) + radius * Math.sin(angle);

      const country = nestedData.get(tick)[i].country;
      // console.log(country);
      // console.log(nestedData.get(tick)[i]);

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
        .attr(
          "alt",
          "Images of coffee beans are used to represent countries on the chart showing the distribution of per capita coffee consumption of various countries"
        )
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

  /* Add all annotations */
  othersAnnotations(svg, gAxis);
  averageAnnotation(svg, gAxis);
  norwayAnnotation(svg, gAxis);
  finlandAnnotation(svg, gAxis);

  /* Add a next button for navigating to the next screen */
  nextStop(svg, "why-container", "Next", 0, 150);

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

    // Set the mouseover event for the bean elements
    svg.selectAll(".bean").on("mouseover", (event, d) => {
      tooltip
        .style("opacity", 1)
        .html(`${d.country}`)
        .style("left", `${event.pageX}px`)
        .style("top", `${event.pageY}px`);
    });
  });
}

/*
  Function: finlandAnnotation()
  Add insights about Finland's coffee consumption
*/
function finlandAnnotation(svg, gAxis) {
  // finland tick
  const tickFinland = gAxis.select(".tick:nth-of-type(9)");

  tickFinland.attr("color", contrast);

  annotateDelay = annotateDelay + delayOffset / 2;

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
    .delay(annotateDelay)
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
    .text("Kudos to the biggest 'Kahvi' lovers !")
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

/*
  Function: norwayAnnotation()
  Add insights about Norway's coffee consumption
*/
function norwayAnnotation(svg, gAxis) {
  const tickNorway = gAxis.select(".tick:nth-of-type(7)");

  tickNorway.attr("color", brown).attr("stroke-opacity", 0.5);

  const transform = tickNorway.attr("transform");
  const [, pos] = transform.split("(");
  const [x, y] = pos.split(",").map(parseFloat);

  // End position of line and rectangle
  const lineEndY = y + height - 420;
  const rectX = x - 10;
  const rectY = lineEndY; // for aligning line and rectangle

  // Create a group g for the line and rectangle
  const gLineRect = svg
    .append("g")
    .attr("transform", `translate(${centerX}, ${height / 2 + 10})`);

  annotateDelay = annotateDelay + delayOffset;
  // Append a line element to the group
  gLineRect
    .append("line")
    .attr("x1", x)
    .attr("y1", y)
    .attr("x2", x)
    .attr("y2", lineEndY - 5)
    .attr("stroke", brown)
    .attr("stroke-opacity", 0.2)
    .attr("opacity", 0)
    .transition()
    .duration(duration_medium)
    .delay(annotateDelay)
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
    .delay(annotateDelay)
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
    .delay(annotateDelay)
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

/*
  Function: averageAnnotation()
  Add insights about the average coffee consumers
*/
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
    .text("we have all 5 Nordic countries in the top 10 .. >>")
    .attr("font-weight", "bold")
    .attr("fill", brown)
    .attr("class", "tick-box-avg-content");

  averagesText
    .append("tspan")
    .attr("x", 50)
    .attr("dy", "1em")
    .text("(8 - 9 kg)")
    .attr("fill", brown)
    .attr("class", "tick-box-avg-content");
}

/*
  Function: othersAnnotation()
  Add insights about the countries that consume the least coffee per capita
*/
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
      // .delay(i * 10)
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

  othersText
    .append("tspan")
    .attr("x", -95)
    .attr("dy", "1em")
    .attr("text-anchor", "start")
    .transition()
    .duration(duration_medium)
    // .delay(i * 10)
    .text("(5 - 7 kg)")
    .attr("fill", grey)
    .attr("class", "tick-box-others-content");
}

/*
  Function to add a button that helps the user navigate through the visualizations.
  This function is exported and used by other files in the code project.
  nextStop(svg, whereto, content, xpos, ypos);
*/
export function nextStop(svg, whereto, bText, tLeft, tRight) {
  const gButton = svg
    .append("g")
    .attr("transform", `translate(${margin.left + tLeft}, ${height - tRight})`);

  const button = gButton
    .append("circle")
    .attr("r", 25)
    .attr("cx", 50)
    .attr("cy", 45)
    .attr("class", "next-button")
    .attr("id", "swarm-next-button");

  annotateDelay = annotateDelay + delayOffset;

  button
    .attr("opacity", 0)
    .transition()
    .duration(1000)
    .delay(annotateDelay)
    .attr("opacity", 1);

  const buttonText = gButton
    .append("text")
    .text(bText)
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
    .delay(annotateDelay)
    .attr("opacity", 1);

  button.on("click", function () {
    // Navigate to the next div on the same page with a given ID
    const nextDiv = d3.select("#" + whereto);
    const yOffset = 0;
    const y =
      nextDiv.node().getBoundingClientRect().top + window.pageYOffset + yOffset;
    window.scrollTo({ top: y, behavior: "smooth" });
  });
}
