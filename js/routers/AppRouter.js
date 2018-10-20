app.routers.AppRouter = Backbone.Router.extend({

    routes: {
        "": "home",
        "drugs/:id": "drugDetails",
        "band/:id": "band",
        "venue/:id": "venue",
        "bands": "bands",
        "event/:id": "event",
        "forgot": "forgot",
        "upcoming": "upcoming",
        "request_ride": "request_ride"
        // ,"formulary/:f_id/:drug_id/:state": "formularyDetails"
    },
    route: function(route, name, callback) {
        Backbone.history || (Backbone.history = new Backbone.History);
        if (!_.isRegExp(route)) route = this._routeToRegExp(route);
        if (!callback) callback = this[name];
        Backbone.history.route(route, _.bind(function(fragment) {
            var that = this;
            var args = this._extractParameters(route, fragment);
            if (_(this.before).isFunction()) {
                this.before.apply(this, args);
            }
            if (callback) callback.apply(that, args);
            if (_(this.after).isFunction()) {
                this.after.apply(this, args);
            }
        }, this));
    },
    initialize: function () {
        this.history = [];
        this.ignore = false;
        app.slider = new PageSlider($('div.page-content'));
        app.slider.slidePageSp = (function (_super) {
            return function ($newPage, origin, options) {
                var previous_view = $(this.$currentPage).attr('current_view');
                var result = _super.apply(this, arguments);
                // console.log("Assign class after sliding");
                let current_view = Backbone.history.getFragment().replace(/\/.*/g,'');
                if (current_view === ''){
                    current_view = 'home';
                }
                $newPage.attr('current_view', current_view).addClass('slider_page');
                if (!app.navbar_view) {
                    app.navbar_view = new app.views.NavbarView({current_view: current_view});
                } else {
                    app.navbar_view.set_current_view(current_view);
                }
                $('.page').removeClass('whirl no-overlay traditional');
                app.navbar_view.dom_ready();
                return result;
            };
        })(app.slider.slidePage);
        app.slider.slidePage = app.slider.slidePageSp;
    },
    set_class_page: function () {
        var current_view = Backbone.history.getFragment() === '' ? 'home' : Backbone.history.getFragment();
        $('div.page').attr('current_view', current_view);
    },

    home: function () {
        // Since the home view never changes, we instantiate it and render it only once
        // if (!app.homeView) {
        app.homeView = new app.views.HomeView();
        app.homeView.render();
        // } else {
        //     console.log('reusing home view');
        //     app.homeView.delegateEvents(); // delegate events when the view is recycled
        // }
        $('div.page').addClass('page-with-subnavbar');
        app.slider.slidePage(app.homeView.$el);
        app.homeView.dom_ready();
    },

    bands: function () {
        if (!app.bandListView) {
        app.bandListView = new app.views.BandListView();
        app.bandListView .render();
        } else {
            console.log('reusing bandListView view');
            app.bandListView.delegateEvents(); // delegate events when the view is recycled
        }
        $('div.page').addClass('page-with-subnavbar');
        app.slider.slidePage(app.bandListView .$el);
        app.bandListView .dom_ready();
    },

    upcoming: function () {
        app.upcoming_view = new app.views.UpcomingView();
        app.upcoming_view.on(app.cur_user, "sync change", app.upcoming_view.render);
        app.upcoming_view.render();
        if (_.isObject(app.offer_collection)) {
            app.offer_collection.reset();
        }
        app.slider.slidePage(app.upcoming_view.$el);
        $('#current_page_title').val('Upcoming events');
        app.upcoming_view.dom_ready();
    },

    rider_wait_pickup: function () {
        app.RiderWaitPickupView = new app.views.RiderWaitPickupView();
        app.RiderWaitPickupView.render();
        app.slider.slidePage(app.RiderWaitPickupView.$el);
        app.RiderWaitPickupView.dom_ready();
    },

    view_riders: function () {
        trackButton('Select driver button');
        app.View_riders_view = new app.views.View_riders_view();
        app.View_riders_view.render();
        app.slider.slidePage(app.View_riders_view.$el);
        app.View_riders_view.dom_ready();
    },

    band: function (id) {
        if (!app.bandView) {
            app.bandView = new app.views.BandView(id);
            app.bandView.render();
        } else {
            console.log('reusing band view');
            app.bandView.setModelId(id);
            app.bandView.render();
            app.bandView.delegateEvents(); // delegate events when the view is recycled
        }
        app.slider.slidePage(app.bandView.$el);
    },

    venue: function (id) {
        if (!app.venueView) {
            app.venueView = new app.views.VenueView(id);
            app.venueView.render();
        } else {
            console.log('reusing venue view');
            app.venueView.setModelId(id);
            app.venueView.render();
            app.venueView.delegateEvents(); // delegate events when the view is recycled
        }
        app.slider.slidePage(app.venueView.$el);
    },

    event: function (id) {
        if (!app.eventView) {
            app.eventView = new app.views.EventView(id);
            app.eventView.render();
        } else {
            console.log('reusing event view');
            app.eventView.setModelId(id);
            app.eventView.render();
            app.eventView.delegateEvents(); // delegate events when the view is recycled
        }
        app.slider.slidePage(app.eventView.$el);
    },

    forgot: function () {
        if (!app.forgotView) {
            app.forgotView = new app.views.ForgotView();
            app.forgotView.render();
        } else {
            console.log('reusing forgot view');
            app.forgotView.delegateEvents(); // delegate events when the view is recycled
        }
        app.slider.slidePage(app.forgotView.$el);
    },

    signup: function () {
        if (!app.signupView) {
            app.signupView = new app.views.SignupView();
            app.signupView.render();
        } else {
            console.log('reusing signupView');
            app.signupView.delegateEvents(); // delegate events when the view is recycled
        }
        app.signupView.resetFields();
        app.slider.slidePage(app.signupView.$el);
    },
    /**
     * Thanks to route overriding above
     */
    after: function(){
        this.storeRoute();
    },
    /**
     * Store route into this.history
     * Last element is current fragment
     */
    storeRoute: function(){
        if (!app.router.ignore) {
            var re = /[a-zA-Z]+\/[\d|new]/; // matches, eg. "quotes/5" or "quotes/new"
            if (!this.history.length) {
                var parts = Backbone.history.fragment.split('/'),
                    len = parts.length,
                    i = 0;

                while (i < len) {
                    this.history.push(parts.slice(0, i + 1).join('/'));
                    i++;
                }
            } else {
                this.history.push(Backbone.history.fragment);
            }
        } else {
            app.router.ignore = false;
        }
    },
    getPrevFragment:function () {
        let index_prev_frag = this.history.length - 1;
        if (index_prev_frag in this.history){
            return this.history[index_prev_frag];
        } else {
            return false;
        }
    }
});
