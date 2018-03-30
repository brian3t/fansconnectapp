app.models.User = Backbone.RelationalModel.extend({
    initialize: function () {
    },
    urlRoot: config.restUrl + 'user',
    relations: [
        {
            type: Backbone.HasOne,
            key: 'portfolio',
            relatedModel: 'app.models.Portfolio',
            reverseRelation: {
                key: 'user',
                includeInJSON: 'id'
            }
        }],
    localStorage: false,
    username: null,
    password: null,
    // profile: {avatar: null},
    defaults: {
        twitter_id: null,
        company: {name: null},
        profile: {avatar: null}
    },
    /*get: function (args) {
        if (args === 'fullname') {
            return this.getFullName();
        }
        return Backbone.RelationalModel.prototype.get.call(this, args);
    },*/
    getFullName: function () {
        return this.get('first_name') + ' ' + this.get('last_name');
    },
    setBelongCompany: function (company) {
        this.company = company;
        this.set('belong_company_id', company.get('id'));
    }
});

/*
app.collections.User_collection = Backbone.Collection.extend({
    model: app.models.User,
    url: config.restUrl + 'user',
    comparator: function (a) {
        return a.get('first_name').toLowerCase();
    }    // initialize: function () {
    //     this.url = config.restUrl + 'user?' + $.param({'company_id': app.cur_user.get('company').get('id')});
    // }
});*/
