app.views.BandView = Backbone.View.extend({
        model: {},
        collections: {events: {}, bands: {}},
        initialize: function (id) {
            // this.collections.events = app.collections.events;
            this.model = app.collections.bands_w_events.get(id);
            if (this.model instanceof app.models.Band) {
                this.listenTo(this.model, 'sync', this.render);
            } else {
                this.setModelId(id);
            }
        },
        setModelId: function (id) {
            this.model = app.collections.bands_w_events.get(id);
            if (!(this.model instanceof app.models.Band)) {
                /** @var app.models.Band model **/
                let model = app.models.Band.findOrCreate({'id':id})
                this.model = model;
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

        events: {
            "click #toggle_fav": "toggle_fav"
        },
        dom_ready: function () {
            this.rebind_fav();
        },
        /**
         * Adds current band to local list of favorites
         */
        toggle_fav: function () {
            // console.log(`okay we're favoring this`);
            let favs = ls.get('favs') || {};
            let band_id = this.model.get('id');
            let faved = favs.hasOwnProperty(band_id);
            if (!faved) {
                favs[band_id] = moment().format('Y-m-d h:i:s');
            } else {
                delete favs[band_id];
            }
            ls.set('favs', favs);
            console.log(ls.get('favs'));
            this.rebind_fav();
        },
        /**
         * rebind text Add to Favorite - Added to Favorite
         */
        rebind_fav: function () {
            let favs = ls.get('favs') || {};
            if (!this.model) return false
            let band_id = this.model.get('id');
            if (favs.hasOwnProperty(band_id)){
                this.$el.find('#toggle_fav').text('Added to Favorites');
            } else {
                this.$el.find('#toggle_fav').text('Add to Favorites');
            }
        }
    }
);
