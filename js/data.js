/*
  data.js
  Load all required data and exports it.
  Defines the colors for the visualization
*/

/* Loading all datasets */
const dataPromise = Promise.all([
  d3.csv("./data/coffeeConsumption.csv"),
  d3.csv("./data/totalConsumption.csv"),
  d3.json("./data/map/world.geojson"),
  d3.csv("./data/sunshineDuration.csv"),
  d3.csv("./data/countryTemperatures.csv"),
  d3.csv("./data/timeUse.csv"),
  d3.csv("./data/happinessIndex.csv"),
  d3.csv("./data/laborProductivity.csv"),
  d3.csv("./data/landUsePer100g.csv"),
  d3.csv("./data/ghgPer100g.csv"),
]);

export default dataPromise;

const brown = "#62350e";
const contrast = "#6291d3";
const lightgrey = "#dfdede";
const grey = "#b4b2b2";
const darkgrey = "#747373";
const duration_small = 500;
const duration_medium = 1000;
const duration_large = 2000;
const danger_red = "#d02305";

export {
  brown,
  contrast,
  lightgrey,
  grey,
  darkgrey,
  danger_red,
  duration_large,
  duration_medium,
  duration_small,
};
