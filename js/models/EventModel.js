app.models.Event = Backbone.RelationalModelX.extend({
        initialize: function (){
        },
        urlRoot: CONFIG.restUrl + 'event',
        relations: [
            /*{
                type: Backbone.HasMany,
                key: 'bands',
                relatedModel: 'app.models.Band',
                collectionType:'app.collections.Bands',
                includeInJSON: 'id',
            },*/
            {
                type: Backbone.HasMany,
                key: 'band_events',
                relatedModel: 'app.models.BandEvent',
                reverseRelation: {
                    key: 'event'
                },
                // includeInJSON: 'id',
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
        setCreatedby: function (created_by_user){
            this.createdby = created_by_user;
            this.set('user_id', created_by_user.get('id'));
        },
        fetch_via: function (relation = 'band', via = 'band_events'){
            let via_collection = this.get(via)
            return via_collection.map((via_model)=>{
                via_model.fetch_expand(relation)
            })
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
