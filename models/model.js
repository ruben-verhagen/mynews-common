// ----------------
//   Dependencies
// ----------------

var Validate    = require('validator');
var Mynews       = require('../database/database');
var Slug        = require('slug');
var Config      = require('../config.json');

var Resque = require('coffee-resque').connect({
    host: Config.redis.host,
    port: Config.redis.port
});

// ----------------
//   Definition
// ----------------

var Model = function(data) {

}

Model.prototype = {

    properties: {},

    '@class': false,
    '@rid': false,

    // --
    // Instance Methods
    // --

    /**
     * Save properties to the database
     *
     * @param   Func        cb      Completion Callback
     */
    save: function(cb) {
        var that = this;

        if (!this['@rid']) {
            this._insert(cb);
        } else {
            this._update(cb);
        }
    },

    /**
     * Change the slug to new value
     *
     * @param string    new_slug    new slug value
     * @param Func      cb          Completion Callback
     */
    change_slug: function(new_slug, cb) {
        var that = this;

        Mynews.odb
            .update(this['@class'])
            .set({ slug: new_slug })
            .where({ '@rid': this['@rid'] })
            .scalar()
            .then(function(total) {
                that['slug'] = new_slug;

                if (total) {
                    cb(null, that);
                } else {
                    cb(new Error("Update of " + that['@class'] + " returned no data."), false);
                }
            })
            .catch(function(e) {
                console.log(e);
                cb(e);
            });
    },

    /**
     * Delete this instance
     *
     * @param   Func        cb      Completion Callback
     */
    delete: function(cb) {
        var that = this;

        Mynews.odb
            .vertex
            .delete(this['@rid'])
            .then(function() {
                Resque.enqueue('search:remove', 'worker', [{ type: that['@class'], data: that['@rid'] }], function(err) {
                    cb(null, true);
                    that._empty();
                });
            })
            .catch(cb);
    },

    /**
     * Insert field values to the database
     *
     * @param Func         cb      Completion Callback
     */
    _insert: function(cb) {
        var that = this;
        var currentTime = Math.round(Date.now() / 1000); 
        that.creation_date = currentTime;
        that.modification_date = currentTime;

        if (!this.properties.slug) {
            try {
                Mynews.odb.query(
                    "INSERT INTO " + that['@class'] +
                    " (" + this._fields() + ") VALUES (" + this._field_params() + ")",
                    { params: this._props() }
                ).then(
                    function(response) {
                        response = response[0];
                        if (response && response['@rid']) {
                            that['@rid'] = Mynews.RID.Build(response['@rid']);

                            Resque.enqueue('search:sync', 'worker', [{ type: that['@class'], data: that['@rid'] }], function(err) {
                                cb(null, that);
                            });
                        } else {
                            console.log("Insert of " + that['@class'] + " returned no data.");
                            cb(new Error("Insert of " + that['@class'] + " returned no data."));
                        }
                    }
                );
            }
            catch(e) {
                console.log('Caught Error ^^^^^^^^');
                console.log(e);
            }
        } else {
            this._new_slug(0, function(error, new_slug) {
                if (error) {
                    cb(error, false);
                } else {
                    that['slug'] = new_slug;

                    try {
                        Mynews.odb.query(
                            "INSERT INTO " + that['@class'] +
                            " (" + that._fields() + ") VALUES (" + that._field_params() + ")",
                            { params: that._props() }
                        ).then(
                            function(response) {
                                response = response[0];
                                if (response && response['@rid']) {
                                    that['@rid'] = Mynews.RID.Build(response['@rid']);

                                    Resque.enqueue('search:sync', 'worker', [{ type: that['@class'], data: that['@rid'] }], function(err) {
                                        cb(null, that);
                                    });
                                } else {
                                    console.log("Insert of " + that['@class'] + " returned no data.");
                                    cb(new Error("Insert of " + that['@class'] + " returned no data."));
                                }
                            }
                        );
                    }
                    catch(e) {
                        console.log('Caught Error ^^^^^^^^');
                        console.log(e);
                    }
                }
            });
        }
    },

    /**
     * Update field values to the database
     *
     * @param Func         cb      Completion Callback
     */
    _update: function(cb) {
        var that = this;
        that.modification_date = Math.round(Date.now() / 1000);

        Mynews.odb
            .update(this['@class'])
            .set(this._props())
            .where({ '@rid': this['@rid'] })
            .scalar()
            .then(function(count) {
                if (count) {
                    Resque.enqueue('search:sync', 'worker', [{ type: that['@class'], data: that['@rid'] }], function(err) {
                        cb(null, that);
                    });
                } else {
                    cb(new Error("Update of " + that['@class'] + " returned no data."), false);
                }
            })
            .catch(cb);
    },

    /**
     * Get the slug base value
     *
     * @returns String   string that will be used as base value for generating slug
     */
    _get_slug_base_string: function() {
        return '';
    },

    /**
     * Create new unique slug value
     *
     * @param int       postfix_num     slug postfix number
     * @param Func      cb              Completion Callback
     */
    _new_slug: function(postfix_num, cb) {
        var that = this;
        var slug_base_value = this._get_slug_base_string();
        if (slug_base_value == '') {
            cb(new Error("Slug base property has empty value."), false);
            return;
        }
        var new_slug = Slug(slug_base_value).toLowerCase();
        if (postfix_num > 0) {
            new_slug = new_slug + '-' + postfix_num;
        }
        this._check_slug_uniqueness(new_slug, function(error, slug) {
           if (error){
               cb(error, false);
               return;
           }
           if (slug == '') {        //same slug already exists
               that._new_slug(postfix_num + 1, cb);
           } else {                 //slug is unique
               cb(null, slug);
           }
        });
    },

    /**
     * Check the uniqueness of new slug value
     *
     * @param string    slug            slug value
     * @param Func      cb              Completion Callback
     */
    _check_slug_uniqueness: function(slug, cb) {
        Mynews.odb
            .select()
            .from(this['@class'])
            .where({ slug: slug })
            .scalar()
            .then(function(count) {
                if (count) {
                    cb(null, false);
                } else {
                    cb(null, slug);
                }
            })
            .catch(cb);
    },

    /**
     * Get field value list for update and insert
     *
     * @returns String
     */
    _values: function() {
        var field_values = '';
        for (var i in this.properties) {
            if (i != '@rid' && i != 'slug') {
                if (this[i] != undefined) {
                    switch (this.properties[i].type) {
                        case 'short':
                        case 'long':
                        case 'decimal':
                            field_values += i + "=" + Mynews.escape(this[i]) + ",";
                            break;

                        default:
                            field_values += i + "='" + Mynews.escape(this[i]) + "',";
                            break;
                    }
                }
            }
        }

        field_values = field_values.substr(0, field_values.length - 1);
        return field_values;
    },

    /**
     * Get Properties field param names prefixed by a colon (:)
     *  (comma delimited)
     */
    _field_params: function() {
        var output = '';
        for (var i in this.properties) {
            if (i != '@rid' && typeof i != 'undefined') {
                output += ':' + i + ',';
            }
        }

        output = output.substr(0, output.length - 1);
        return output;
    },

    /**
     * Get Properties field names (comma delimited)
     */
    _fields: function() {
        var output = '';
        for (var i in this.properties) {
            if (i != '@rid' && typeof i != 'undefined') {
                output += i + ',';
            }
        }

        output = output.substr(0, output.length - 1);
        return output;
    },

    /**
     * Get Properties as k/v
     */
    _props: function() {
        var output = {};
        for (var i in this.properties) {
            if (i != '@rid' && typeof i != 'undefined') {
                output[i] = this[i];
            }
        }

        // We only use slug property when the object is
        // brand new.
        if (!this.slug || this['@rid']) {
            delete output.slug;
        }

        return output;
    },

    /**
     * Load values into self
     */
    _load: function(data) {
        // Step 1 - Check that required properties exist
        if (!data) {
            throw new Error(this['@class'] + ' tried to instantiate with no data.');
        }
        for (var i in this.properties) {
            if (this.properties[i].required && data[i] == undefined) {
                throw new Error(this['@class'] + ' tried to instantiate with missing required parameter [' + i + '].');
            }
        }

        // Remove any nulls
        for (var i in data) {
            if (data[i] == null) {
                delete data[i];
            }
        }

        // Step 2 - Validate properties
        for (var i in data) {
            if (this.properties[i]) {
                // Property exists, validate it
                switch (this.properties[i].type) {
                    case 'rid':
                        if (Validate.isLength(data[i], 3, 64)) {
                            this[i] = data[i];
                        } else {
                            throw new Error(this['@class'] + ' tried to instantiate with invalid [@rid:rid].');
                        }
                        break;

                    case 'string':
                        if (Validate.isLength(data[i], this.properties[i].min, this.properties[i].max)) {
                            this[i] = Validate.trim(data[i]);
                        } else {
                            throw new Error(this['@class'] + ' tried to instantiate with invalid [' + i + ':string] [' + data[i] + '].');
                        }
                        break;

                    case 'email':
                        if (Validate.isLength(data[i], 5, 256) && Validate.isEmail(data[i])) {
                            this[i] = Validate.trim(data[i]);
                        } else {
                            throw new Error(this['@class'] + ' tried to instantiate with invalid [' + i + ':email] [' + data[i] + '].');
                        }
                        break;

                    case 'decimal':
                        if (Validate.isFloat(parseFloat(data[i]))) {
                            this[i] = parseFloat(data[i]);
                        } else {
                            throw new Error(this['@class'] + ' tried to instantiate with invalid [' + i + ':decimal] [' + data[i] + '].');
                        }
                        break;

                    case 'long':
                    case 'short':
                        if (Validate.isInt(parseInt(data[i]))) {
                            this[i] = parseInt(data[i]);
                        } else {
                            throw new Error(this['@class'] + ' tried to instantiate with invalid [' + i + ':long/short] [' + data[i] + '].');
                        }
                        break;

                    case 'url':
                        if (!this.properties[i].required || Validate.isURL(data[i])) {
                            this[i] = data[i]
                        } else {
                            throw new Error(this['@class'] + ' tried to instantiate with invalid [' + i + ':url] [' + data[i] + '].');
                        }
                        break;

                    case 'enum':
                        if (Validate.isIn(data[i], this.properties[i].options)) {
                            this[i] = data[i]
                        } else {
                            throw new Error(this['@class'] + ' tried to instantiate with invalid [' + i + ':enum] [' + data[i] + '].');
                        }
                        break;
                }
            }
        }
    },

    /**
     * Empty values of itself
     */
    _empty: function() {
        for (var i in this.properties) {
            delete this[i];
        }
    }

}

// --
// Public Helpers (Samples)
// --

/**
 * Find a single object
 *
 * @param   Array       filters Filter conditions
 * @param   Func        cb      Completion Callback
 */
Model.Find = function(that, filter, cb) {
    Mynews.odb.query(
        'SELECT ' + Model._select(filter.select) +
        '  FROM ' + that['@class'] +
        '  WHERE ' + Model._where(filter.where) +
        '  LIMIT 1'
    )
        .then(function(data) {
            if (data && data.length) {
                data[0]['@rid'] = Mynews.RID.Build(data[0]['@rid']);
                if (filter.raw) {
                    cb(null, data[0]);
                } else {
                    cb(null, new that(data[0]));
                }
            } else {
                cb(null, false);
            }
        })
        .catch(cb);
},

/**
 * Find a single object
 *
 * @param   Model       that        Prototype of calling object
 * @param   Obj         filters     Finder Filters
 * @param   Func        cb          Completion Callback
 */
Model.FindAll = function(that, filter, cb) {
    var db_query = 'SELECT ' + Model._select(filter.select) + '  FROM ' + that['@class'];
    if (filter.where != undefined) {
        db_query = db_query + '  WHERE ' + Model._where(filter.where);
    }

    Mynews.odb.query(db_query)
        .then(function(data) {
            if (data && data.length) {
                var results = [];

                for (var i in data) {
                    data[i]['@rid'] = Mynews.RID.Build(data[i]['@rid']);
                    if (filter.raw) {
                        results.push(data[i]);
                    } else {
                        results.push(new that(data[i]));
                    }
                }

                cb(null, results);
            } else {
                cb(null, []);
            }
        })
        .catch(cb);
},

/**
 * Create a single object
 *
 * @param   Model       that    Prototype of calling object
 * @param   Obj         props   Object Properties
 * @param   Func        cb      Completion Callback
 */
Model.Create = function(that, props, cb) {
    var obj = new that(props);
    obj.save(cb);
}

// --
// Private Helpers
// --

/**
 * Converts the 'select' portion of a filter to the appropriate
 * SQL.
 *
 * @param   Obj         props   Array of desired fields
 */
Model._select = function(props) {
    var result = '';
    if (props) {
        result = props.join(",");
    } else {
        result = '*';
    }
    return result;
}

/**
 * Converts the 'where' portion of a filter to the appropriate
 * SQL.
 *
 * @param   Obj         pairs   Pairs of search properties
 */
Model._where = function(options) {
    var result = '';
    var mode = ' AND ';

    if (options instanceof Array) {
        // --
        // When options is an Array, treat as raw query chunks.
        // --
        options.forEach(function(section) {
            result += result + mode;
        });

        // Chop the last AND/OR
        result = result.substr(0, result.length - mode.length);
    } else if (options instanceof Object) {
        // --
        // When options is an Object, handle its directives.
        // --
        for (var i in options) {
            if (options[i] instanceof Array) {
                // --
                // Arrays are transformed into: <field> IN [<array vals>]
                // --
                result += '(' + i.toString() + ' IN [';
                for (var j in options[i]) {
                    result += Mynews.escape(options[i][j]) + ",";
                }
                result = result.substr(0, result.length - 1);
                result += '])' + mode;
            } else if (options[i] instanceof Object) {
                // --
                // Objects are transformed into more advanced queries
                // --
                result += '(';
                for (var j in options[i]) {
                    switch(j) {
                        // -- Greater then --
                        case 'gt':
                            result += i + " > " + options[i][j];
                            break;

                        // -- Greater then or equal --
                        case 'gte':
                            result += i + " >= " + options[i][j];
                            break;

                        // -- Less then --
                        case 'lt':
                            result += i + " < " + options[i][j];
                            break;

                        // -- Less then or equal --
                        case 'lte':
                            result += i + " <= " + options[i][j];
                            break;

                        // -- Not equal --
                        case 'ne':
                            result += i + " <> " + options[i][j];
                            break;

                        // -- Between values --
                        case 'between':
                            result += i + " >= " + options[i][j][0] + " AND " + i + " <= " + options[i][j][1];
                            break;

                        // -- Not between values --
                        case 'notbetween':
                            result += i + " < " + options[i][j][0] + " AND " + i + " > " + options[i][j][1];
                            break;
                    }
                    result = result + mode;
                }
                result = result.substr(0, result.length - mode.length);
                result += ')' + mode;
            } else {
                // --
                // Any remaining type is a normal 'equals'
                // --
                result += i.toString() + "='" + Mynews.escape(options[i]) + "'" + mode;
            }
        }
        result = result.substr(0, result.length - mode.length);
    } else if (typeof options === 'string') {
        // --
        // When options is a String, use it as a raw query.
        // --
        result = options;
    }

    return result;
}

/**
 *
 */
Model._class = function(that) {
    return that['@class'];
}

// --
// Data Types
// --

Model.Type = {
    RID:        function() { return { type: 'rid' }; },
    STRING:     function(required, min, max) { return { required: required, type: 'string', min: min, max: max }; },
    EMAIL:      function(required) { return { required: required, type: 'email' }; },
    SHORT:      function(required) { return { required: required, type: 'short' }; },
    LONG:       function(required) { return { required: required, type: 'long' }; },
    DECIMAL:    function(required) { return { required: required, type: 'decimal' }; },
    BOOLEAN:    function(required) { return { required: required, type: 'boolean' }; },
    URL:        function(required) { return { required: required, type: 'url'}; },
    ENUM:       function(required, options) { return { required: required, type: 'enum', options: options }; }
}

module.exports = Model;