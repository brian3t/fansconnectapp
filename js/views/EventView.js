app.views.EventView = Backbone.View.extend({
        model: {},
        collections: {bands: {}, events: {}},
        initialize: function (id) {
            // this.collections.events = app.collections.events;
            this.model = app.collections.events.get(id);
            if (this.model instanceof app.models.Event) {
                this.listenTo(this.model, 'sync', this.render);
                this.model.fetch()
            } else {
                this.setModelId(id);
            }
            this.model.fetch_via('band','band_events')
        },
        setModelId: function (id) {
            this.model = app.collections.events.get(id);
            if (!(this.model instanceof app.models.Event)) {
                let model = new app.models.Event();
                /** @var app.models.Event model **/
                model.set('id', id);
                this.model = model;
                this.listenTo(this.model, 'change', this.render);
                model.fetch();
                mode.fetch_via('band','band_events')
            }
        },
        tagName: 'div',
        id: 'event_view',
        className: 'block',
        parentView: null,
        render: function () {
            if (this.model instanceof app.models.Event) {
                this.$el.html(this.template(_.extend(this.model.attributes, {model: this.model})));
            }
            this.dom_ready();
            return this;
        },

        events: {
            "click .venue_href": "go_to_venue"
        },
        go_to_venue: function (e) {
            e = $(e.target);
            let venue_id = e.closest('a').data('id');
            app.router.navigate('venue/' + venue_id, {trigger: true, model: this.model.get('venue')});
        },

        dom_ready: function () {
        }
    }
);
