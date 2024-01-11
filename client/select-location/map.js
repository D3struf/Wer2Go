// Initialize and add the map
import { socket } from "../script.js"; 

var map;
var marker;
var lastClickedMarker;
var submittedLocation = {
    coords: "",
    address: "",
    name: ""
};

async function initMap() {
    // Request needed libraries.
    const { Map } = await google.maps.importLibrary("maps");
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

    // The map, centered at Uluru
    map = new Map(document.getElementById("map"), {
        zoom: 17,
        center: { lat: 14.5871, lng: 120.9845 },
        mapId: "DEMO_MAP_ID",
    });

    // The marker, positioned at TUPM
    // const marker = new AdvancedMarkerElement({
    //     map: map,
    //     position: position,
    //     title: "TUPM",
    // });
    // 14.5871, 120.9845
    // var position;

    makeMarker({
        lat: 14.5871, 
        lng: 120.9845 
    });

    // Dynamic function for adding a marker
    function makeMarker(coordinates) {
        lastClickedMarker = new AdvancedMarkerElement({
            map: map,
            position: coordinates
        });
    }

    // For searching locations
    const input = document.getElementById("search-input");
    const searchBox = new google.maps.places.SearchBox(input);

    // position of the search box
    map.controls[google.maps.ControlPosition.TOP_CENTER].push(input);

    map.addListener("bounds_changed", function () {
        searchBox.setBounds(map.getBounds());
    });

    // For handling search results
    searchBox.addListener("places_changed", function () {
        const places = searchBox.getPlaces();

        if (places.length === 0) {
            return;
        }

        // REmove the marker of the last place
        if (lastClickedMarker && lastClickedMarker.setMap) {
            lastClickedMarker.setMap(null); // Remove the marker from the map
        }

        // Handle the search results, e.g., display markers
        places.forEach(function (place) {
            lastClickedMarker = new google.maps.Marker({
                map: map,
                title: place.name,
                position: place.geometry.location,
            });

            // lat, lng = place.geometry.location;
            // const clickedLocation = {
            //     lat: lat,
            //     lng: lng
            // }
            // console.log(places[0].geometry.location);
            submittedLocation = {
                coords: place.geometry.location,
                address: place.formatted_address,
                name: place.name
            };
        });
        // console.log(lastClickedMarker.position);
        // submittedLocation = {
        //     coords: places[0].geometry.location,
        //     address: places[0].formatted_address,
        //     name: places[0].name
        // };

        // Center the map on the first result
        map.setCenter(places[0].geometry.location);
    });

    // Change location when the location is clicked on
    // Add click event listener to the map
    map.addListener("click", function (event) {
        // Get the clicked location
        const clickedLocation = event.latLng.toJSON();

        // Update the position of the current location marker
        // Remove the last clicked marker if it exists
        if (lastClickedMarker && lastClickedMarker.setMap) {
            lastClickedMarker.setMap(null); // Remove the marker from the map
        }

        //create a label for the marker when hovered
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ location: clickedLocation }, function (results, status) {
            if (status === google.maps.GeocoderStatus.OK) {
                // Get the first result (assuming it's the most relevant)
                const firstResult = results[0];

                // Extract the place name from the result
                const placeAddress = firstResult.formatted_address;
                // Get the place_id from the geocoding result
                const placeId = firstResult.place_id;

                // Use Places API to get additional details
                const placesService = new google.maps.places.PlacesService(map);

                placesService.getDetails({ placeId: placeId }, function (place) {
                    const placeName = place.name;
                    // console.log("Place Name " + placeName);

                    // Create a new marker at the clicked location with the place name as the title
                    lastClickedMarker = new google.maps.Marker({
                        map: map,
                        position: clickedLocation,
                        title: placeName
                    });

                    // Store the clicked location
                    submittedLocation = {
                        coords: clickedLocation,
                        address: placeAddress,
                        name: placeName
                    };
                });

                console.log("Submitted Location:", submittedLocation);
                // When the location clicked does not have an exact name
            } else {
                lastClickedMarker = new google.maps.Marker({
                    map: map,
                    position: clickedLocation,
                    title: `${clickedLocation.lat.toFixed(6)}, ${clickedLocation.lng.toFixed(6)}`
                });
            }
        });
    });

    // Whenever the user clicks on the search bar it will reset the input
    input.addEventListener("focus", function () {
        this.value = ""
    });
}

export function submitButton() {
    console.log("Submitted Location:", submittedLocation);
    // console.log("Name: " + submittedLocation.name.address);
    var {lat, lng} = submittedLocation.coords;

    document.getElementById("demo").innerHTML =
    "Location: " + submittedLocation.address + " | " + submittedLocation.name;
    console.log("Location: Latitude: " + lat + " Longitude: " + lng + " | " + submittedLocation.address  + " | " + submittedLocation.name);

    // document.getElementById("mem").innerHTML = "Voters: " + voters;
    return submittedLocation;
}

document.addEventListener("DOMContentLoaded", function () {
    document.getElementById('submit').addEventListener('click', function() {
        const selectedLocation = getSelectedLocation()
        overlay.style.display = 'block'

        const confirmOverlayBtn = document.getElementById('confirmOverlayBtn')
        if (selectedLocation.address.length <= 1) {
            confirmOverlayBtn.innerHTML = 'Okay'
            document.getElementById('nominated-trip').innerHTML = "Please select a location."
        }
        else {
            const roomId = sessionStorage.getItem('roomId')
            confirmOverlayBtn.innerHTML = 'Confirm'
            document.getElementById('nominated-trip').innerHTML = selectedLocation.address
            // Emit the selected location to the server
            socket.emit('submit-location', { location: selectedLocation.address, coords: selectedLocation.coords, roomId })
            
        }
    });
});

function getSelectedLocation() {
    var resultObject = {
        coords: "",
        address: "",
        name: ""
    };
    // Submit Button on the map
    const {coords, address, name } = submitButton();

    resultObject.coords = coords;
    resultObject.address = address;
    resultObject.name = name;
    console.log(resultObject.address)
    return resultObject;
}

window.onload = function() {
    initMap();
};
