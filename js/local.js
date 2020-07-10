var IS_LOCAL = true;
// var IS_LOCAL = false;

const CONFIG = {
    restUrl: 'https://api.livenout.usvsolutions.com/v1/',
    // date_range_day: 34,//asdf
};

var ADMINROOT = 'https://admin.livenout.usvsolutions.com/';

if (IS_LOCAL){
    CONFIG.restUrl = 'https://api.lnoapi/v1/'
    CONFIG.date_range_day = 34
    ADMINROOT = 'https://lnoapi/'
}
