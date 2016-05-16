// ----------------
//   Dependencies
// ----------------

var Model       = require('./model');
var Mynews       = require('../database/database');
var Crypto      = require('crypto');
var Async       = require('async');

// ----------------
//   Definition
// ----------------

var UserBackground = function(data) {
    this._load(data);
}

// Inherit from Model
UserBackground.prototype.__proto__ = Model.prototype;

UserBackground.prototype['@class'] = UserBackground['@class'] = 'UserBackground';

UserBackground.prototype.properties = {
    "@rid"              : Model.Type.RID(),
    "organization"      : Model.Type.STRING(false, 0, 100),
    "title"             : Model.Type.STRING(false, 0, 100),
    "year_start"        : Model.Type.STRING(false, 0, 10),
    "year_end"          : Model.Type.STRING(false, 0, 10),
    "description"       : Model.Type.STRING(false, 0, 512),
    "creation_date"     : Model.Type.LONG(false),
    "modification_date" : Model.Type.LONG(false)
}

// --
// Public Helpers
// --

/**
 * Find a single user
 *
 * @param   obj         filters Filters Object
 * @param   Func        cb      Completion Callback
 */
UserBackground.Find = function(filter, cb) {
    Model.Find(this, filter, cb);
},

/**
 * Find all matching Users
 *
 * @param   Obj         filters     Finder Filters
 * @param   Func        cb          Completion Callback
 */
UserBackground.FindAll = function(filters, cb)  {
    Model.FindAll(this, filters, cb);
},

/**
 * Create a single user
 *
 * @param   Obj         props   Object Properties
 * @param   Func        cb      Completion Callback
 */
UserBackground.Create = function(props, userprofile_id, cb) {
    var that = this;
    var counter = 0;
    var bgdata = [];

    if (props && props instanceof Array && props.length > 0 ) {
        Async.forEachSeries(props, function (prop, callback) {
            Model.Create(that, prop, function(e, data) {
                if (e) {
                    return callback(e, null);
                }
                if (data) {
                    bgdata.push(data);
                    counter++;

                    Mynews.odb.edge
                        .from(data["@rid"])
                        .to(userprofile_id)
                        .create('UserLinkBackground')
                        .then(function(edge) {
                            callback();
                        })
                        .catch(function(error) {
                            console.log(error, error, error, error, error);
                            callback(error);
                        });
                }
            });
        }, function(err) {
            if (err) {
                cb(err, false);
            } else {
                cb(false, bgdata);
            }
        });

    } else {
        Model.Create(that, props, function(e, data) {
            if (e) {
                return cb(e, null);
            }
            if (data) {
                Mynews.odb.edge
                    .from(data["@rid"])
                    .to(userprofile_id)
                    .create('UserLinkBackground')
                    .then(function(edge) {
                        cb(null, edge);
                    })
                    .catch(function(error) {
                        console.log(error);
                        cb(error);
                    });
            } else {
                cb(new Error('UserBackground.Create returned no object'), false);
            }
        });
    }
}


module.exports = UserBackground;