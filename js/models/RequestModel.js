app.models.Request = Backbone.Model.extend({
        idAttribute: 'cuser_id',
        initialize: function () {
        },
        urlRoot: config.restUrl + 'request',
        localStorage: false,

        cuser_id: null,
        status: 'pending',
        created_at: null,
        updated_at: null,
        dropoff_full_address: null,
        dropoff_lat: null,
        dropoff_lng: null,
        pickup_full_address: null,
        pickup_lat: null,
        pickup_lng: null,
        miles_away: null,
        name: null,
        name_initial: function () {
            var name = this.get('name');
            return name_initial_from_name(name);
        },
        phone: null,
        trigger_col: null,
        defaults: {
            miles_away: null,
            phone: null
        },
        toJSON: function() {
            var j = _(this.attributes).clone();
            j.name_initial = this.name_initial();
            return j;
        }
    }
)
;
app.models.RequestCollection = Backbone.Collection.extend({
    model: app.models.Request,
    url: config.restUrl + 'request',
    initialize: function () {
        this.on('remove', this.check_is_request_list_empty, this);
    },
    check_is_request_list_empty: function () {
        var list = this.size();
    },
    sync: function () {
        Backbone.sync.apply(this, arguments);
        _.forEach(this.models, function (e, i, models) {
            // console.info(e);
        });
    }
});
