app.models.BandEvent = Backbone.RelationalModel.extend({
        initialize: function () {
        },
        urlRoot: CONFIG.restUrl + 'band-event',
        localStorage: false,
        defaults: {},
    }
);

app.collections.BandEvents = Backbone.Collection.extend({
    model: app.models.BandEvent,
    /*comparator: function (a) {
        return a.get('name').toLowerCase();
    },*/
    url: CONFIG.restUrl + 'band-event'
});
