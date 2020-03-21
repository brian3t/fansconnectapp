app.views.LiveViewEvents = Backbone.View.extend({
        model: {},
        collections: {events: {}, bands: {}},
        initialize: function (){
            // this.render() //a child view is never able to render itself
        },
        tagName: 'div',
        id: 'live_list',
        className: 'list-block',
        parentView: null,
        liveViewEvents: {},
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
            if (!this.collections || typeof this.collections !== 'object') {console.error(`col not valid`); return}
            this.$el.html(this.template({events:this.collections.events}))
            this.dom_ready();
            return this;
        },

        events: {
            "submit #loginForm ": "login",
            "click div.list>ul>li>a": "go_to_event",
            "click div.list>ul>li>a div.band": function (e){
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
