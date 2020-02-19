app.views.ChatListView = Backbone.View.extend({
        model: {},
        collections: {chats: {}},
        initialize: function () {
            this.model = app.collections.events.get(1)
            this.collections.chats = 'here init a collection of chats';
            this.listenTo(this.collections.bands, 'update', this.render);
        },
        tagName: 'div',
        id: 'live_list',
        className: 'list-block',
        parentView: null,
        render: function () {
            if (typeof this.model === "object") {
                this.model.models = _.first(this.model.models, 18);
            }
            this.$el.html(this.template({collections: this.collections}));
            app.today = moment();
            app.first_this_month = moment().startOf('month');
            return this;
        },

        events: {
            "submit #loginForm ": "login",
            "toggle": "remember_cb",
            "click div.list>ul>li>a": "go_to_band"
        },
        go_to_band: function (e) {
            e= $(e.target);
            app.router.navigate('band/' + e.closest('li').data('id'), {trigger: true});
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
