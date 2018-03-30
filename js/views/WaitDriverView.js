app.views.WaitDriverView = Backbone.View.extend({
        initialize: function () {
            this.listenTo(this.model, 'change', this.render);
        },
        render: function () {
            this.$el.empty();

            this.$el.html(this.template(this.model.attributes));
            this.delegateEvents();
            return this;
        },
        events: {
            "click button.confirm": "confirm",
            "click button.cancel": "cancel"
        },
        confirm: function () {
            if (typeof this.parent_view == "object") {
                this.parent_view.confirm_pickup();
            }
        },
        cancel: function () {
            if (typeof this.parent_view == 'object') {
                this.parent_view.cancel_request_ride();
            }
        }

    },
    {
        parent_view: null
    });