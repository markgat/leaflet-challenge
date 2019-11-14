// Indentify url of dataset for all earthquakes within the last 7 days
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Get request on url
d3.json(queryUrl, function(data) {
  // send data to function for plotting 
  plots(data.features);
});

//Define function to return hexadecimal color value based on earthquake magnitude
function coloring(mag){
  return mag > 5 ? '#f06b6a' :
         mag > 4 ? '#f0a76b' :
         mag > 3 ? '#f3ba4d' :
         mag > 2 ? '#f3db4d' :
         mag > 1 ? '#e1f34d' :
         mag > 0 ? '#b7f34c' :
        '#ffffff';
};

// Create function for plotting earthquake markers and marker characteristics onto a GeoJSON layer
function plots(earthquakeData) {

  // Define a function to run once for each feature in the features array
  // Give each feature a popup describing the place, time, and magnitude of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place +
    // new Date() creates and returns new datetime string from input of milliseconds given by feature.properties.time
      "</h3><hr><h2>Magnitude: "+ feature.properties.mag +"</h2><p>" + new Date(feature.properties.time) + "</p>");
  }

  //Define simple function for setting radius based on magnitude of earthquake for markerparams
  function radius(mag){
    return mag*5
  };


  // Define function for returning circle marker parameters for L.circleMarker
  function markerparams(feature) {
    return {
    // Value of radius and color determined by radius and coloring functions
    radius: radius(feature.properties.mag),
    fillColor: coloring(feature.properties.mag),
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8}
  };
  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Set pointToLayer to function that runs once per data in the array to specify markers as circles with
  // with characteristics defined by markerparams function on feature/data in array
  // Run the onEachFeature function once for each piece of data in the array
  var earthquakes = L.geoJSON(earthquakeData, {
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng, markerparams(feature))},
    onEachFeature: onEachFeature
  });

  // Send our earthquakes layer to the createMap function
  createMap(earthquakes);
}

// Define function to create map
function createMap(earthquakes) {

  // Define satmap, lightmap, and darkmap layers
  var lightmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.light",
    accessToken: API_KEY
  });

  var satmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.satellite",
    accessToken: API_KEY
  });

  var darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.dark",
    accessToken: API_KEY
  });

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Satellite Map": satmap,
    "Light Map": lightmap,
    "Dark Map": darkmap
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create our map, giving it the satmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [satmap, earthquakes]
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  //Create legend
  var legend = L.control({position: 'bottomright'});
  // Define function to be called when legend layer is added to map
  legend.onAdd = function (map) {
    // Use L.DomUtil to create div element with style properties from info and legend classes defined css
    var div = L.DomUtil.create('div', 'info legend'),
    // Define grades for legend categories
    grades = [0,1,2,3,4,5];

    // loop through array of grades
    for (var i = 0; i < grades.length; i++) {
      // For each legend category, add HTML inside div element specifying current category color and range label
      div.innerHTML +=
          '<i style="background:' + coloring(grades[i] + 1) + '"></i> ' +
          grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }
    // return div element when legend control layer added to map
    return div;
  };
  // add legend to map
  legend.addTo(myMap);
}