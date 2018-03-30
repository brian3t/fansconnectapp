app.views.PortfolioView = Backbone.View.extend({
        tagName: 'div',
        model: {},
        initialize: function () {
            this.model = app.cur_user.get('portfolio');
        },
        self_update_model: function () {
            console.info('app curuser synced');
            this.model = app.cur_user.get('portfolio');
        },
        stock_list_view: {},
        render: function () {
            this.self_update_model();
            if (typeof this.model !== 'object' || !this.model) {
                return this;
            }
            this.$el.html(this.template(this.model.attributes));
            return this;
        },
        events: {},
        dom_ready: function () {
            if (IS_LOCAL) {
            }
        }
    }
);

if (IS_DEBUG) {
    window.localStorage.removeItem('cuser');
}