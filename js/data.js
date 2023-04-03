/*
  data.js: To load all required data
  TODO: Add sourcing information here.
*/

const dataPromise = Promise.all([
  d3.csv("./data/coffeeConsumption.csv"),
  d3.csv("./data/totalConsumption.csv"),
  d3.csv("./data/sunshineDuration.csv"),
  d3.csv("./data/countryTemperatures.csv"),
  d3.csv("./data/totalLeisure.csv"),
  d3.csv("./data/happinessIndex.csv"),
  d3.csv("./data/laborProductivity.csv"),
  d3.csv("./data/landUsePer100g.csv"),
  d3.csv("./data/ghgPer100g.csv"),
  d3.csv("./data/freshWaterPer100g.csv"),
]);

export default dataPromise;

/* For ease of copy paste */

// coffeepercapdata,
// coffeetotaldata,
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
