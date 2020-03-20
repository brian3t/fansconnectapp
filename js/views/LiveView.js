app.views.LiveView = Backbone.View.extend({
        model: {},
        collections: {events: {}, bands: {}},
        initialize: function (){
            this.collections.events = app.collections.events;
            // this.collections.bands = app.collections.bands_w_events;
            this.listenTo(this.collections.events, 'update', this.render);
        },
        tagName: 'div',
        id: 'live_list',
        className: 'list-block',
        parentView: null,
        /*
        make sure all events has first band data before we start rendering
         */
        prepare_data: function (){
            this.collections.events.forEach((e) => {
                let first_band_event = e.get('band_events')
            })
            this.render()
        },
        render: function (){
            if (typeof this.model === "object") {
                this.model.models = _.first(this.model.models, 18);
            }
            this.$el.html(this.template({collections: this.collections}));
            app.today = moment();
            app.first_this_month = moment().startOf('month');
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
            }
        },
        go_to_event: function (e){
            e = $(e.target);
            app.router.navigate('event/' + e.closest('li').data('id'), {trigger: true});
        },
        go_to_band: function (e){
            e = $(e.target);
            app.router.navigate('band/' + e.closest('li').data('band_id'), {trigger: true});
        },
        dom_ready: function (){
            $(this.el).ready(function (){
                $('img').on('error', function (){
                    $(this).attr('src', '/img/band_noimg.png');
                });
                app.event_bus.off('infi_reached')
                app.event_bus.on('infi_reached', (event_obj) => {
                    setTimeout(()=>{console.log(`done timeout`)},3000)
                })
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
