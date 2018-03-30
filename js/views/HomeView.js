app.views.HomeView = Backbone.View.extend({
        tagName: 'div',
        initialize: function () {
            this.render();
        },
        username: '',
        password: '',
        $username: null,
        $password: null,
        hashedPassword: '',
        hashed: true,
        remember: true,
        leaderboard_list_view: {},
        render: function () {
            this.$el.html(this.template());
            this.$username = this.$el.find('input#username');
            this.$password = this.$el.find('input#password');
            this.remember = localStorage.getItem('remember');
            if (_.isNull(this.remember)) {
                this.remember = true;
            }
            this.save_load_credential();
            return this;
        },

        events: {
            "toggle": "remember_cb"
        },
        remember_cb: function (e) {
            this.remember = $(e.target).hasClass('active');
            this.remember = Boolean(this.remember);
            localStorage.setItem('remember', this.remember);
            this.save_load_credential();
        },
        save_load_credential: function () {
            this.remember = Boolean(this.remember);
            if (this.remember !== true) {
                window.localStorage.setItem("password", "");
                window.localStorage.setItem("username", "");
                this.$username.val('');
                this.$password.val('');
                this.hashed = false;
            } else {
                if (!_.isEmpty(window.localStorage.getItem('username'))) {
                    this.$username.val(window.localStorage.getItem('username'));
                }
                if (!_.isEmpty(window.localStorage.getItem('password'))) {
                    this.$password.val(window.localStorage.getItem('password'));
                }

            }
        },
        dom_ready: function () {
            var remember = localStorage.getItem('remember');
            if (remember) {
                $('#remember').addClass('active');
            } else {
                $('#remember').removeClass('active');
            }
            this.leaderboard_list_view = new app.views.LeaderboardListView({model: app.models.leaderboard_collection, parent_view: self});
            app.today = moment();
            app.first_this_month = moment().startOf('month');
            var period = app.first_this_month.format('MMM-DD') + ' to ' + app.today.format('MMM-DD');

            this.$el.find('div#leaderboard_wrapper').html('<div class="text-center content-block-title" id="leaderboard_period">' + period + '</div>').append(this.leaderboard_list_view.render().el);

            if (IS_LOCAL){
                // fapp.loginScreen();
            }
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

if (IS_DEBUG) {
    window.localStorage.removeItem('cuser');
}