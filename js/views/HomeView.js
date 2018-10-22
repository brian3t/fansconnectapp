app.views.HomeView = UsvView.extend({
        tagName: 'div',
        initialize: function () {
        },
        username: '',
        password: '',
        searchbar: {},
        $username: null,
        $password: null,
        hashedPassword: '',
        hashed: true,
        remember: true,
        live_list_view: {},
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
            this.live_list_view = new app.views.LiveView({model: app.models.leaderboard_collection, parent_view: self});
            app.today = moment();
            app.last_week = moment().subtract(7,'days');
            app.three_weeks_later = moment().add(3, 'weeks');
            let period = app.today.format('MMM-DD') + ' to ' + app.three_weeks_later.format('MMM-DD');

            this.$el.find('div#homeview_wrapper').html('<div class="text-center content-block-title" id="leaderboard_period">' + period + '</div>').append(this.live_list_view.render().el);

            if (IS_LOCAL) {
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
