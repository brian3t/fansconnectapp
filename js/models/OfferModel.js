app.models.Offer = Backbone.Model.extend({
        idAttribute: 'cuser_id',

        initialize: function () {
        },
        urlRoot: config.restUrl + 'offer',
        localStorage: false,

        cuser_id: null,
        request_cuser: null,
        status: 'pending',
        created_at: null,
        updated_at: null,
        name: '',
        phone: null,
        miles_away: null,
        defaults: {miles_away: null},
        name_initial: function () {
            var name = this.get('name');
            return name_initial_from_name(name);
        },
        toJSON: function() {
            var j = _(this.attributes).clone();
            j.name_initial = this.name_initial();
            return j;
        }
    },
    {
        phone: null
    }
)
;

app.models.OfferCollection = Backbone.Collection.extend({
    model: app.models.Offer,
    url: config.restUrl + 'offer',
    initialize: function () {
        this.on('add', this.new_offer_found, this);
        this.on('remove', this.check_is_offer_list_empty, this);
    },
    new_offer_found: function (new_offer) {
        if (new_offer.get('cuser_id') == app.cuser.id){
            console.log('Driver == Rider found');//todob remove here
        }
        console.info(new_offer);
        var sound = 'file://beep.caf';
        if (typeof device !== 'undefined' &&  _.isObject(device) && device.hasOwnProperty('platform') && device.platform === 'Android'){
            sound =  'file://sound.mp3';
        }
        cordova.plugins.notification.local.schedule({
            id: _.random(1, 65535),
            title: "New match",
            text: "You have been matched with " + new_offer.get('name') + "!  Click here to return to the app and approve your ridematch.",
            data: new_offer
        });
    },
    check_is_offer_list_empty: function () {
        var list = this.size();
    }
    // sync: function () {
    //     Backbone.sync.apply(this, arguments);
    //     _.forEach(this.models, function (e, i, models) {
    //         // console.info(e);
    //     });
    // }
});
// _.extend(app.models.OfferCollection.prototype, BackbonePolling);