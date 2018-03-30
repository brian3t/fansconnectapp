app.views.ForgotView = Backbone.View.extend({
    initialize: function () {
        this.render();
    },

    render: function () {
        this.$el.html(this.template());
        var self = this;
        self.resetFields();
        return this;
    },

    events: {
        "click .logout": "back"
    },

    back: function(event) {
        window.history.back();
        return false;
    },

    resetFields: function() {
        $("#forgotForm #answer").val('');
        $("#forgotForm #username").val('');
        $("#forgotForm #question").text('');
        $("#forgotForm #new_password").val('');
    }
});
