app.views.NavbarView = Backbone.View.extend({
    current_tab: 0,
    el: '#navbar',
    current_view: 'home',
//    tagName: 'div',
//    className: 'navbar-inner',
    attributes: {},
    PAGES_WITH_SEARCH: ['home', "live 'n' out"],
    set_current_tab: function (current_tab){
        this.current_tab = current_tab;
    },
    set_current_view: function (current_view){
        F7LIB.make_tablink_active(current_view)
        if (current_view) {
            if (current_view === 'home') {
                current_view = "live 'n' out";
            }
            if (this.PAGES_WITH_SEARCH.includes(current_view)) {
                this.$el.find('.subnavbar').show();
                $('div.page').addClass('page-with-subnavbar');
            } else {
                this.$el.find('.subnavbar').hide();
                $('div.page').removeClass('page-with-subnavbar');
            }
        }
        this.current_view = current_view;
        this.set_page_title();
    },
    set_page_title: function (){
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
    initialize: function (options){
        //this.$el = options.el;
        this.render();
        this.set_current_view(options.current_view);
    },

    render: function (){
        this.$el.html(this.template());
        var cur_route = Backbone.history.getFragment();
        cur_route = cur_route.split('/').shift();
        if (cur_route === '') {
            cur_route = 'home';
        }
        this.$el.find('nav a').removeClass('active');
        this.$el.find('nav a.' + cur_route).addClass('active');
        // console.log(`navbar rendering`);
        $('.sign_up_anchor').prop('href', ADMINROOT + 'user/register');
        return this;
    },
    dom_ready: function (){
        if (localStorage.getItem('remember') === "true") {
            $('#remember').attr('checked', 'checked');
            $('#username').val(localStorage.getItem('username'));
            $('#password').val(localStorage.getItem('password'));
        }
        //try to login auto, if remember = true
        if (typeof app.cur_user === 'object' && app.cur_user.get('id')) {
            return 1;
        }
        this.listenToOnce(app.event_bus, 'searchbar_dom_ready', function (){
            // console.log('sb ready');
            this.searchbar = fapp.searchbar.create({
                el: '.searchbar',
                searchContainer: '#list_to_search',
                backdrop: true,
                backdropEl: '#searchbar_backdrop',
                searchIn: '.searchable',
                on: {
                    search(sb, query, previousQuery){
                        console.log(`search executed`)
                        console.log(query, previousQuery);
                    },
                    enable(){
                        console.log(`search enabled`)
                        // $('#filters').show();
                        // $('.slider_page').css('margin-top', ($('#filters').height() + $('#leaderboard_period').height()));
                    },
                    disable(){
                        console.log(`search disabled`)
                        // $('#filters').hide();
                        // $('.slider_page').css('margin-top', 0);
                    },
                    clear(){
                        console.log(`cleared`);
                    }
                }
            });
        });
    },
    events: {
        "click .logout": "logout"
    },
    remember_clicked: function (){
        localStorage.setItem('remember', $('#remember').prop('checked'));
        console.info('clicked');
    },
    login: function (e, suppress_toast){
        if (typeof e === 'object') {
            e.preventDefault();
        }
        if (typeof suppress_toast === "undefined" || ! suppress_toast) {
            suppress_toast = false;
        }
        //disable the button so we can't resubmit while we wait
        /*if (localStorage.getItem('remember')) {
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
        }*/
        $("#sign_in_btn").attr("disabled", "disabled");
        let username = 'someids'
        let xhr = $.ajax(CONFIG.restUrl + `user/signin?username=${username}`, {
            crossDomain: true, dataType: 'json', error: (err) => {
                alert(`error`, JSON.stringify(err))
            },
            headers: {
                pw: "Trapok)1"
            },
            method: 'POST',
            complete: () => {
                $("#sign_in_btn").removeAttr('disabled');
            },
            success: (resp) => {
                fapp.panel.close()
                // app.cur_user.set({id: resp.id, username: $('#username').val(), password: $('#password').val()});
                // app.cur_profile.set(resp.profile);
                if (! suppress_toast) {
                    let toast = fapp.toast.create({
                        text: `You have signed in successfully.`,
                        position: 'center',
                        closeTimeout: 4000,
                        destroyOnClose: true,
                    }).open()
                }
                // app.router.dashboard();
                if (! IS_LOCAL) {
                    // app.router.navigate('dashboard', {trigger: true});
                } else {
                    // app.router.navigate('dashboard', {trigger: true});
                }
                setTimeout(fapp.loginScreen.close, 1000);
                app.cur_user.set(id, resp.id)
            },
            fail: () => {
                var message = "Wrong password";
                if (resp.message === 'Username does not exist') {
                    message = 'This username/email does not exist in our system';
                }
                $('#password').next('div.help-block').html('<ul class="list-unstyled"><li>' + message + '</li></ul>')
                    .parent('div.form-group').addClass('has-error');
                //           fapp.toast.create({title: "Login error", text: message, closeTimeout: 3000}).open();
            }
        })
        return false;

    },
    logout: function (e){
        var self = this;
        app_confirm("Are you sure you want to log out?", function (response){
            if (response === true || response == 1) {
                app.reset_user();
                self.back();
            }
            app.utils.misc.hide_popover();
            app.is_notification_active = false;
        });
    },

    back: function (event){
        ratchet_popover_dismiss();
        app.router.navigate('#', {trigger: true, replace: true});
    }
});
