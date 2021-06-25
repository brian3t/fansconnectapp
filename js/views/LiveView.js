app.views.LiveView = Backbone.View.extend({
        model: {},
        collections: {events: {}, bands: {}},
        initialize: function (){
            this.collections.events = app.collections.events;
                // this.collections.bands = app.collections.bands_w_events;
        },
        tagName: 'div',
        id: 'leaderboard_period',
        className: 'list-block',
        parentView: null,
        childView: null,
        childViewEl: '#liveviewevents_wrapper',
        liveViewEvents: {},
        /*
        make sure all events has first band data before we start rendering
         */
        prepare_data:function(){
            this.collections.events.forEach((e) => {
                let first_band_event = e.get('band_events')
            })
            this.render()
        },
        render: function(){
            if (typeof this.model === "object") {
                this.model.models = _.first(this.model.models, 18);
            }
            this.$el.html(this.template({collections: this.collections}))
            app.today = moment();
            app.first_this_month = moment().startOf('month');

            // this.childView.delegateEvents()
            this.dom_ready();
            return this;
        },

        events: {
            "submit #loginForm ": "login",
            "toggle": "remember_cb",
            "click div.list>ul>li>a": "go_to_event",
            "click div.list>ul>li>a div.band": function (e){
                e.stopImmediatePropagation();
                e.stopPropagation();
                this.go_to_band(e)
            },
        },
        go_to_event: function (e){
            e = $(e.target);
            app.router.navigate('event/' + e.closest('li').data('id'), {trigger: true});
        },
        go_to_band: function (e){
            e = $(e.target);
            let band_id = e.closest('li').data('band_id')
            if (band_id) return app.router.navigate('band/' + band_id, {trigger: true})
            let event_id = e.closest('li').data('event_id')
            if (event_id) return app.router.navigate('event/' + event_id, {trigger: true})
        },
        dom_ready: function (){
            let that = this
            $(()=>{
                that.childView = new app.views.LiveViewEvents({el: that.childViewEl, collections: that.collections}) //at first load, give childView full initial collection
                that.childView.parentView = that
                that.childView.post_initialize()
                that.childView.collections=that.collections

                fapp.preloader.init('.infinite-scroll-preloader')
                $('img').on('error', function (){
                    $(this).attr('src', '/img/band_noimg.png');
                });
            });
        }
    },
    {
        username: '',
        password: '',
        $username: '',
        $password: '',
        hashedPassword: '',
        hashed: true,
        remember: true
    }
);
