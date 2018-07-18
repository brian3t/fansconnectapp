app.models.BandEvent = Backbone.RelationalModel.extend({
        initialize: function () {
        },
        urlRoot: config.restUrl + 'band-event',
        localStorage: false,
        relations: [{
            type: Backbone.HasOne,
            key: 'event_id',
            relatedModel: 'app.models.Event',
            autoFetch: true
        }],
        defaults: {
        },
    }
);

app.collections.BandEvents = Backbone.Collection.extend({
    model: app.models.BandEvent,
    /*comparator: function (a) {
        return a.get('name').toLowerCase();
    },*/
    url: config.restUrl + 'band-event',
    initialize: function () {
        // this.fetch();
    },
});