import dataPromise from "./data.js";

var coffeepercap, coffeetotal;

dataPromise.then(function ([coffeepercapdata, coffeetotaldata]) {
  console.log("map.js");
  coffeepercap = coffeepercapdata;
  coffeetotal = coffeetotaldata;

  /* Test that data is retrieved correctly */
  testData();
  fixData();
  drawMap();
});

function testData() {
  console.log(coffeepercap);
  console.log(coffeetotal);
}

function fixData() {}

function drawMap() {}
