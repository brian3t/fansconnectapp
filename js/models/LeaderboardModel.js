app.models.Leaderboard = Backbone.Model.extend({
        idAttribute: 'cuser_id',
        sortBy: 'rank',
        initialize: function () {
        },
        urlRoot: config.restUrl + 'general/leaderboard',
        localStorage: false/*,
        toJSON: function() {
            var j = _(this.attributes).clone();
            return j;
        }*/
    },
    {
        cuser_id: null,
        username: null,
        name: null,
        city: null,
        state_abbr: null,
        point: null,
        rank: null
    }
);

app.models.LeaderboardCollection = Backbone.Collection.extend({
    model: app.models.Leaderboard,
    url: config.restUrl + 'general/leaderboard',
    initialize: function () {
        this.on('add', this.new_leader, this);
        this.on('remove', this.check_is_offer_list_empty, this);
    },
    new_leader: function (new_leader) {
        // console.info(new_leader);
    },
    check_is_offer_list_empty: function () {
        var list = this.size();
    }
});