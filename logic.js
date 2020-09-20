// Store our API endpoint inside queryUrl

https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson

function buildUrl(){
    const
        path = 'earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson'


    return `https://${path}`;
}

function createFeatures(earthquakeData) {

    // Define a function we want to run once for each feature in the features array
    // Give each feature a popup describing the place and time of the earthquake
    function onEachFeature(feature, layer) {
        layer.bindPopup("<h3>" + feature.properties.place +
        "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
    }

    // Create a GeoJSON layer containing the features array on the earthquakeData object
    // Run the onEachFeature function once for each piece of data in the array
    function magRadius(magnitude) {
        return magnitude * 15000;
    }

    //referenced "world cup" exercise
    function maggrades(magnitude) {
        if (magnitude < 1) {
          return "#00ffff"
        }
        else if (magnitude < 2) {
          return "#99ff33"
        }
        else if (magnitude < 3) {
          return "#ffff00"
        }
        else if (magnitude < 4) {
          return "#ff9900"
        }
        else if (magnitude < 5) {
          return "#ff0000"
        }
        else {
          return "black"
        }
      }
    
    
      var earthquakes = L.geoJSON(earthquakeData, {
        pointToLayer: function(earthquakeData, latlng) {
          return L.circle(latlng, {
            radius: magRadius(earthquakeData.properties.mag),
            color: maggrades(earthquakeData.properties.mag),
            fillOpacity: .5
          });
        },
        onEachFeature: onEachFeature
      });
    
    // Sending our earthquakes layer to the createMap function
    createMap(earthquakes);
}

function createMap(earthquakes) {

    // Define streetmap and darkmap layers
    const streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
            attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
            maxZoom: 18,
            id: "mapbox.streets",
            accessToken: API_KEY
    });

    const darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
            attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
            maxZoom: 18,
            id: "mapbox.dark",
            accessToken: API_KEY
    });

    // Define a baseMaps object to hold our base layers
    const baseMaps = {
            "Street Map": streetmap,
            "Dark Map": darkmap
    };

    // Create overlay object to hold our overlay layer
    const overlayMaps = {
            Earthquakes: earthquakes
    };

    // Create our map, giving it the streetmap and earthquakes layers to display on load
    const myMap = L.map("map", {
            center: [37.09, -95.71],
            zoom: 5,
            layers: [streetmap, earthquakes]
    });

    // Create a layer control
    // Pass in our baseMaps and overlayMaps
    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
            collapsed: false
    }).addTo(myMap);


//referenced "https://leafletjs.com/examples/choropleth/"
    function getColor(d) {
        return d > 5 ? '#ff0000' :
            d > 4 ? '#ff9900' :
            d > 3 ? '#ffff00' :
            d > 2 ? '#99ff33' :
            d > 1 ? '#00ffff' :
            '#FFEDA0';
    }

    var legend = L.control({position: 'bottomright'});

    legend.onAdd = function (map) {

        var div = L.DomUtil.create('div', 'info legend'),
            grades = [0, 1, 2, 3, 4, 5],
            labels = [];

    // loop through our density intervals and generate a label with a colored square for each interval
        for (var i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }

    return div;
};

    legend.addTo(myMap);

}

(async function(){
    const queryUrl = buildUrl();
    const data = await d3.json(queryUrl);
    // Once we get a response, send the data.features object to the createFeatures function
    createFeatures(data.features);
})()
