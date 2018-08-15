app.views.BandView = Backbone.View.extend({
        model: {},
        collections: {events: {}, bands: {}},
        initialize: function (id) {
            // this.collections.events = app.collections.events;
            this.model = app.collections.bands_w_events.get(id);
            if (this.model instanceof app.models.Band) {
                this.listenTo(this.model, 'change', this.render);
            } else {
                this.setModelId(id);
            }
        },
        setModelId: function (id) {
            this.model = app.collections.bands_w_events.get(id);
            if (!(this.model instanceof app.models.Band)){
                let model = new app.models.Band();
                /** @var app.models.Band model **/
                model.set('id', id);
                this.model=model;
                this.listenTo(this.model, 'change', this.render);
                model.fetch();
            }
        },
        tagName: 'div',
        id: 'band_view',
        className: 'block',
        parentView: null,
        render: function () {
            if (this.model instanceof app.models.Band) {
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
