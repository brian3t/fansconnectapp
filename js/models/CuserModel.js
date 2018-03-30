app.models.Cuser = Backbone.Model.extend({
        initialize: function () {
        },
        urlRoot: config.restUrl + 'cuser',
        url: function () {
            if (this.id) {
                return this.urlRoot + '/' + this.id;
            }

            return this.urlRoot;
        },
        localStorage: true,
        commuter_data: {},
        pickup_location: {},
        dropoff_location: {},
        home_address: {},
        work_address: {},
        miles_away: 99999,
        name: null,
        phone: '',
        request: {},
        lat: -1,
        lng: -1,
        eta: null,
        cuser_status: 'offline',
        address_realtime: '',
        registrationId: localStorage.getItem('registrationId'),
        defaults: {
            phone: null,
            miles_away: null,
            eta: null
        },
        name_initial: function () {
            return name_initial_from_name(this.get('name'));
        },
        attributes_extended: function () {
            var j = _(this.attributes).clone();
            j.name_initial = this.name_initial();
            return j;
        }
        // toJSON: function() {
        //     var j = _(this.attributes).clone();
        //     j.name_initial = this.name_initial();
        //     return j;
        // }
    }
    // ,
//     {
//     id_commuter: null,
//     enrolled: null,
//     username: null,
//     addresses: {},
//     commuter_data: {},
//     arrive_after: null,
//     hashed_password: null,
//     remember_checkbox: null
//
// }
);
app.models.DriverCollection = Backbone.Collection.extend({
    model: app.models.Cuser,
    url: config.restUrl + 'cuser/get-drivers',
    initialize: function () {
    },
    sync: function () {
        Backbone.sync.apply(this, arguments);
    }
});