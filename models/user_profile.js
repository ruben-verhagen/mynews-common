// ----------------
//   Dependencies
// ----------------

var Model           = require('./model');
var Mynews           = require('../database/database');
var crypto          = require('crypto');
var util            = require('util');
var Async           = require('async');

// ----------------
//   Definition
// ----------------

var UserProfile = function(data) {
    this._load(data);
}

// Inherit from Model
UserProfile.prototype.__proto__ = Model.prototype;

UserProfile.prototype['@class'] = UserProfile['@class'] = 'UserProfile';

UserProfile.prototype.properties = {
    "@rid"              : Model.Type.RID(),
    "street1"           : Model.Type.STRING(false, 0, 100),
    "street2"           : Model.Type.STRING(false, 0, 100),
    "city"              : Model.Type.STRING(false, 0, 100),
    "state"             : Model.Type.STRING(false, 0, 50),
    "country"           : Model.Type.STRING(false, 0, 50),
    "zip"               : Model.Type.STRING(false, 0, 10),
    "website_url"       : Model.Type.URL(false),
    "phone_home"        : Model.Type.STRING(false, 0, 15),
    "phone_mobile"      : Model.Type.STRING(false, 0, 15),
    "about_me"          : Model.Type.STRING(false, 0, 1024),
    "modification_date" : Model.Type.LONG(false),
    "creation_date"     : Model.Type.LONG(false)
}

// --
// Instance Methods
// --

/**
 * Save a UserProfile in database. Also update UserBackground
 *
 * @param   Func    cb    Completion Callback
 */
UserProfile.prototype.save = function(cb) {
    var backgrounds = this.userBackground;
    var bgdata      = [];
    var that        = this;
    var original_index = {};
    var operations = [];

    Mynews.odb
        .select("expand(in('UserLinkBackground'))")
        .from('UserProfile')
        .where({ '@rid': this['@rid'] })
        .all()
        .then(function(original_bgs) {
            for (var i in original_bgs) {
                original_bgs[i]['@rid'] = Mynews.RID.Build( original_bgs[i]['@rid'] );
                original_index[ original_bgs[i]['@rid'] ] = original_bgs[i];
            }

            for (var i in backgrounds) {
                // Does this entry exist?
                if (backgrounds[i]['@rid'] && original_index[ backgrounds[i]['@rid'] ]) {
                    var bg = original_index[ backgrounds[i]['@rid'] ];

                    // Update Entry
                    if (typeof backgrounds[i].organization != 'undefined') {
                        bg.organization = backgrounds[i].organization;
                    }
                    if (typeof backgrounds[i].title != 'undefined') {
                        bg.title = backgrounds[i].title;
                    }
                    if (typeof backgrounds[i].year_start != 'undefined') {
                        bg.year_start = backgrounds[i].year_start;
                    }
                    if (typeof backgrounds[i].year_end != 'undefined') {
                        bg.year_end = backgrounds[i].year_end;
                    }
                    if (typeof backgrounds[i].description != 'undefined') {
                        bg.description = backgrounds[i].description;
                    }

                    bg.keep = true;

                    operations.push({
                        type: 'update',
                        obj: new UserBackground(bg)
                    });

                } else {
                    var props = backgrounds[i];

                    // New Entry
                    operations.push({
                        type: 'create',
                        obj: props
                    });
                }
            }

            // Compile a list to delete
            for (var i in original_index) {
                if (!original_index[i].keep) {
                    operations.push({
                        type: 'delete',
                        obj: new UserBackground(original_index[i])
                    })
                }
            }

            Async.forEachSeries(operations, function(params, done) {
                switch (params.type) {
                    case 'delete':
                        params.obj.delete(done);
                        break;

                    case 'create':
                        UserBackground.Create(params.obj, that['@rid'], done);
                        break;

                    case 'update':
                        params.obj.save(done)
                        break;
                }
            }, function(e, results) {
                if (e) {
                    console.log('UserProfile.save finished error', e);
                    console.log(e, results.length, results);
                    return callback(e, null);
                }

                // Refresh UserBackgrounds
                Mynews.odb
                    .select("expand(in('UserLinkBackground'))")
                    .from('UserProfile')
                    .where({ '@rid': this['@rid'] })
                    .all()
                    .then(function(bgs) {
                        for (var i in bgs) {
                            bgs[i]['@rid'] = Mynews.RID.Build( bgs[i]['@rid'] );
                            bgs[i] = new UserBackground(bgs[i]);
                        }

                        if (!that['@rid']) {
                            that._insert(function(e, obj) {
                                obj.userBackground = bgs;
                                cb(e, obj);
                            });
                        } else {
                            that._update(function(e, obj) {
                                obj.userBackground = bgs;
                                cb(e, obj);
                            });
                        }
                    })
                    .catch(function(e) {
                        console.log('UserProfile CATCH', e);
                        cb(e);
                    });
            });
        })
        .catch(function(e) {
            console.log('UserProfile TOP CATCH', e);
            cb(e);
        });
},

/**
 * Deleta a UserProfile. Also delete associated UserBackgrounds
 *
 * @param    function    cb      Completion callback
 */
UserProfile.prototype.delete = function(cb) {
    var that = this;
    var userBackgrounds = that.userBackground;

    Async.series([
        function(callback) {
            Async.forEachSeries(userBackgrounds, function(userBackground, callbackground) {
                UserBackground.Find({ where: { '@rid': userBackground["@rid"] }}, function(e, userBg) {
                    if (userBg) {
                        Mynews.odb
                            .edge
                            .from(userBg['@rid'])
                            .to(that['@rid'])
                            .delete()
                            .then(function(data) {
                                callbackground(null, true);
                            })
                            .catch(callbackground);
                    } else {
                        callbackground(new Error("Error Deleting User Background"));
                    }
                });
            }, callback);
        },
        function(callback) {
            Mynews.odb
                .vertex
                .delete(that['@rid'])
                .then(function() {
                    callback(null)
                })
                .catch(callback);
        }
    ], cb);
}

// --
// Private Instance Methods
// --

// ~~

// --
// Public Helpers
// --

/**
 * Find a single UserProfile
 *
 * @param   obj         filters Filters Object
 * @param   Func        cb      Completion Callback
 */
UserProfile.Find = function(filter, cb) {
    Model.Find(this, filter, function(e, profile) {
        if (e) {
            return cb(e, null);
        }
        if (profile) {
             Mynews.odb
                 .select("expand(in('UserLinkBackground'))")
                 .from('UserProfile')
                 .where({ '@rid': profile['@rid'] })
                 .all()
                 .then(function(data) {
                     for (var i in data) {
                         data[i]['@rid'] = Mynews.RID.Build(data[i]['@rid']);
                     }

                     profile.userBackground = data;

                     cb(null, profile);
                 })
                 .catch(cb);

        } else {
            cb( null, profile);
        }
    });
},

/**
 * Create a single user
 *
 * @param   Obj         props   Object Properties
 * @param   Func        cb      Completion Callback
 */
UserProfile.Create = function(props, user_id, cb) {
    Model.Create(this, props, function(e, data) {
        if (e) {
            return cb(e, null);
        }
        if (data) {
            Mynews.odb
                .edge
                .from(user_id)
                .to(data['@rid'])
                .create('UserHasProfile')
                .then(function(cdata) {
                    if (props.userBackground) {
                        UserBackground.Create(props.userBackground, data['@rid'], function(e, edata) {
                            if (e) {
                                cb(e, null);
                            } else {
                                data.userBackground = edata;
                                cb(null, data);
                            }
                        });
                    } else {
                        cb(null, data);
                    }
                })
                .catch(cb);

        } else {
            cb(new Error('UserProfile.Create returned no object'), false);
        }
    });
},

module.exports = UserProfile;

// -------------------------
//   Circular Dependencies
// -------------------------

/**
 * Why are these dependancies down here?
 *   Answer: Fixes a Node.js Circular dependancy problem
 */

// Models
var UserBackground  = require('./user_background');