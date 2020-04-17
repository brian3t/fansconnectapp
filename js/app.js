var IS_DEBUG = false;
// const IS_DEBUG = true;
var GMAP_KEY = 'AIzaSyC1RpnsU0y0yPoQSg1G_GyvmBmO5i1UH5E';
// const CLEAR_LOCAL_STORAGE = true;
var CLEAR_LOCAL_STORAGE = false;
var LOCAL_NOTE_IDLE_ID = 8;
var LOCAL_NOTE_IDLE_DELAY = 10 * 1000 * 60; // 10 minutes
var fapp = null;
var isInWeb = false;
var cordova = null, PushNotification = null;
var app = {};
var current_pos = {};
var capp = null;

(function (){
    "use strict";
    app = {
        views: {}, models: {}, routers: {}, utils: {}, adapters: {}, collections: {},
        today: moment(),
        first_this_month: {},
        timeout_count: 0,//for ajax timeout ()
        heartbeat: {interval: -1},
        domwatch: {interval: -1},//another loop to watch for DOM changes
        event_bus: _({}).extend(Backbone.Events),
        initialize: function (fapp){
            this.event_bus.trigger_b3t = function (name){
                this.trigger(name);
            };
            $('.sign_up_anchor').prop('href', 'test');
            if (ls('favs') === null) {
                ls('favs', {});
            }
            fapp.allow_infinite=true
            fapp.infiniteScroll.create($$('.infi_content'))
        },
        heartbeat_function: function (){
            navigator.geolocation.getCurrentPosition(capp.geolocation.onSuccess, capp.geolocation.onError);
            //todob Check geolocation before using. If failed, ask for permission
        },
        start_heartbeat: function (){
            this.heartbeat_function();
            app.heartbeat.interval = setInterval(this.heartbeat_function, 15000);//60 seconds
        },
        stop_heartbeat: function (){
            clearInterval(app.heartbeat.interval);
            app.heartbeat.interval = -1;
        },
        domwatch_function: function (){
            if ($('div.subnavbar').length === 1 && ! $('div.subnavbar').is(":hidden")) {
                app.event_bus.trigger_b3t('searchbar_dom_ready');
                app.stop_domwatch();
            }
        },
        start_domwatch: function (){
            this.domwatch_function();
            app.domwatch.interval = setInterval(this.domwatch_function, 500);
        },
        stop_domwatch: function (){
            console.log('stopped domwatch');
            clearInterval(app.domwatch.interval);
            app.domwatch.interval = -1;
        },
        reset_user: function (){
            $.post(CONFIG.restUrl + 'cuser/reset', {id: app.cuser.get('id')});
            app.stop_heartbeat();
            if (_.isObject(app.my_offer_poller)) {
                app.my_offer_poller.stop();
            }
            if (_.isObject(app.driver_poller)) {
                app.driver_poller.stop();
            }
            app.cuser = new app.models.Cuser();
        },
        prepare_collections: function (success_cb, error){
            app.collections.events = new app.collections.Events();
            app.collections.events.url += '?source[]=sdr&source[]=tickmas&expand=first_band'
            app.collections.bands = new app.collections.Bands();
            app.collections.bands_w_events = new app.collections.Bands();
            app.collections.bands_w_events.url += '/hasevent' //?expand=events';
            app.collections.bands_w_events.fetch({success: success_cb});
            app.collections.venues = new app.collections.Venues();
            app.collections.venues.fetch();

        },
        gMaps: {
            api_key: 'AIzaSyC1RpnsU0y0yPoQSg1G_GyvmBmO5i1UH5E',
            url: 'https://maps.googleapis.com/maps/api/geocode/json?key=' + GMAP_KEY,
            directions_url: 'https://maps.googleapis.com/maps/api/directions/json?key=' + GMAP_KEY
        }
    };

    /*if (typeof IS_LOCAL !== "undefined" && IS_LOCAL) {
        // CONFIG.restUrl = 'https://api.capoapi/v1/';
    }*/

    $.jGrowl.defaults.closeTemplate = '';
    $.jGrowl.defaults.position = 'center';

    /**
     * Cordova app
     * @type {{initialize: capp.initialize, bindEvents: capp.bindEvents, geolocation: {onSuccess: capp.geolocation.onSuccess, onError: capp.geolocation.onError}, onDeviceReady: capp.onDeviceReady, position: {stateCode: string}, receivedEvent: capp.receivedEvent, gMaps: {api_key: string, url: string, directions_url: string}, onGeolocationSuccess: capp.onGeolocationSuccess, onGeoLocationError: capp.onError}}
     */
    capp = {
        initialize: function (){
            if (isInWeb) {
                cordova = {
                    plugins: {
                        notification: {
                            local: {
                                schedule: function (){
                                },
                                registerPermission: function (){
                                },
                                on: function (){
                                },
                                cancel: function (){
                                }
                            }
                        }
                    }
                };
                PushNotification = {
                    init: function (){
                        return {
                            on: function (){

                            }
                        };
                    }
                };
            }
            this.bindEvents();

            app.idle_time = 0;
            app.idle_timer = new Timer(function (){
                    if (Backbone.history.getFragment() !== 'request_ride' && Backbone.history.getFragment() !== 'view_riders') {
                        app.idle_timer.resume();
                        return;
                    }
                    app.idle_time += 1;
                    // console.info('App has been running for ' + app.idle_time + 'seconds');
                    if (app.idle_time > 0 && (app.idle_time % 300 === 0)) {
                        app_confirm("Are you still looking for a ride?", function (response){
                            if (! (response === true || response === 1)) {
                                app.router.navigate('dashboard', {trigger: true, replace: true});
                            } else {
                                if (_.isObject(app.request) && ! _.isEmpty(app.request.get('status'))) {
                                    //keep request alive
                                    if (IS_LOCAL) {
                                        app.request.save({trigger_col: moment().format('Y-MM-DD HH:mm:ss')}, {patch: true});
                                    } else {
                                        app.request.save({trigger_col: moment().format('DD-MMM-YY hh.mm.ss A')}, {patch: true});
                                    }
                                }
                            }
                            app.is_notification_active = false;
                        });
                        schedule_idle_local_note();
                        // cordova.plugins.notification.local.cancel(LOCAL_NOTE_IDLE_ID);

                        app.idle_time = 0;
                        app.idle_timer.restart();
                    }
                    app.idle_timer.resume();
                }, 5000 //every 5 seconds
            );
            if (IS_DEBUG && CLEAR_LOCAL_STORAGE) {
                localStorage.clear();
            }

            if (_.isNull(localStorage.getItem('remember'))) {
                localStorage.setItem('remember', 'true');
            }
            app.start_heartbeat();
            app.start_domwatch();
            setTimeout(app.stop_domwatch, 10000);

        },
        bindEvents: function (){
            document.addEventListener('deviceready', this.onDeviceReady, false);
        },
        geolocation: {
// onSuccess Callback
// This method accepts a Position object, which contains the
// current GPS coordinates
//
            onSuccess: function (position){
                let extra_param = {};
                console.log('Latitude: ' + position.coords.latitude);
                current_pos = position.coords;
                var apns_device_reg_id = localStorage.getItem('registrationId');
                if (! _.isNull(apns_device_reg_id)) {
                    extra_param.apns_device_reg_id = apns_device_reg_id;
                }
                //save it to cur pos. Save lat lng to cur_user and publish to API
                if (_.isObject(app.cuser)) {
                    app.cuser.save($.extend({lat: current_pos.latitude, lng: current_pos.longitude, status: app.status}, {
                        patch: true,
                        forceRefresh: true
                    }, extra_param));
                }
                if (_.isObject(app.request_poller)) {
                    app.request_poller.options.data.cur_lat = current_pos.latitude;
                    app.request_poller.options.data.cur_lng = current_pos.longitude;
                }
                if (_.isObject(app.driver_poller)) {
                    app.driver_poller.options.data.cur_lat = current_pos.latitude;
                    app.driver_poller.options.data.cur_lng = current_pos.longitude;
                }
                $('.geolocate.distance').each((i, e) => {
                    e = $(e);
                    $(e).html(lat_lng_distance(current_pos.latitude, current_pos.longitude, e.data('lat'), e.data('lng')));
                });
            },
// onError Callback receives a PositionError object
//
            onError: function (error){
                alert('code: ' + error.code + '\n' +
                    'message: ' + error.message + '\n');
            }
        },
        onDeviceReady: function (){
            backboneInit();
            window.addEventListener('orientationchange', doOnOrientationChange);
            // Initial execution if needed
            doOnOrientationChange();
            // cordova.plugins.notification.local.on('click', function (notification) {
            //     console.info(notification);
            // });
            setupPush();
            document.addEventListener("pause", function (){
                app.state = 'background';
                schedule_idle_local_note();
            }, false);
            document.addEventListener("resume", function (){
                app.state = 'foreground';
                //cordova.plugins.notification.local.clear(LOCAL_NOTE_IDLE_ID);
            }, false);
            /*        cordova.plugins.notification.local.registerPermission(function (granted) {
                        console.log("Local notification is " + granted);
                    });
                    schedule_idle_local_note();*/

            // START idle notification monitoring functions
            // ===================================================
            // double check status BEFORE notifying
            /*cordova.plugins.notification.local.on("trigger", function (notification) {
                if (notification.id == LOCAL_NOTE_IDLE_ID && _.isObject(app.Request_ride_view) && app.Request_ride_view.status == 'request_sent') {
                    console.log("schedule_idle_local_note trigger -- pass!");
                    return;
                } else {
                    console.log("schedule_idle_local_note trigger -- fail!");
                    cordova.plugins.notification.local.cancel(LOCAL_NOTE_IDLE_ID);
                    return false;
                }
            });
            // schedule the next alert if the user responds to the notification
            cordova.plugins.notification.local.on("click", function (notification) {
                var now = new Date().getTime(),
                    scheduled_time_for_notification = new Date(now + LOCAL_NOTE_IDLE_DELAY);

                if (notification.id == LOCAL_NOTE_IDLE_ID) {
                    cordova.plugins.notification.local.schedule({
                        id: LOCAL_NOTE_IDLE_ID,
                        title: "CarpoolNow App has been idle",
                        text: "Are you still looking for a ride?",
                        at: scheduled_time_for_notification
                    });
                    console.log("schedule_idle_local_note trigger -- RESTARTED");
                }
            });*/
            // ===================================================
            // END idle notification monitoring functions

            capp.receivedEvent('deviceready');
        },
        position: {
            stateCode: ""
        },
        receivedEvent: function (id){
            // console.log('Received Event: ' + id);
            // StatusBar.hide();
            // $('body').height($('body').height() + 20);
        },
    };

    function backboneInit(){
        app.utils.templates.load(["NavbarView", "LiveViewEvents", "LiveView", "HomeView", "UpcomingView", 'VenueView', 'BandView', 'BandListView', 'EventView', 'ChatListView'], function (){
            app.router = new app.routers.AppRouter();
            Backbone.history.stop();
            // app.collections.events.on('update', ()=>{; app.router.navigate('/');app.router.home()})
            app.prepare_collections(() => {
                console.log(`done loading`);
                if (! Backbone.History.started) {
                    Backbone.history.start({pushState: true});
                    if (! isInWeb) {app.router.navigate('/');app.router.home();}
                }
            })

            // app.navbar_view = new app.views.NavbarView({model: app.cur_user});
        });
        window.$$ = Dom7;
        if (!(fapp instanceof Framework7)) {
            fapp = new Framework7({
                root: '#app',
                on: {
                    init: function (){
                        app.initialize(this)
                    }
                }
            })
        }
        //misc settings
        $.ajaxSetup({cache: true});
        $(document).ajaxStart(function (){
            $('.page').addClass('whirl no-overlay traditional');
            // $('div.content').css({opacity: 0.3})
        });
        $(document).ajaxStop(function (){
            $('.page').removeClass('whirl no-overlay traditional');
            // $('div.content').css({opacity: 1})
        });
        isInWeb = (typeof isInWeb !== "boolean" ? "true" : isInWeb);
        app.cur_user = new app.models.User();
        $('#loading').hide();
    }

    if (document.URL.indexOf('http://') === -1 && document.URL.indexOf('https://') === -1) {
        isInWeb = false;
        document.addEventListener("deviceready",()=>{capp.initialize(); capp.onDeviceReady(); })
    } else {
        isInWeb = true;
        $(document).ready(function (){
            var event; // Fire deviceready to simulate Cordova

            if (document.createEvent) {
                event = document.createEvent("HTMLEvents");
                event.initEvent("deviceready", true, true);
            } else {
                event = document.createEventObject();
                event.eventType = "deviceready";
            }

            event.eventName = "deviceready";

            if (document.createEvent) {
                document.dispatchEvent(event);
            } else {
                document.fireEvent("on" + event.eventType, event);
            }
        });
        capp.initialize();//initialize cordova app in web
    }


    Backbone.LocalStorage.setPrefix('lno');

    function app_alert(message, alertCallback, title, buttonName){
        if (buttonName === null) {
            buttonName = "OK";
        }
        if (isInWeb) {
            alert(message);
            if (_.isFunction(alertCallback)) {
                alertCallback();
            }
        } else {
            navigator.notification.alert(message, alertCallback, title, buttonName);
        }
    }

    function app_confirm(message, callback, title){
        var response = null;
        if (isInWeb) {
            response = confirm(message);
            callback(response);
        } else {
            if (app.is_notification_active) {
                return true;
            }
            app.is_notification_active = true;
            if (navigator.notification && navigator.notification.confirm) {
                navigator.notification.confirm(message, callback, title, ["Yes", "No"]);
            } else {
                response = confirm(message);
                callback(response);
            }
        }
    }

    function app_toast(message){
        if (isInWeb) {
            $.jGrowl(message);
        } else {
            window.plugins.toast.showLongCenter(message);
        }
    }

    function doOnOrientationChange(){
        switch (window.orientation) {
            case -90:
            case 90:
                console.log('landscape');
                $('body').addClass('landscape');
                break;
            default:
                //console.log(window.orientation);
                // console.log('portrait');
                $('body').removeClass('landscape');
                break;
        }
    }

    /*
     Publish current lat lng and address to server
     */
    function publish_location(cuser_id, lat, lng, address_realtime){
        $.ajax(CONFIG.restUrl + 'cuser/' + cuser_id, {
            data: {
                lat: lat,
                lng: lng,
                address_realtime: address_realtime
            },
            method: 'PATCH',
            success: function (){
                console.info('Current location published');
            }
        });
    }

    function testlocal(){
        let now = new Date().getTime(),
            _5_sec_from_now = new Date(now + 5 * 1000);
        let sound = 'file://beep.caf';
        if (typeof device === 'object' && device.platform === 'Android') {
            sound = 'file://sound.mp3';
        }

        cordova.plugins.notification.local.schedule({
            id: 1,
            title: 'Scheduled with delay',
            text: 'Test Message 1',
            at: _5_sec_from_now,
            sound: sound,
            badge: 12
        });

    }

    function schedule_idle_local_note(){
        console.log("schedule_idle_local_note");
        // cordova.plugins.notification.local.cancel(LOCAL_NOTE_IDLE_ID);
        var now = new Date().getTime(),
            scheduled_time_for_notification = new Date(now + LOCAL_NOTE_IDLE_DELAY);

        if (_.isObject(app.Request_ride_view) && app.Request_ride_view.status === 'request_sent') {
            // start

            // create notification
            cordova.plugins.notification.local.schedule({
                id: LOCAL_NOTE_IDLE_ID,
                title: "CarpoolNow App has been idle",
                text: "Are you still looking for a ride?",
                at: scheduled_time_for_notification
            });
            console.log("schedule_idle_local_note STARTED");

            // end
        }
    }

    function setupPush(){
        app.push = PushNotification.init({
            "android": {
                "senderID": "617066438569" // Project ID: wide-ceiling-143919
            },
            "ios": {
                "sound": true,
                "vibration": true,
                "badge": true,
                "clearBadge": true
            },
            "windows": {}
        });

        app.push.on('registration', function (data){
            console.log("registration event: " + data.registrationId);
            var oldRegId = localStorage.getItem('registrationId');
            if (oldRegId !== data.registrationId) {
                // Save new registration ID
                localStorage.setItem('registrationId', data.registrationId);
                // Post registrationId to your app server as the value has changed
            }
        });

        /*app.push.on('error', function (e) {
            var message = '';
            if (_.isObject(e)){
                message = e.message;
            }
            console.log("push error = " + message);
            // console.log("push error is for device with registrationId: " + localStorage.getItem('registrationId')); //mhemry debug
        });

        app.push.on('notification', function (data) {
            console.log('notification event');
            console.info(data);
            /!*example: data.additionalData = {foreground: true,
             offer: {request_cuser: "571317eeb6f15571317eeb6f1a", updated_at: {expression: "NOW()", params: []}, cuser_id: "576d51aab2584576d51aab25bd"},
             coldstart: false}
             *!/
            var title = data.title || 'Match found';
            app_alert(
                data.message,         // message
                null,                 // callback
                title,           // title
                'Ok'                  // buttonName
            );
        });*/
    }
}());
