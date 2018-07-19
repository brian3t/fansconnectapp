app.models.Venue = Backbone.RelationalModel.extend({
        initialize: function () {
        },
        urlRoot: config.restUrl + 'venue',
        localStorage: false,
        defaults: {},
        setCreatedby: function (created_by_user) {
            this.createdby = created_by_user;
            this.set('user_id', created_by_user.get('id'));
        },
    }
);

app.collections.Venues = Backbone.Collection.extend({
    model: app.models.Venue,
    /*comparator: function (a) {
        return a.get('name').toLowerCase();
    },*/
    url: config.restUrl + 'venue'
});