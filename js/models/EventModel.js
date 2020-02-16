app.models.Event = Backbone.RelationalModel.extend({
        initialize: function () {
        },
        urlRoot: CONFIG.restUrl + 'event',
        relations: [
            {
            type: Backbone.HasMany,
            key: 'bands',
            relatedModel: 'app.models.Band',
            autoFetch: false
        },
            {
                type: Backbone.HasOne,
                key: 'venue',
                relatedModel: 'app.models.Venue',
                autoFetch: true,
                reverseRelation: {
                    key: 'event',
                    includeInJSON: 'id',
                },
            }
        ],
        localStorage: false,
        defaults: {},
        setCreatedby: function (created_by_user) {
            this.createdby = created_by_user;
            this.set('user_id', created_by_user.get('id'));
        },
        /*pullVenue: function () {
            let venue = this.get('venue');
            return venue;
        }*/
    }
);

app.collections.Events = Backbone.Collection.extend({
    model: app.models.Event,
    /*comparator: function (a) {
        return a.get('name').toLowerCase();
    },*/
    url: CONFIG.restUrl + 'event'
});