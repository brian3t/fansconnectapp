app.views.SignupView = Backbone.View.extend({

    initialize: function () {
        this.render();
    },

    render: function () {
        this.$el.html(this.template());
        return this;
    },

    events: {
        "click #sign_up_btn": "sign_up",
        "click #goback": "back"
    },
    sign_up: function () {
        let user_data = this.$el.find('form').serializeArray()
        user_data = flat_array_to_assoc(user_data)
        asuser_data = user_data
    },
    back: function (event) {
        window.history.back();
        return false;
    },
    resetFields: function () {
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
