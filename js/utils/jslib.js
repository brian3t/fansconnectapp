function pluckRecursive(input, prop, collect) {
    collect = collect || [];

    if (_.isArray(input)) {
        _.forEach(input, function (value, key) {
            pluckRecursive(value, prop, collect);
        });
    } else if (_.isObject(input)) {
        _.forEach(input, function (value, key) {
            if (key === prop) {
                collect.push(value);
            } else {
                pluckRecursive(value, prop, collect);
            }
        });
    }

    return collect;
}

/**
 * Return street addr and City / State ZIP Country
 * e.g. var full_address = '18101 Von Karman Ave, Irvine, CA 92612, USA'; full_address_to_addr_city(full_address) = 1801, CA 92
 * @param full_address e.g. 18101 Von Karman Ave, Irvine, CA 92612, USA
 * @return array [street city , state zip Country]
 */
function full_address_to_addr_city(full_address) {
    var result = [];
    // var full_address = '18101 Von Karman Ave, Irvine, CA 92612, USA';
    var re = /, [A-Z]{2}\s\d+,/ig;
    var match = re.exec(full_address);
    if (typeof match !== 'object' || !match.hasOwnProperty('index')) {
        return [full_address, ''];
    }
    else {
        return [full_address.slice(0, match.index), full_address.slice(match.index + 1)];
    }
}

/**
 * Returns non-empty string, e.g. not null, not ''
 * @param str
 * @returns {boolean}
 */
function is_nonempty_str(str) {
    return (typeof str !== "undefined") &&
        (typeof str.valueOf() === "string") && (str.length > 0);
}


/**
 * Join array with glue string. Ignore null values and empty strings
 * @param array
 * @param glue default to ', '
 */
function join_ignore_null(array, glue) {
    var res = '';
    if (typeof glue === 'undefined') {
        glue = ', ';
    }
    array.forEach(function (v, i) {
        if (typeof v === 'undefined' || v === null || v === '' || v === false) {
            return;
        }
        if (res === '') {
            res = v;
        } else {
            res += glue + v;
        }
    });
    return res;
}

/**
 * Convert jQuery's serializeArray() array into assoc array
 * Also merge input of the same name into array, e.g. union_memberships = Agent & union_memberships = Other
 * becomes union_memberships = [Agent, Other]
 * Also parse money value
 * @param arr
 * @returns assoc array, e.g. {'name': 'John', 'age': 22, 'array': ['a','b'] }
 */
function flat_array_to_assoc(arr) {
    if (!_.isArray(arr)) {
        return {};
    }
    var result = {};
    arr.forEach(function (e) {
        if (_.isObject(e)) {
            e = _.toArray(e);
            var key = e[0];
            if (e.length == 2) // ["first_name", "John"]
            {
                var val = e[1];
                if (typeof val == 'string') {
                    val = val.replace('$', '');
                }
                if (isNumeric(val)) {
                    val = Number(val.replace(/[^0-9\.]+/g, ""));
                    val = parseFloat(val);
                }
                if (!_.has(result, key)) {
                    result[key] = val;
                } else {
                    if (_.isString(result[key])) {
                        result[key] = new Array(result[key]);
                    }
                    result[key].push(val);
                }

            }
        }
    });
    return result;
}

/**
 * Split name into first name and last name
 * @param {string} Full name
 * @returns {array} First name, Last name
 */
function nameToFirstLast(name) {
    name = name.trim().replace(/\s+/ig, ' ');//remove extra spaces
    var name_parts = name.split(' ');
    var first_name = name_parts.shift();
    return [first_name, name_parts.join(' ')];
}

/**
 * Backbone print options from a collection
 * @param collection_name e.g. venue
 * @param name_column e.g. name
 * @param id_column
 * @returns {string}
 */
function print_option_fr_collection(collection_name, name_column, id_column = 'id') {
    if (typeof name_column === "undefined" || !name_column) {
        name_column = 'name';
    }
    var result = '<option value=""></option>';
    if (typeof(app.collections[collection_name]) === "undefined") {
        return result;
    }

    _.each(app.collections[collection_name].models, function (a_model) {
        result += '<option value = "' + a_model.get(id_column) + '" >' + a_model.get(name_column) + '</option>';
    });
    return result;
}

String.prototype.ucwords = function () {
    return (this + '')
        .replace(/^(.)|\s+(.)|,+(.)/g, function ($1) {
            return $1.toUpperCase();
        });
};