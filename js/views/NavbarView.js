app.views.NavbarView = Backbone.View.extend({
    current_tab: 0,
    el: '#navbar',
    current_view: 'home',
//    tagName: 'div',
//    className: 'navbar-inner',
    attributes: {},
    PAGES_WITH_SEARCH: ['home', "live'n'out"],
    set_current_tab: function (current_tab) {
        this.current_tab = current_tab;
    },
    set_current_view: function (current_view) {
        if (current_view) {
            if (current_view === 'home') {
                current_view = "live 'n' out";
            }
            if (this.PAGES_WITH_SEARCH.includes(current_view)) {
                this.$el.find('.subnavbar').show();
            } else {
                this.$el.find('.subnavbar').hide();
            }
        }
        this.current_view = current_view;
        this.set_page_title();
    },
    set_page_title: function () {
        let title = this.current_view;
        switch (this.current_view) {
            case 'band': {
                title = app.bandView.model.get('name');
                app.bandView.model.on('sync', (band_model) => this.$el.find('#current_page_title').html(band_model.get('name')));
                break;
            }
            default:
                break;
        }
        this.$el.find('#current_page_title').html(title);
    },
    initialize: function (options) {
        //this.$el = options.el;
        this.render();
        this.set_current_view(options.current_view);
    },

    render: function () {
        this.$el.html(this.template());
        var cur_route = Backbone.history.getFragment();
        cur_route = cur_route.split('/').shift();
        if (cur_route === '') {
            cur_route = 'home';
        }
        this.$el.find('nav a').removeClass('active');
        this.$el.find('nav a.' + cur_route).addClass('active');
        console.log(`navbar ready`);
        $('.sign_up_anchor').prop('href', ADMINROOT + 'user/register');
        return this;
    },
    dom_ready: function () {
        if (localStorage.getItem('remember') === "true") {
            $('#remember').attr('checked', 'checked');
            $('#username').val(localStorage.getItem('username'));
            $('#password').val(localStorage.getItem('password'));
        }
        //try to login auto, if remember = true
        if (typeof app.cur_user === 'object' && app.cur_user.get('id')) {
            return 1;
        }
        if (localStorage.getItem('remember') === "true") {
            this.login(true, true);
        }
        this.listenToOnce(app.event_bus, 'searchbar_dom_ready', function () {
            console.log('sb ready');
            this.searchbar = fapp.searchbar.create({
                el: '.searchbar',
                searchContainer: '#live_list',
                backdropEl: '#searchbar_backdrop',
                searchIn: '.searchable',
                on: {
                    search(sb, query, previousQuery) {
                        console.log(query, previousQuery);
                    },
                    enable() {
                        $('#filters').show();
                        $('.slider_page').css('margin-top', ($('#filters').height() + $('#leaderboard_period').height()));
                    },
                    disable() {
                        $('#filters').hide();
                        $('.slider_page').css('margin-top', 0);
                    }
                }
            });
        });
    },
    events: {
        "click .logout": "logout"
    },
    remember_clicked: function () {
        localStorage.setItem('remember', $('#remember').prop('checked'));
        console.info('clicked');
    },
    login: function (e, suppress_toast) {
        if (typeof e === 'object') {
            e.preventDefault();
        }
        if (typeof suppress_toast === "undefined" || !suppress_toast) {
            suppress_toast = false;
        }
        //disable the button so we can't resubmit while we wait
        if (localStorage.getItem('remember')) {
            if (!($('#username').val())) {
                $('#username').val(localStorage.getItem('username'));
            }
            else {
                localStorage.setItem('username', $('#username').val());
            }
            if (!($('#password').val())) {
                $('#password').val(localStorage.getItem('password'));
            }
            else {
                localStorage.setItem('password', $('#password').val());
            }
        }
        $("#sign_in_btn").attr("disabled", "disabled");
        /*
                $.post(CONFIG.restUrl + 'user/login', $('#login_form').serialize(), function (resp) {
                    if (resp.status === 'ok') {
                        fapp.closePanel();
                        document.cookie = 'loginstring=' + $('#login_form').serialize();
                        app.cur_user.set({id: resp.id, username: $('#username').val(), password: $('#password').val()});
                        // app.cur_profile.set(resp.profile);
                        if (!suppress_toast) {
                            fapp.addNotification({title: "Success", message: "Signed in successfully", hold: 3000});
                        }
                        // app.router.dashboard();
                        if (!IS_LOCAL) {
                            // app.router.navigate('dashboard', {trigger: true});
                        } else {
                            // app.router.navigate('dashboard', {trigger: true});
                        }
                        setTimeout(fapp.closeModal, 1000);
                        var jqxhr = app.cur_user.fetch({
                            success: function () {
                                if (typeof app.Portfolio_view === 'object') {
                                    app.Portfolio_view.render();
                                }
                                app.prepare_collections();
                            }
                        });

                    } else {
                        var message = "Wrong password";
                        if (resp.message === 'Username does not exist') {
                            message = 'This username/email does not exist in our system';
                        }
                        $('#password').next('div.help-block').html('<ul class="list-unstyled"><li>' + message + '</li></ul>')
                            .parent('div.form-group').addClass('has-error');
             //           fapp.toast.create({title: "Login error", text: message, closeTimeout: 3000}).open();
                    }
                }, 'json').always(function () {
                    $("#sign_in_btn").removeAttr('disabled');
                });
        */
        return false;

    },
    logout: function (e) {
        var self = this;
        app_confirm("Are you sure you want to log out?", function (response) {
            if (response === true || response == 1) {
                app.reset_user();
                self.back();
            }
            app.utils.misc.hide_popover();
            app.is_notification_active = false;
        });
    },

    back: function (event) {
        ratchet_popover_dismiss();
        app.router.navigate('#', {trigger: true, replace: true});
    }
});
