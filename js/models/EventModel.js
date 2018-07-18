app.models.Event = Backbone.RelationalModel.extend({
        initialize: function () {
        },
        urlRoot: config.restUrl + 'event',
        relations: [{
            type: Backbone.HasMany,
            key: 'band_events',
            relatedModel: 'app.models.BandEvent',
            reverseRelation: {
                key: 'event_id',
            },
            autoFetch: true
        },
        ],
        localStorage: false,
        defaults: {
        },
        setCreatedby: function (created_by_user) {
            this.createdby = created_by_user;
            this.set('user_id', created_by_user.get('id'));
        },
    }
);

app.collections.Bands = Backbone.Collection.extend({
    model: app.models.Band,
    /*comparator: function (a) {
        return a.get('name').toLowerCase();
    },*/
    url: config.restUrl + 'band'
});