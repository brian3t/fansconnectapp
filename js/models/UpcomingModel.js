app.models.Portfolio = Backbone.RelationalModel.extend({
        idAttribute: 'user_id',
        initialize: function () {
        },
        urlRoot: config.restUrl + 'portfolio',
        localStorage: false,
        relations: [{
            type: Backbone.HasOne,
            key: 'user',
            relatedModel: 'app.models.User',
            reverseRelation: {
                key: 'portfolio',
                includeInJSON: 'id'
            }
        }],
        created_at: null,
        user_id: null,
        stock_id: '',
        total_points: null,
        average_change_since_last_traded: null,
        average_unit_cost: null,
        average_real_time_value: null,
        stocks: {},
        is_buying: true,
        unit_cost: null,
        defaults: {},
        toJSON: function () {
            var j = _(this.attributes).clone();
            // j.name_initial = this.name_initial();
            return j;
        }
    }
);

app.models.PortfolioCollection = Backbone.Collection.extend({
    model: app.models.Portfolio,
    url: config.restUrl + 'portfolio',
    initialize: function () {
        this.on('add', this.new_portfolio_found, this);
        this.on('remove', this.check_is_portfolio_list_empty, this);
    },
    new_portfolio_found: function (new_portfolio) {
        if (new_portfolio.get('cuser_id') == app.cuser.id) {
            console.log('Driver == Rider found');//todob remove here
        }
        console.info(new_portfolio);
        var sound = 'file://beep.caf';
        if (typeof device !== 'undefined' && _.isObject(device) && device.hasOwnProperty('platform') && device.platform === 'Android') {
            sound = 'file://sound.mp3';
        }
        cordova.plugins.notification.local.schedule({
            id: _.random(1, 65535),
            title: "New match",
            text: "You have been matched with " + new_portfolio.get('name') + "!  Click here to return to the app and approve your ridematch.",
            data: new_portfolio
        });
    },
    check_is_portfolio_list_empty: function () {
        var list = this.size();
    }
    // sync: function () {
    //     Backbone.sync.apply(this, arguments);
    //     _.forEach(this.models, function (e, i, models) {
    //         // console.info(e);
    //     });
    // }
});
// _.extend(app.models.PortfolioCollection.prototype, BackbonePolling);