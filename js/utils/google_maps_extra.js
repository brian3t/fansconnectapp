
map.icons = {
    start: {url: 'img/rider_on_map_new.png', scaledSize: {width: 24, height: 24}},
    end: {url: 'img/dropoff_on_map_new.png', scaledSize: {width: 24, height: 24}},
    driver: {url: 'img/driver_on_map_new.png', scaledSize: {width: 24, height: 24}}
};

map.makeMarker = function (position, icon, title) {
    new google.maps.Marker({
        position: position,
        map: map,
        icon: icon,
        title: title
    });
};
