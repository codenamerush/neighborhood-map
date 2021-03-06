"use strict";

var map;
var markers = [];
var infoWindow;
var loaded;
var modelInstance;

var ViewModel = function () {
    var self = this;
    this.sidenav = ko.observable('disabled');
    this.cuisines = ko.observableArray([]);
    this.locations = ko.observableArray([]);
    this.search = ko.observable();
    this.enableSideNav = function () {
        self.sidenav('active');
    }
    this.disableSideNav = function () {
        self.sidenav('disabled');
    }
    this.loadInfo = function (element) {
        self.sidenav('disabled');
        self.showInfoBox(element.index);
        markers[element.index].bounceStop();
        map.setCenter({
            lat: markers[element.index].position.lat(),
            lng: markers[element.index].position.lng()
        });
        hamburgerClose();
    };
    this.search.subscribe(function (cuisine) {
        self.locations().forEach(function (location) {
            var isLocationVisible = (cuisine === 'All' || location.cuisines.indexOf(cuisine) > -1);
            location.isLocationVisible(isLocationVisible);
            markers[location.index].setMap(isLocationVisible ? map : null);
        });
    });
    callAPI(function (restaurants) {
        self.locations.removeAll();
        self.cuisines.push('All');
        restaurants.forEach(function (r, index) {
            r.restaurant.index = index;
            r.restaurant.isLocationVisible = ko.observable(true);
            r.restaurant.cuisines.split(",").forEach(function (cuisine) {
                cuisine = cuisine.trim();
                if (self.cuisines.indexOf(cuisine) < 0) {
                    self.cuisines.push(cuisine);
                }
            });
            self.locations.push(r.restaurant);
        });
        markers.forEach(function (m) {
            m.setMap(null);
        });
        markers = [];
        self.loadLocations();
    });
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
            element.bounceStop();
            self.showInfoBox(index);
        });
    });
};

// Show Info box for each marker of given index in locations observable
ViewModel.prototype.showInfoBox = function (index) {
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

    google.maps.Marker.prototype.bounceStop = function () {
        var element = this;
        element.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function () {
            element.setAnimation();
        }, 2000);
    };

    infoWindow = new google.maps.InfoWindow({
        maxWidth: 320
    });
    loaded = 1;
    modelInstance = new ViewModel();
    ko.applyBindings(modelInstance);
}

// Just notifying user if maps API did not load
function mapsNotLoaded() {
    alert("Google maps has failed, Map will not load. Sorry for inconvenience");
}

// Call zomato API and present with a list of restaurants nearby
function callAPI(callback) {
    var apiKey = 'ec4570965cbd2914d9d4677fa91883dc';
    var url = "https://developers.zomato.com/api/v2.1/search?entity_id=11311&entity_type=subzone";
    fetch(url, {
        headers: {
            'user-key': apiKey,
            Accept: 'application/json'
        }
    }).then(function (response) {
        response.json().then(function (json) {
            callback(json.restaurants);
        }).catch(function (error) {
            alert("Failure parsing response, inconvenience is regretted, you can mail the developer with the following \n " + error.message);
        });
    }).catch(function (error) {
        alert("Failure while getting data, inconvenience is regretted, you can mail the developer with the following \n " + error.message);
    });
}
