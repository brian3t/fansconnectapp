app.views.SignupView = Backbone.View.extend({

    initialize: function (){
        this.render();
    },

    render: function (){
        this.$el.html(this.template());
        return this;
    },

    events: {
        "click #sign_up_btn": "sign_up",
        "click #goback": "back"
    },
    sign_up: async function (){
        let user_data = this.$el.find('form').serializeArray()
        user_data = flat_array_to_assoc(user_data)
        let user_post = $.post(CONFIG.restUrl + 'user/signup', user_data,
            function (success_msg) {
                let toast = fapp.toast.create({
                    text: success_msg + `<br/>You can sign in now`,
                    position: 'center',
                    closeTimeout: 4000,
                    destroyOnClose: true,
                    on: {
                        close: function (){
                            app.router.navigate('#')
                            app.router.home()
                            $$('#show_login_btn').click()
                        }
                    }
                }).open()
            }, 'json')
        user_post.fail((err) => {
            if (!err.responseJSON) err = {responseJSON:['Server error']}
            err = err.responseJSON
            if (typeof err === "object" && err[0]) err = err[0]
            let toast = fapp.toast.create({
                text: `Error during registration: ` + err,
                position: 'center',
                closeTimeout: 4000,
                destroyOnClose: true,
            }).open()
        })
    },
    back: function (event){
        window.history.back();
        return false;
    },
    resetFields: function (){
        $('input[name="pwdAnswer"]').val('');
        $('#userName').val('');
        $('#pwdQuestion').text('');
        $('input[name="password1"]').val('');
    },
    dom_ready: function (){

    }

}, {
    localvar: false

});
