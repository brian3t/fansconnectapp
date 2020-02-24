app.models.Venue = Backbone.RelationalModel.extend({
        initialize: function () {
        },
        urlRoot: CONFIG.restUrl + 'venue',
        localStorage: false,
        defaults: {},
        setCreatedby: function (created_by_user) {
            this.createdby = created_by_user;
            this.set('user_id', created_by_user.get('id'));
        },
        getFullAddr:function(){
            let full_addr = [this.get('address1'), this.get('address2'), this.get('city'), this.get('state') + ' ' + this.get('zip')].join(',');
            full_addr = start_case(full_addr);
            full_addr = full_addr.replace(/\s+/g, ' ').replace(/,+/g, ',').replace(/,/g, ', ').trim();
            return full_addr;
        }
    }
);

app.collections.Venues = Backbone.Collection.extend({
    model: app.models.Venue,
    /*comparator: function (a) {
        return a.get('name').toLowerCase();
    },*/
    url: CONFIG.restUrl + 'venue'
});
