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
            },
            {
                type: Backbone.HasOne,
                key: 'first_band',
                relatedModel: 'app.models.Band',
                autoFetch: false,
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

app.collections.Events = Backbone.PageableCollection.extend({
    model: app.models.Event,
    /*comparator: function (a) {
        return a.get('name').toLowerCase();
    },*/
    url: CONFIG.restUrl + 'event',
    state: {
        // You can use 0-based or 1-based indices, the default is 1-based.
        // You can set to 0-based by setting ``firstPage`` to 0.
        firstPage: 1,

        // Set this to the initial page index if different from `firstPage`. Can
        // also be 0-based or 1-based.
        currentPage: 1,
        pageSize: 12

        // Required under server-mode
        // totalRecords: 200
    },
    // You can configure the mapping from a `Backbone.PageableCollection#state`
    // key to the query string parameters accepted by your server API.
    queryParams: {
        // `Backbone.PageableCollection#queryParams` converts to ruby's
        // will_paginate keys by default.
        currentPage: "page",
        pageSize: "page_size"
    }
});
