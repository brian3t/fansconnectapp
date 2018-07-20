app.views.BandView = Backbone.View.extend({
        model: {},
        collections: {events: {}, bands: {}},
        initialize: function () {
            // this.collections.events = app.collections.events;
            this.model = app.collections.bands_w_events.at(0);
            this.listenTo(this.model, 'update', this.render);
        },
        tagName: 'div',
        id: 'band_view',
        className: 'block',
        parentView: null,
        render: function () {
            this.$el.html(this.template(this.model.attributes));
            return this;
        },

        events: {},
        dom_ready: function () {
        }
    }
);
