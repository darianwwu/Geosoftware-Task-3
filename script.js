/**
* Aufgabe 3 Geosoft 1, SoSe 2022
* Vorlage: Musterlösung zu Aufgabe 2
* @author Darian Weiss   matr.Nr.: 515040
* @version 1.3.2
*/

"use strict";

//declaration of global variables
var pointcloud;
var point;

/**
* @function onLoad function that is executed when the page is loaded
*/
function onLoad() {
  //event listener
  document.getElementById("refreshBtn").addEventListener("click",
    () => {
      refresh()
    }
  );
  document.getElementById("getLocationBtn").addEventListener("click",
    () => {
      var x = document.getElementById("userPosition");
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
      } else {
        x.innerHTML = "Geolocation is not supported by this browser.";
      }
    }
  );
  document.getElementById("getDataBtn").addEventListener("click",
  () => {
    getData();
  }
  );
 
  //daten vorbereiten und main ausführen
  pois = JSON.parse(pois);
  main(point, pointcloud);
}

//##############################################################################
//## FUNCTIONS
//##############################################################################

/**
* @function main the main function
*/
function main(point, pointcloud) {
  //sortiere Daten nach distanz und mach damit eine Tabelle auf der HTML
  let results = sortByDistance(point, pois);
  drawTable(results);
}

/**
* @function refresh
* @desc is called when new coordinates are inserted. refreshes the data on the site
*/
function refresh() {
  let positionGeoJSON = document.getElementById("userPosition").value;

  //remove all table rows
  var tableHeaderRowCount = 1;
  var table = document.getElementById('resultTable');
  var rowCount = table.rows.length;
  for (var i = tableHeaderRowCount; i < rowCount; i++) {
    table.deleteRow(tableHeaderRowCount);
  }

  try {
    positionGeoJSON = JSON.parse(positionGeoJSON);
    //check validity of the geoJSON. it can only be a point
    if (validGeoJSONPoint(positionGeoJSON)) {
      point = positionGeoJSON.features[0].geometry.coordinates;
      main(point, pointcloud);
    } else {
      alert("invalid input.please input a single valid point in a feature collection");
    }
  }
  catch (error) {
    console.log(error);
    alert("invalid input. see console for more info.");
  }
}

/**
* @function sortByDistance
* @desc takes a point and an array of points and sorts them by distance ascending
* @param point array of [lon, lat] coordinates
* @param pointArray array of points to compare to
* @returns Array with JSON Objects, which contain coordinate and distance
*/
function sortByDistance(point, pointArray) {
  let output = [];

  for (let i = 0; i < pointArray.features.length; i++) {
    let distance = twoPointDistance(point, pointArray.features[i].geometry.coordinates);
    let j = 0;
    //Searches for the Place
    while (j < output.length && distance > output[j].distance) {
      j++;
    }
    let newPoint = {
      coordinates: pointArray.features[i].geometry.coordinates,
      distance: distance,
      name: pointArray.features[i].properties.name
    };
    output.splice(j, 0, newPoint);
  }

  return output;
}

/**
* @function twoPointDistance
* @desc takes two geographic points and returns the distance between them. Uses the Haversine formula (http://www.movable-type.co.uk/scripts/latlong.html, https://stackoverflow.com/questions/27928/calculate-distance-between-two-latitude-longitude-points-haversine-formula)
* @param start array of [lon, lat] coordinates
* @param end array of [lon, lat] coordinates
* @returns the distance between 2 points on the surface of a sphere with earth's radius
*/
function twoPointDistance(start, end) {
  //variable declarations
  var earthRadius; //the earth radius in meters
  var phi1;
  var phi2;
  var deltaLat;
  var deltaLong;

  var a;
  var c;
  var distance; //the distance in meters

  //function body
  earthRadius = 6371e3; //Radius
  phi1 = toRadians(start[1]); //latitude at starting point. in radians.
  phi2 = toRadians(end[1]); //latitude at end-point. in radians.
  deltaLat = toRadians(end[1] - start[1]); //difference in latitude at start- and end-point. in radians.
  deltaLong = toRadians(end[0] - start[0]); //difference in longitude at start- and end-point. in radians.

  a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) + Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLong / 2) * Math.sin(deltaLong / 2);
  c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  distance = earthRadius * c;

  return distance;
}

/**
* @function validGeoJSONPoint
* @desc funtion that validates the input GeoJSON so it's only a point
* @param geoJSON the input JSON that is to be validated
* @returns boolean true if okay, false if not
*/
function validGeoJSONPoint(geoJSON) {
  if (geoJSON.features.length == 1
    && geoJSON.features[0].geometry.type.toUpperCase() == "POINT"
  ) {
    return true;
  } else {
    return false;
  }
}

/**
* @function toRadians
* @desc helping function, takes degrees and converts them to radians
* @returns a radian value
*/
function toRadians(degrees) {
  var pi = Math.PI;
  return degrees * (pi / 180);
}

/**
* @function toDegrees
* @desc helping function, takes radians and converts them to degrees
* @returns a degree value
*/
function toDegrees(radians) {
  var pi = Math.PI;
  return radians * (180 / pi);
}

/**
 * @function drawTable
 * @desc inserts the calculated data into the table that's displayed on the page
 * @param {*} results array of JSON with contains
 */
function drawTable(results) {
  var table = document.getElementById("resultTable");
  //creates the Table with the direction an distances
  for (var j = 0; j < results.length; j++) {
    var newRow = table.insertRow(j + 1);
    var cel1 = newRow.insertCell(0);
    var cel2 = newRow.insertCell(1);
    var cel3 = newRow.insertCell(2);
    cel1.innerHTML = results[j].coordinates;
    cel2.innerHTML = results[j].name;
    cel3.innerHTML = results[j].distance;
  }
}

/**
 * @function drawTableNew
 * @desc inserts the calculated data into the first table that's displayed on the page
 * @param {*} results array of JSON with contains
 */
function drawTableNew(results) {
  var table = document.getElementById("resultTableNew");
  //creates the Table with the direction an distances
  for (var j = 0; j < results.length; j++) {
    var newRow = table.insertRow(j + 1);
    var cel1 = newRow.insertCell(0);
    var cel2 = newRow.insertCell(1);
    var cel3 = newRow.insertCell(2);
    cel2.innerHTML = results[j].koordinaten;
    cel1.innerHTML = results[j].name;
    cel3.innerHTML = (Math.round(twoPointDistance(results[j].koordinaten, point)));
  } 
}

/**
 * @function drawTableNewNew
 * @desc inserts the calculated data into the second table that's displayed on the page
 * @param {*} results array of JSON with contains
 */
function drawTableNewNew(results) {
  var table = document.getElementById("resultTableNewTakeOff");
  //creates the Table with the direction an distances
  for (var j = 0; j < results.length; j++) {
    var newRow = table.insertRow(j + 1);
    var cel1 = newRow.insertCell(0);
    var cel2 = newRow.insertCell(1);
    var cel3 = newRow.insertCell(2);
    var cel4 = newRow.insertCell(3);
    cel1.innerHTML = results[j].lbez;
    cel2.innerHTML = results[j].richtungstext;
    cel3.innerHTML = results[j].linientext;
    cel4.innerHTML = (zeitUmrechnen(results[j].abfahrtszeit));
  } 
}

/**
* @function arrayToGeoJSON
* @desc function that converts a given array of points into a geoJSON feature collection.
* @param inputArray Array that is to be converted
* @returns JSON of a geoJSON feature collectio
*/
function arrayToGeoJSON(inputArray) {
  //"Skeleton" of a valid geoJSON Feature collection
  let outJSON = { "type": "FeatureCollection", "features": [] };
  //skelly of a (point)feature
  let pointFeature = { "type": "Feature", "properties": {}, "geometry": { "type": "Point", "coordinates": [] } };

  //turn all the points in the array into proper features and append
  for (const element of inputArray) {
    let newFeature = pointFeature;
    newFeature.geometry.coordinates = element;
    outJSON.features.push(JSON.parse(JSON.stringify(newFeature)));
  }

  return outJSON;
}

/**
 * @function showPosition
 * @desc Shows the position of the user in the textares
 * @param {*} position Json object of the user
 */
function showPosition(position) {
  var x = document.getElementById("userPosition");
  //"Skeleton" of a valid geoJSON Feature collection
  let outJSON = { "type": "FeatureCollection", "features": [] };
  //skelly of a (point)feature
  let pointFeature = {"type": "Feature","properties": {},"geometry": {"type": "Point","coordinates": []}};
  pointFeature.geometry.coordinates = [position.coords.longitude, position.coords.latitude];
  //add the coordinates to the geoJson
  outJSON.features.push(pointFeature);
  x.innerHTML = JSON.stringify(outJSON);
}

/**
 * @function bushaltestellenImUmkreis
 * @desc inserts the calculated data into the table that's displayed on the page
 * @param radius radius in m
 * @param haltestellenarray array of Obejcts from type Bushaltestelle
 */
function bushaltestellenImUmkreis(radius, haltestellenarray){
   let haltestellenarrayoi = new Array;
   for (var i = 0; i <haltestellenarray.length; i++) {
     if(twoPointDistance(haltestellenarray[i].koordinaten, point) < radius){
    haltestellenarrayoi.push(haltestellenarray[i]);
   }
  }
  console.log(haltestellenarrayoi);
  drawTableNew(haltestellenarrayoi);
for (var k = 0; k <haltestellenarrayoi.length; k++){
  const xhrnew = new XMLHttpRequest();
  const haltnr = haltestellenarrayoi[k].nr;
  xhrnew.open('GET', 'https://rest.busradar.conterra.de/prod/haltestellen/'+haltnr+'/abfahrten');
  xhrnew.onload = () => {
    let datanew = JSON.parse(xhrnew.response);
    console.log(datanew);
    drawTableNewNew(datanew);
  }
  xhrnew.send();
  }
  }

  /**
 * @function getData
 * @desc Recieves data from the server.
 */
const getData = () => {
  const xhr = new XMLHttpRequest();
  xhr.open('GET', 'https://rest.busradar.conterra.de/prod/haltestellen');
  xhr.onload = () => {
    const data = JSON.parse(xhr.response);
    console.log(data);
    let haltestellenarray = Array.apply(null, Array[data.features.length]);
    for (var h = 0; h < data.features.length; h++) {
     haltestellenarray[h] = new Bushaltestelle(data.features[h].properties.nr, data.features[h].properties.lbez, data.features[h].properties.richtung, data.features[h].geometry.coordinates);
     
     }
     console.log(haltestellenarray);
    bushaltestellenImUmkreis(200, haltestellenarray);
    }
  xhr.send();
}

/**
 * @function zeitUmrechnen
 * @param sekunden seconds that will be converted
 * @returns time in gmt format
 */
function zeitUmrechnen(sekunden){
  var datum = new Date(0);
  datum.setSeconds(45);
  var timeString = datum.toISOString().substr(11,8);
  var millisek = sekunden * 1000 +(60000*120);
  var datum = new Date(millisek);
  var zeit = datum.toISOString().slice(0,-5);
  return zeit;
}

/**
 * @public
 * @desc Class of Bushaltestellen.
 */
class Bushaltestelle {
  constructor(nr, name, richtung, koordinaten) {
    this.nr = nr;
    this.name = name;
    this.richtung = richtung;
    this.koordinaten = koordinaten;
  }
}
