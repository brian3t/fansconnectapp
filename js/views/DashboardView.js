app.views.DashboardView = Backbone.View.extend({
    tagName: 'div',
    model: app.cuser,
    initialize: function () {
        this.render();
        this.model.on("change update", this.render, this);
    },

    render: function () {
        this.$el.html(this.template($.extend({}, this.model.attributes, {commuter_data: this.model.commuter_data})));
        return this;
    },

    events: {
        "click .logout": "logout"
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
