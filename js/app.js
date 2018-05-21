"use strict";

var map;
var markers = [];
var infoWindow;
var loaded;
var modelInstance;

var ViewModel = function () {
    var self = this;
    var loadRestaurants = function (restaurants) {
        self.locations.removeAll();
        restaurants.forEach(function (r, index) {
            r.restaurant.index = index;
            self.locations.push(r.restaurant);
        });
        markers.forEach(function (m) {
            m.setMap(null);
        });
        markers = [];
        self.loadLocations();
    };
    this.locations = ko.observableArray([]);
    this.search = '';
    this.loadInfo = function (element) {
        self.showMarker(element.index);
        hamburgerClose();
    };
    this.searchNeighbourhood = function () {
        callAPI(this.search, loadRestaurants);
    };
    callAPI(null, loadRestaurants);
};

// Load locations in locations observable and tag markers on map
ViewModel.prototype.loadLocations = function () {
    var self = this;
    this.locations().forEach(function (restaurant, index) {
        var element = new google.maps.Marker({
            map: map,
            position: {
                "lat": +restaurant.location.latitude,
                "lng": +restaurant.location.longitude
            },
            animation: google.maps.Animation.DROP
        });
        markers[index] = element;

        element.addListener('click', function () {
            element.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(function () {
                element.setAnimation();
            }, 2000);
            self.showMarker(index);
        });
    });
};

// Show markers for each marker of given index in locations observable
ViewModel.prototype.showMarker = function (index) {
    infoWindow.setContent(this.getMarkerContent(index));
    infoWindow.open(map, markers[index]);
};

// Get marker infobox's HTML content based on index in locations observable
ViewModel.prototype.getMarkerContent = function (index) {
    var item = this.locations()[index];
    var photo = item.featured_image;
    var name = item.name;
    var location = item.location.locality_verbose;
    var cost = item.average_cost_for_two;
    var cuisines = item.cuisines;
    var str = '<div class="info-window" style="background: url(' + photo + '); background-size: contain"><div class="wrapper"><h1>' + name + '</h1><div class="cuisines"> ' + cuisines + '</div><div class="location">' + location + '</div> <div class="cost"> Cost for two: ' + cost + '</div></div><div>'
    return str;
};


function initMap() {
    // Initializing map to my location
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 23.0350,
            lng: 72.5293
        },
        zoom: 14
    });

    infoWindow = new google.maps.InfoWindow({
        maxWidth: 320
    });
    loaded = 1;
    modelInstance = new ViewModel();
    ko.applyBindings(modelInstance);
}

// Just notifying user if maps API did not load
function mapsNotLoaded(){
    alert("Google maps has failed, Map will not load. Sorry for inconvenience");    
}

// Call zomato API and present with a list of restaurants nearby
function callAPI(keyword, callback) {
    var apiKey = 'ec4570965cbd2914d9d4677fa91883dc';
    var url = '';
    if (keyword) {
        url = "https://developers.zomato.com/api/v2.1/search?entity_id=11311&entity_type=subzone&q=" + keyword
    } else {
        url = "https://developers.zomato.com/api/v2.1/location_details?entity_id=11311&entity_type=subzone"
    }
    fetch(url, {
        headers: {
            'user-key': apiKey,
            Accept: 'application/json'
        }
    }).then(function (response) {
        response.json().then(function (json) {
            var restaurants = keyword ? json.restaurants : json.best_rated_restaurant;
            callback(restaurants);
        }).catch(function (error) {
            alert("Failure parsing response, inconvenience is regretted, you can mail the developer with the following \n " + error.message );
        });
    }).catch(function (error) {
        alert("Failure while getting data, inconvenience is regretted, you can mail the developer with the following \n " + error.message );
    });
}



