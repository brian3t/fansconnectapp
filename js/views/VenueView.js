app.views.VenueView = Backbone.View.extend({
        model_name: 'venue',
        model: {},
        collections: {events: {}, venues: {}},
        initialize: function (id) {
            this.model = app.collections.venues.get(id);
            if (this.model instanceof app.models.Venue) {
                this.listenTo(this.model, 'sync', this.render);
            } else {
                this.setModelId(id);
            }
        },
        setModelId: function (id) {
            this.model = app.collections.venues.get(id);
            if (!(this.model instanceof app.models.Venue)) {
                //find whether the referrer holds a copy of my model? E.g. event has venue. Event navigates to venue
                let prev_state = app.router.getPrevFragment().toString();
                let prev_view = prev_state.split('/')[0];
                prev_view = app[`${prev_view}View`];
                if (prev_view instanceof Backbone.View){
                    this.model = prev_view.model.get(this.model_name);
                }
                /*let model = new app.models.Venue();
                /!** @var app.models.Venue model **!/
                model.set('id', id);
                this.model = model;
                this.listenTo(this.model, 'change', this.render);
                model.fetch();*/
            }
        },
        tagName: 'div',
        id: 'venue_view',
        className: 'block',
        parentView: null,
        render: function () {
            if (this.model instanceof app.models.Venue) {
                this.$el.html(this.template(_.extend(this.model.attributes, {model: this.model})));
            }
            this.dom_ready();
            return this;
        },
        events: {},
        dom_ready: function () {
        }
    }
);
