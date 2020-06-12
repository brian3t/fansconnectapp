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
        filters: {}, // store filter DOM inputs
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
            "toggle": "remember_cb",
            "change #filters_start_date": "filters_date_updated",
            "change #filters_end_date": "filters_date_updated",
            "change #mile_range_slider": "filters_range_updated",
            "click .date_block.db_filters_start_date": function (){if (this.filters.filters_start_date) {
                this.filters.filters_start_date.open()
            }},
            "touchend .date_block.db_filters_start_date": function (){if (this.filters.filters_start_date) {
                this.filters.filters_start_date.open()
            }},
            "touch .date_block.db_filters_start_date": function (){if (this.filters.filters_start_date) {
                this.filters.filters_start_date.open()
            }},
            "click .date_block.db_filters_end_date": function (){if (this.filters.filters_end_date) {
                this.filters.filters_end_date.open()
            }},
            "touch .date_block.db_filters_end_date": function (){if (this.filters.filters_end_date) {
                this.filters.filters_end_date.open()
            }},
            "touchend .date_block.db_filters_end_date": function (){if (this.filters.filters_end_date) {
                this.filters.filters_end_date.open()
            }}
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
            if (!(this.live_list_view instanceof app.views.LiveView))
            {
                this.live_list_view = new app.views.LiveView({parent_view: self});
            }
            app.today = moment();
            app.last_week = moment().subtract(7,'days');
            app.three_weeks_later = moment().add(3, 'weeks');
            let period = app.today.format('MMM-DD') + ' to ' + app.three_weeks_later.format('MMM-DD');

            this.$el.find('div#homeview_wrapper').append(this.live_list_view.render().el);
            this.live_list_view.delegateEvents()
            if (IS_LOCAL) {
                // fapp.loginScreen();
            }
            $('#filters').show() //must show so that Framework 7 can calculate width
            this.filters.mile_range_slider = fapp.range.create({el:'#mile_range_slider'})
            this.filters.filters_start_date = fapp.calendar.create({ //convention: name of variable = id of element
                inputEl: '#filters_start_date', closeOnSelect: true,
                value: [app.today.format('Y-MM-DD')] //framework7 needs an array
            })
            this.$el.find('#filters_start_date').trigger('change')

            this.filters.filters_end_date = fapp.calendar.create({ //convention: name of variable = id of element
                inputEl: '#filters_end_date', closeOnSelect: true,
                value: [app.three_weeks_later.format('Y-MM-DD')] //framework7 needs an array
            })
            this.$el.find('#filters_end_date').trigger('change')
            $('#filters').hide()
        },
        filters_date_updated: function (el){
            // console.info(`filters date updated`, el)
            if (! el.currentTarget.id) return
            let elid = el.currentTarget.id
            if (! this.filters[elid]) return
            let selected_date = this.filters[elid].getValue() //date value
            selected_date = moment(new Date(selected_date))
            if (! selected_date._isValid) return
            let date_block = $(el.currentTarget.closest('.date_block')) //element's parent date_block
            if (date_block.length !== 1) return
            date_block.find('.db_daynum').html(selected_date.date())
            date_block.find('.db_day_of_week').html(selected_date.format('ddd'))
            date_block.find('.db_month').html(selected_date.format('MMM'))
        },
        filters_range_updated: function (el){
            if (! el.currentTarget.id) return
            let elid = el.currentTarget.id
            if (! this.filters[elid]) return
            let selected_val = this.filters[elid].getValue() //range slider value
            $('#mile_span').text(selected_val)
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
