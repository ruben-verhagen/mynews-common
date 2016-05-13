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

var JournalistBackground = function(data) {
    this._load(data);
}

// Inherit from Model
JournalistBackground.prototype.__proto__ = Model.prototype;

JournalistBackground.prototype['@class'] = JournalistBackground['@class'] = 'JournalistBackground';

JournalistBackground.prototype.properties = {
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
JournalistBackground.Find = function(filter, cb) {
    Model.Find(this, filter, cb);
},

/**
 * Create a single user
 *
 * @param   Obj         props   Object Properties
 * @param   Func        cb      Completion Callback
 */
JournalistBackground.Create = function(props, journalist_id, cb) {
    var that = this;
    var counter = 0;
    var bgdata = [];
    if (props instanceof Array && props.length > 0 ){
        Async.forEachSeries(props, function (prop, callback) {
            Model.Create(that, prop, function(e, data) {
                if (data) {
                    bgdata.push(data);
                    counter++;

                    Mynews.odb
                        .edge
                        .from(data["@rid"])
                        .to(journalist_id)
                        .create('JournalistLinkBackground')
                        .then(function(cdata) {
                            try {
                                cdata[0]['@rid'] = Mynews.RID.Build( cdata[0]['@rid'] );
                                cdata[0].in = Mynews.RID.Build( cdata[0].in );
                                cdata[0].out = Mynews.RID.Build( cdata[0].out );

                                if (cdata[0].out != data['@rid']) {
                                    callback(new Error('Invalid data returned when retrieving journalist background'), false);
                                } else {
                                    callback();
                                }
                            }
                            catch(e) {
                                console.log(e);
                            }
                        })
                        .catch(callback);
                }
            });
        }, function(err) {
            if (err) {
                cb(err, null);
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
                Mynews.odb
                    .edge
                    .from(data["@rid"])
                    .to(journalist_id)
                    .create('JournalistLinkBackground')
                    .then(function(cdata) {
                        cdata[0]['@rid'] = Mynews.RID.Build( cdata[0]['@rid'] );
                        cdata[0].in = Mynews.RID.Build( cdata[0].in );
                        cdata[0].out = Mynews.RID.Build( cdata[0].out );

                        if (cdata[0].out != data['@rid']) {
                            cb(new Error('Invalid data returned when retrieving profile background'), false);
                        } else {
                            cb(false, data);
                        }
                    })
                    .catch(cb);
            }
        });
    }
}


module.exports = JournalistBackground;