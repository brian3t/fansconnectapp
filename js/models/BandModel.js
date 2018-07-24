const ONE_STAR = '<i class="fas fa-star"></i>';
const HALF_STAR = '<i class="fas fa-star-half"></i>';
app.models.Band = Backbone.RelationalModel.extend({
        initialize: function () {
        },
        urlRoot: config.restUrl + 'band',
        relations: [{
            type: Backbone.HasMany,
            key: 'events',
            relatedModel: 'app.models.Event',
            autoFetch: true
        },
        ],
        localStorage: false,
        defaults: {
            // organizer: {name: null}
            genre: '',
            logo: '',
            website: ''
        },
        setCreatedby: function (created_by_user) {
            this.createdby = created_by_user;
            this.set('user_id', created_by_user.get('id'));
        },
        genre_array: function () {
            let genre = this.get('genre');
            if (genre === null) {
                return [];
            }
            return genre.split(',');
        },
        pull_random_venue: function () {
            if (!(this.get('events') instanceof Backbone.Collection)) {
                return false;
            }
            let events = this.get('events');
            if (events.length < 1) {
                return false;
            }
            let ev = events.at(0);
            /**@var app.model.Event ev **/
            if (!(ev.get('venue') instanceof app.models.Venue)) {
                return false;
            }
            return ev.get('venue');
        },
        pull_star_html: function () {
            let lno_score = this.get('lno_score');
            if (!$.isNumeric(lno_score)){
                return '';
            }
            lno_score = lno_score / 2;
            let full_stars = Math.floor(lno_score);
            let half_stars = (lno_score - full_stars >= 0.5?1:0);

            return 'Rating: ' + ONE_STAR.repeat(full_stars) + HALF_STAR.repeat(half_stars);
        }
    }
);

app.collections.Bands = Backbone.Collection.extend({
    model: app.models.Band,
    /*comparator: function (a) {
        return a.get('name').toLowerCase();
    },*/
    url: config.restUrl + 'band',
    initialize: function () {
        // this.fetch();
    },
});