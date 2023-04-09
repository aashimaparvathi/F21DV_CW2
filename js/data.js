/*
  data.js: To load all required data
  TODO: Add sourcing information here.

  world.geojson: "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"
  Removed Antarctica as it is nt crucial to the story and the map remains relatable even without it
*/

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
  d3.csv("./data/freshWaterPer100g.csv"),
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

/* For ease of copy paste */

// coffeepercapdata,
// coffeetotaldata,
// worlddata,
// sunshinedata,
// temperaturedata,
// leisuredata,
// happinessdata,
// productivitydata,
// landusedata,
// ghgemissiondata,
// freshwaterdata,

// coffeepercap,
// coffeetotal,
// world,
// sunshine,
// temperature,
// leisure,
// happiness,
// productivity,
// landuse,
// ghgemission,
// freshwater,

// console.log(coffeepercap);
// console.log(coffeetotal);
// console.log(sunshine);
// console.log(temperature);
// console.log(leisure);
// console.log(happiness);
// console.log(productivity);
// console.log(landuse);
// console.log(ghgemission);
// console.log(freshwater);
