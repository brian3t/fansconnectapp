app.views.View_riders_view = Backbone.View.extend({
    map: {},
    model: {},
    requests: [],
    cusers: {},
    status: 'idle',
    set_status: function (new_status) {
        this.status = new_status;
        app.cuser.save({cuser_status: new_status}, {patch: true});
    },
    time_sent: null,
    rider_view: new app.views.RiderView,
    rider_with_ETA_view: new app.views.RiderWithETAView({parent_view: this}),
    request_collection: null,
    request_list_view: null,
    request_markers: [],
    publish_location_interval_id: -1,
    initialize: function () {
        var self = this;
        this.render().afterRender();
        if (typeof google == "undefined" || !google || typeof google.maps == "undefined" || !google.maps) {
            $.getScript("https://maps.googleapis.com/maps/api/js?key=AIzaSyBPeYraJ4H0BiuD1IQanQFlY1npx114ZpM&callback=viewriders_initMap", null);
        }
        this.map = $(this.el).find('#map');
        // $('#map').on('ready', this.query_riders, this);
        this.listenTo(app.cur_rider, 'sync', this.render_children);
        var poll_options = {
            delay: 5000,
            data: {rider: app.cuser.id},
            timeout: 4000
        };
        if (_.isObject(current_pos)) {
            poll_options.data.cur_lat = current_pos.latitude;
            poll_options.data.cur_lng = current_pos.longitude;
        }
        app.request_poller = Backbone.Poller.get(app.request_collection, poll_options);
        app.request_collection.on('success', function (model) {
            this.display_riders();
        });
        app.request_poller.start();
        app.request_poller.on('error', ajax_timeout_request);
        app.request_poller.on('success', ajax_timeout_reset);
        this.rider_with_ETA_view.parent_view = self;
        this.set_status('driver_idle');
    },

    render: function () {
        this.$el.html(this.template($.extend({}, app.cuser.attributes, {commuter_data: app.cuser.commuter_data})));
        $('#map').removeClass('bottom-half');
        return this;
    },
    dom_ready: function () {
        var self = this;

        if (typeof google !== "undefined" && google && typeof google.maps !== "undefined" && google.maps && $('#map').children().length < 1) {
            //API loaded but map is empty
            viewriders_initMap();
        }
        $('#offer_ride').find('.corner_button').click(function () {
            self.cancel_view_rider();
        });
        $('#offer_ride_btn').on('click', function () {
            self.offer_ride.apply(self);
        });
        $('#view_switcher > a').click(function (e) {
            var element_class = $(e.currentTarget).data('view');
            // show or hide the geolocation button on view switch
            if (element_class == "listview") {
                $("#current_pos_wrapper").hide();
            } else {
                $("#current_pos_wrapper").show();
            }
            $('div.content.view_riders > div.view_to_switch').hide();//hide all
            $('div.content.view_riders > div#' + element_class).show();
        });
        this.request_list_view = new app.views.RequestListView({model: app.request_collection, parentView: self});
        this.request_list_view.parentView = self;
        this.$('#listview > #list').html(this.request_list_view.render().el);
        $('#onride').hide();
    },
    afterRender: function () {
    },
    render_children: function () {
        this.$('#rider').html(this.rider_view.render());
    },

    events: {
        "click .logout": "logout",
        "click .back_btn": "back",
        "touchstart .back_btn": "back",
        "click div.select_address_modal div.clickable": "address_selected",
        "click button#request_ride": "request_ride",
        "click #cancel_btn": function () {
            this.cancel_offer_ride('You')
        },
        "change input.address": "set_rider_itin",
        "ready #map": "display_riders",
        "click #confirm_pickup": "confirm_pickup",
        "click #confirm_dropoff": "confirm_dropoff",
        "click .launch_map_app": "launch_map_app"
    },
    pickup_location: {},
    dropoff_location: {},
    logout: function (e) {
        var self = this;
        app_confirm("Are you sure you want to log out?", function (response) {
            if (response == true || response == 1) {
                $('#ridematch_success').hide();
                self.clear_rider_route();
                self.set_status('idle');
                app.reset_user();
                app.router.navigate("#", {trigger: true, replace: true});
            }
            app.utils.misc.hide_popover();
            app.is_notification_active = false;
        })
    },
    back: function (event) {
        $.post(config.restUrl + 'cuser/reset', {id: app.cuser.get('id')});
        ratchet_popover_dismiss();
        app.router.navigate('dashboard', {trigger: true, replace: true});
    },


    reverse_geocode_callback: function (results, status, bbview) {
        if (status === google.maps.GeocoderStatus.OK) {
            if (results[0]) {
                bbview.pickup_location = results[0];
                bbview.$el.find('input[name="' + bbview.address_to_pick + '_address"]').val(bbview.pickup_location.formatted_address);
                map.setZoom(10);
                map.panTo(bbview.pickup_location.geometry.location);
                google.maps.event.clearInstanceListeners(map);
                // bbview.status = null;
                bbview.address_to_pick = null;

            } else {
                console.log('No results found');
                return "not found";
            }
        } else {
            console.log('Geocoder failed due to: ' + status);
        }
        var self = this;
        bbview.set_rider_itin(self);
    },
    map_populate_address: function (event) {
        app.utils.misc.geocodeLatLng(event.latLng, geocoder, this.reverse_geocode_callback, this);
    },
    /**
     * Geodecode pickup / dropoff
     * Put markers on map
     * Save pickup and dropoff in app.cuser
     * Set itinerary
     */
    set_rider_itin: function (request) {
        var self = this;
        if (map.pickup_marker && map.pickup_marker.hasOwnProperty('setMap')) {
            map.pickup_marker.setMap(null);
        }
        // map.pickup_marker = new google.maps.Marker({
        //     map: map,
        //     position: {lat: request.pickup_lat, lng: request.pickup_lng},
        //     icon: 'img/map-pin-a.png',
        //     zIndex: 9999
        // });

        if (map.dropoff_marker && map.dropoff_marker.hasOwnProperty('setMap')) {
            map.dropoff_marker.setMap(null);
        }
        // map.dropoff_marker = new google.maps.Marker({
        //     map: map,
        //     position: {lat: request.dropoff_lat, lng: request.dropoff_lng},
        //     icon: 'img/map-pin-b.png',
        //     zIndex: 9999
        // });
        map.setZoom(11);
        self.draw_rider_route(request);

    },
    draw_rider_route: function (request) {
        map.makeMarker = function (position, icon, title) {
            new google.maps.Marker({
                position: position,
                map: map,
                icon: icon,
                title: title
            });
        };

        //draw route when begin and end are present
        if (map.directionsDisplay != null) {
            map.directionsDisplay.setMap(null);
            map.directionsDisplay = null;
        }
        map.directionsDisplay = new google.maps.DirectionsRenderer({
            suppressMarkers: false
        });
        map.directionsDisplay.setMap(map);
        var query_string = $.param({});
        // var origin_lat_lng = request.pickup_lat + ',' + request.pickup_lng;
        var origin_lat_lng = {lat: parseFloat(request.pickup_lat), lng: parseFloat(request.pickup_lng)};
        // var dest_lat_lng = request.dropoff_lat + ',' + request.dropoff_lng;
        var dest_lat_lng = {lat: parseFloat(request.dropoff_lat), lng: parseFloat(request.dropoff_lng)};
        var dir_request = {
            origin: origin_lat_lng,
            destination: dest_lat_lng,
            travelMode: google.maps.TravelMode.DRIVING
        };
        // map.rider_origin_marker = map.makeMarker(origin_lat_lng, map.icons.start);
        map.rider_dest_marker = map.makeMarker(dest_lat_lng, map.icons.end);
        // app.utils.misc.clearMarkers();
        map.direction.route(dir_request, function (result, status) {
                if (status == google.maps.DirectionsStatus.OK) {
                    map.directionsResult = result;
                    if (_.isArray(map.directionsResult.routes)) {
                        $('.eta').fadeOut('slow', function () {
                            $(this).text(map.directionsResult.routes[0].legs[0].duration.text).fadeIn(500);
                        });
                    }
                    map.directionsDisplay.setDirections(result);
                    map.directionsDisplay.setOptions({
                        suppressMarkers: true,
                        // markerOptions: {
                        //     zIndex: 9999,
                        //     // animation: google.maps.Animation.DROP
                        //     animation: null
                        // }
                    });
                    var bounds = new google.maps.LatLngBounds();
                    bounds.extend(new google.maps.LatLng(request.pickup_lat, request.dropoff_lng));
                    bounds.extend(new google.maps.LatLng(request.dropoff_lat, request.pickup_lng));
                    map.fitBounds(bounds);

                }
            }
        );
    },
    clear_rider_route: function () {
        if (map.directionsDisplay !== null) {
            map.directionsDisplay.setMap(null);
            map.directionsDisplay = null;
        }
        if (_.isObject(map.rider_origin_marker)) {
            map.rider_origin_marker.setMap(null);
        }
        if (_.isObject(map.rider_dest_marker)) {
            map.rider_dest_marker.setMap(null);
        }
    },
    /**
     * Process requests from riders
     * Called after this.requests is populated by query_riders()
     */
    display_riders: function () {
        var self = this;
        if (typeof google == "undefined" || !google) {
            setTimeout(function () {
                    self.display_riders.bind(self);
                }, 1000
            );
            return;
        }
        //remove my own request
        this.requests = app.request_collection.toJSON();
        this.requests = _.filter(this.requests, function (v) {
            return v.cuser_id !== app.cuser.id;
        });
        //calculate distances
        for (var index in this.requests) {
            if (!this.requests.hasOwnProperty(index)) {
                continue;
            }
            this.requests[index].miles_away = lat_lng_distance(current_pos.latitude, current_pos.longitude, this.requests[index].pickup_lat, this.requests[index].pickup_lng);
        }
        //get names and phones
        var cusers = _.map(this.requests, function (value) {
            return value.cuser_id
        });
        var success = function (response) {
            self.cusers = response;//cusers: {"571317eeb6f15571317eeb6f1a":["Ross Edgar","301-592-1442"],"574f064374406574f06437440b":["Travis",""]}
        };
        if (_.isObject(cusers) && cusers.hasOwnProperty('length') && cusers.length > 0) {
            $.get(config.restUrl + 'cuser/query', {data: cusers}, success, 'json');
        }
        self = this;
        var infowindow_function = function () {
            infowindow.close();
            infowindow.setPosition(this.position);//copy marker position
            var contentString = '';

            //set current rider
            var cur_cuser_data = self.cusers[this.request.cuser_id];
            app.cur_rider.save({
                id: this.request.cuser_id,
                miles_away: this.request.miles_away,
                name: cur_cuser_data[0],
                phone: cur_cuser_data[1],
                request: this.request
            });
            self.render_children();
            var name_initial = name_initial_from_name(cur_cuser_data[0]);

            contentString += name_initial + '<br/>';
            contentString += (typeof this.request.pickup_full_address != "undefined" && this.request.pickup_full_address) ? 'Pick up at ' + this.request.pickup_full_address + '<br/>' : '';
            contentString += (typeof this.request.dropoff_full_address != "undefined" && this.request.dropoff_full_address) ? 'Drop off at ' + this.request.dropoff_full_address + '<br/>' : '';
            contentString += (typeof this.request.miles_away != "undefined" && this.request.miles_away) ? numeral(this.request.miles_away).format('0.0') + ' miles away' : '';
            contentString += '<br/><button class="showroute" type="button">SHOW ROUTE</button>';
            infowindow.setContent(contentString);
            infowindow.open(map, this);
            var cur_marker = this;
            $('.showroute').click(function (event) {
                infowindow.close();
                self.set_rider_itin(cur_marker.request);
                $('#offer_ride').slideDown();
            });

        };
        //show requests on the map. Make sure it's clickable
        app.utils.misc.delete_markers(app.request_markers);

        for (var i = 0; i < this.requests.length; i++) {
            var r = this.requests[i];
            var new_marker = new google.maps.Marker({
                position: {lat: parseFloat(r.pickup_lat), lng: parseFloat(r.pickup_lng)},
                map: map,
                icon: {url: 'img/rider_on_map_new.png'},
                zIndex: 900,
                request: r
            });

            google.maps.event.addListener(new_marker, 'click', infowindow_function);
            google.maps.event.addListener(map, 'click', function () {
                infowindow.close();
            });
            app.request_markers.push(new_marker);
        }
        //if it's list view show it differently
    },
    offer_ride_from_list: function (request) {
        trackButton('Offers a ride');
        app.cur_rider.save(request.attributes);
        app.cur_rider.set('id', request.get('cuser_id'));
        app.cur_rider.save({request: request.attributes});
        this.offer_ride();
    },
    offer_ride: function () {
        trackButton('Offers a ride');
        $('#waiting').slideDown();
        $('#cancel-wrapper').slideDown();
        this.$('#rider_info').html(this.rider_view.render());
        $('#offer_ride').slideUp();
        // $('#fade').show();
        $('#waiting span.accepted').hide();
        $('#waiting span.pending').slideDown();
        app.offer = new app.models.Offer();
        var self = this;
        //send an offer to server
        // console.log("Driver: offer sent to the server to pickup rider >>"); //mhemry debug
        // console.log("Driver: cuser_id = " + app.cuser_id);
        // console.log("Driver: request_cuser = " + app.cur_rider_id);
        // console.log("Driver: app.cur_rider.name = " + app.cur_rider.name);
        // console.log("Driver: app.cur_rider.get('name') = " + app.cur_rider.get('name'));
        app.offer.save({
            cuser_id: app.cuser.id,
            request_cuser: app.cur_rider.id,
            name: app.cur_rider.get('name'),
            status: 'pending'
        }, {
            dataType: 'text',
            success: function () {
                // console.log("Driver: success on app.offer.save for pending offer for rider >> " + app.cur_rider.get('name'));  //mhemry debug
                this.model = app.offer;

                // this.listenTo(this.model, 'remove', this.cancel_offer_ride);
                //pulling offers from API
                var poll_options = {
                    delay: 8000,
                    timeout: 7000
                };
                app.my_offer_poller = Backbone.Poller.get(app.offer, poll_options);
                app.my_offer_poller.on('success', ajax_timeout_reset);
                var view = self;
                app.my_offer_poller.on('error', function (model, event) {
                    if (event.status === 500 || event.statusText == 'timeout') {
                        ajax_timeout_my_offer();
                    } else {
                        //offer deleted
                        // console.log("Driver: app.my_offer_poller >> ERROR"); //mhemry debug
                        view.cancel_offer_ride('Rider');
                    }
                });

                app.my_offer_poller.on('success', function (model) {
                    // console.log("Driver: app.my_offer_poller >> SUCCESS"); //mhemry debug
                    if (model.get('status') == 'accepted') {
                        $('#map').addClass('bottom-half');
                        $('#view_switcher > a[data-view="map"]').click();//make sure map is always shown; esp. when current view is listview
                        $('#waiting').slideUp();
                        $('#offer_accepted').slideDown();
                        $('#cancel-wrapper').slideDown();
                        $('#rider_info_with_eta').html(view.rider_with_ETA_view.render());
                        if (view.status != 'accepted') {
                            view.set_status('driver_enroute');
                            cordova.plugins.notification.local.schedule({
                                id: _.random(1, 65535),
                                title: "Match approved",
                                text: "Your match request with " + app.cur_rider.get('name') + " has been approved!  Click here to return to the app and to get directions to the pickup location.",
                                data: model
                            });
                        }
                        var r = app.cur_rider.get('request');
                        var dir_request = {
                            origin: current_pos.latitude + ',' + current_pos.longitude,
                            destination: r.pickup_lat + ',' + r.pickup_lng,
                            travelMode: google.maps.TravelMode.DRIVING
                        };
                        map.direction.route(dir_request, function (result, status) {
                                if (status == google.maps.DirectionsStatus.OK) {
                                    map.directionsResult = result;
                                    if (_.isArray(map.directionsResult.routes)) {
                                        $('.eta').fadeOut('slow', function () {
                                            $(this).text(map.directionsResult.routes[0].legs[0].duration.text).fadeIn(500);
                                        });
                                    }
                                    map.directionsDisplay.setDirections(result);
                                    map.directionsDisplay.setOptions({
                                        markerOptions: {
                                            zIndex: 9999,
                                            // animation: google.maps.Animation.DROP
                                            animation: null
                                        }
                                    });
                                    var bounds = new google.maps.LatLngBounds();
                                    bounds.extend(new google.maps.LatLng(current_pos.latitude, current_pos.longitude));
                                    bounds.extend(new google.maps.LatLng(r.pickup_lat, r.pickup_lng));
                                    map.fitBounds(bounds);
                                }
                            }
                        );
                    }
                    if (model.get('status') == 'fulfilled') {
                        view.confirm_pickup();
                        view.confirm_dropoff();
                        app_toast('Ride completed. Thank you.');
                    }
                });

                if (!app.my_offer_poller.active()) {
                    app.my_offer_poller.start();
                }
                //start publishing lat lng address
                self.publish_location_interval_id = setInterval(function () {
                        publish_location(app.offer.get('cuser_id'), current_pos.latitude, current_pos.longitude, current_pos.formatted_address)
                    }
                    , 30000
                );
            },
            error: function () {
                console.error("Save failed");
            }
        });

        //go into waiting mode
        this.set_status('driver_offered');
        this.time_sent = (new Date());
        if (app.request_poller) {
            app.request_poller.stop();
        }
    },
    cancel_offer_ride: function (by_whom) {
        $('#map').removeClass('bottom-half');
        app.offer.destroy();
        if (this.status != 'driver_onride' && this.status != 'driver_offered') {
            app_toast(by_whom + ' cancelled this ride offer!');
        } else {
            app_toast('Ride completed. Thank you.')
        }
        if (_.isObject(app.my_offer_poller))
            app.my_offer_poller.stop();
        $('#waiting').slideUp();
        $('#offer_accepted').slideUp();
        $('#onride').slideUp();
        $('#cancel-wrapper').slideUp();
        if ($('#view_switcher>.active').data('view') == 'map') {
            $('#offer_ride').slideToggle();
        }
        $('#fade').hide();
        clearInterval(this.publish_location_interval_id);
    },
    confirm_pickup: function () {
        trackButton('Picks up rider');
        var r = app.cur_rider.get('request');
        var dir_request = {
            origin: r.pickup_lat + ',' + r.pickup_lng,
            destination: r.dropoff_lat + ',' + r.dropoff_lng,
            travelMode: google.maps.TravelMode.DRIVING
        };
        if (_.isObject(map.directionsDisplay)) {
            map.directionsDisplay.setMap(null);
        }
        map.direction.route(dir_request, function (result, status) {
            if (status == google.maps.DirectionsStatus.OK) {
                map.directionsResult = result;
                if (_.isArray(map.directionsResult.routes)) {
                    $('.eta').fadeOut('slow', function () {
                        $(this).text(map.directionsResult.routes[0].legs[0].duration.text).fadeIn(500);
                    });
                }
                map.directionsDisplay.setDirections(result);
                map.directionsDisplay.setOptions({
                    markerOptions: {
                        zIndex: 9999,
                        // animation: google.maps.Animation.DROP
                        animation: null
                    }
                });
                var bounds = new google.maps.LatLngBounds();
                bounds.extend(new google.maps.LatLng(r.pickup_lat, r.dropoff_lng));
                bounds.extend(new google.maps.LatLng(r.dropoff_lat, r.pickup_lng));
                map.fitBounds(bounds);
                map.directionsDisplay.setMap(map);
            }

        });
        app.my_offer_poller.stop();
        $('#offer_accepted').slideUp();
        $('#cancel-wrapper').slideUp();
        $('#onride').slideDown();
        $('.rider_name').text(app.cur_rider.name_initial());
        this.set_status('driver_onride');//todob future: update request status to onride too
    },
    confirm_dropoff: function () {
        trackButton('Drops off rider');
        $('#map').removeClass('bottom-half');
        this.set_status('driver_idle');
        $('#ridematch_success').slideDown();
        $('#onride').hide();
    },
    cancel_view_rider: function () {
        $('#offer_ride').slideUp();
        this.clear_rider_route();
    },
    launch_map_app: function () {
        var r = map.directionsResult.request;
        launchnavigator.navigate(r.destination, function () {
            console.log('bye bye');
        }, function () {
            app_alert("Can not launch Maps app. Please double check that your Maps app is working.");
        }, {
            start: r.origin
        });
    }

});
