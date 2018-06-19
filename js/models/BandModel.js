app.models.Band = Backbone.RelationalModel.extend({
        initialize: function () {
        },
        urlRoot: config.restUrl + 'band',
        relations: [/*{
            type: Backbone.HasOne,
            key: 'offer',
            relatedModel: 'app.models.Offer',
            reverseRelation: {
                key: 'marketing',
                includeInJSON: 'id'
            },
            autoFetch: true
        },*/
        ],
        localStorage: false,
        defaults: {
            // organizer: {name: null}
            genre: ''
        },
        setCreatedby: function (created_by_user) {
            this.createdby = created_by_user;
            this.set('user_id', created_by_user.get('id'));
        },
        genre_array: function () {
            let genre = this.get('genre');
            if (genre === null){
                return [];
            }
            return genre.split(',');
        },
    }
);

app.collections.Bands = Backbone.Collection.extend({
    model: app.models.Band,
    /*comparator: function (a) {
        return a.get('name').toLowerCase();
    },*/
    url: config.restUrl + 'band',
    initialize: function () {
        this.fetch();
    },
});