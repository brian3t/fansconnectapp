app.views.LiveView = Backbone.View.extend({
        model: {},
        collection: {bands: {}},
        initialize: function () {
            this.collection.bands = app.collections.bands;
            this.listenTo(this.collection, 'update', this.render);
        },
        tagName: 'div',
        id: 'live_list',
        className: 'list-block',
        parentView: null,
        render: function () {
            if (typeof this.model === "object") {
                this.model.models = _.first(this.model.models, 18);
            }
            this.$el.html(this.template({models: this.model.models}));
            app.today = moment();
            app.first_this_month = moment().startOf('month');
            return this;
        },

        events: {
            "submit #loginForm ": "login",
            "toggle": "remember_cb"
        },
        dom_ready: function () {
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
