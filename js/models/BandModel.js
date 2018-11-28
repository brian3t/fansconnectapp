const ONE_STAR = '<i class="fa fa-star" aria-hidden="true"></i>';
const HALF_STAR = '<i class="fa fa-star-half" aria-hidden="true"></i>';
app.models.Band = Backbone.RelationalModel.extend({
        initialize: function () {
        },
        urlRoot: CONFIG.restUrl + 'band',
        relations: [{
            type: Backbone.HasMany,
            key: 'events',
            relatedModel: 'app.models.Event',
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
        pull_first_event_date_time: function () {
            let first_event = this.get('events').at(0);
            if (!(first_event instanceof app.models.Event)) {
                return '';
            }
            let start_time = first_event.get('start_time');
            let date_time_format = 'ddd, MMM Do';
            let date_time_string = first_event.get('date');

            if (!_.isEmpty(start_time)) {
                date_time_format += ' hA';
            }

            let date_time = moment(date_time_string, 'YYYY-MM-DD hh:mm:ss');
            return date_time.format(date_time_format);
        },
        pull_star_html: function () {
            let lno_score = this.get('lno_score');
            if (!$.isNumeric(lno_score)) {
                return '';
            }
            lno_score = lno_score / 2;
            let full_stars = Math.floor(lno_score);
            let half_stars = (lno_score - full_stars >= 0.5 ? 1 : 0);

            return 'LNO score: ' + ONE_STAR.repeat(full_stars) + HALF_STAR.repeat(half_stars);
        },
        is_fav: function () {
            return ls.get('favs').hasOwnProperty(this.get('id'));
        }
    }
);

app.collections.Bands = Backbone.Collection.extend({
    model: app.models.Band,
    /*comparator: function (a) {
        return a.get('name').toLowerCase();
    },*/
    url: CONFIG.restUrl + 'band',
    initialize: function () {
        // this.fetch();
    },
});