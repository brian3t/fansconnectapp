app.models.Chat = Backbone.RelationalModel.extend({
        initialize: function () {
        },
        urlRoot: CONFIG.restUrlJ + 'chat',
        relations: [{
            type: Backbone.HasOne,
            key: 'event',
            relatedModel: 'app.models.Event',
            reverseRelation: {
                'key': 'chats'
            },
            autoFetch: true
        },
        ],
        localStorage: false,
        defaults: {
            name: '',
            genre: '',
            logo: '',
            lno_score: 0,
            type: 'unknown',
            similar_to: '',
            hometown_city: '',
            hometown_state: '',
            description: '',
            website: '',
            youtube: '',
            instagram: '',
            facebook: '',
            twitter: '',
        }
    }
);

app.collections.Chats = Backbone.Collection.extend({
    model: app.models.Chat,
    /*comparator: function (a) {
        return a.get('name').toLowerCase();
    },*/
    url: CONFIG.restUrlJ + 'chat',
    initialize: function () {
        // this.fetch();
    },
});
