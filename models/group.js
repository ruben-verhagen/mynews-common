// ----------------
//   Dependencies
// ----------------

var Model       = require('./model');
var Mynews       = require('../database/database');
var Async       = require('async');
var _           = require('underscore');
// ----------------
//   Definition
// ----------------

var Group = function(data) {
    this._load(data);
}

// Inherit from Model
Group.prototype.__proto__ = Model.prototype;

Group.prototype['@class'] = Group['@class'] = 'Group';

Group.prototype.properties = {
    "@rid":                     Model.Type.RID(),
    "name":                     Model.Type.STRING(true, 0, 64),
    "description":              Model.Type.STRING(false, 0, 1024),
    "imageUrl":                 Model.Type.URL(false),
    "type":                     Model.Type.SHORT(true),
    "url":                      Model.Type.URL(false),
    "creation_date":            Model.Type.LONG(false),
    "modification_date":        Model.Type.LONG(false),
    "status":                   Model.Type.SHORT(true),
    "slug":                     Model.Type.STRING(false, 0, 512),
    "contact_email":            Model.Type.EMAIL(false),
    "contact_url":              Model.Type.URL(false),
    "contact_twitter":          Model.Type.URL(false),
    "contact_fb":               Model.Type.URL(false),
    "contact_linkedin":         Model.Type.URL(false)
},

// --
// Instance Methods
// --

/**
 * Add User to this Group
 *
 * @param   User        member_id    Id of Member to add
 * @param   Func        cb           Completion Callback
 */
Group.prototype.add_member = function(member_id, cb) {
    Mynews.odb
        .edge
        .from(member_id)
        .to(this['@rid'])
        .create('UserInGroup')
        .then(function(data) {
            cb(null, true);
        })
        .catch(cb);
},

/**
 * Get members of this Group
 *
 * @param   Func    cb      Completion Callback
 */
Group.prototype.get_members = function(cb) {
    Mynews.odb
        .select("expand(in('UserInGroup'))")
        .from(this['@rid'])
        .all()
        .then(function(users) {
            var results = [];

            for (var i in users) {
                users[i]['@rid'] = Mynews.RID.Build(users[i]['@rid']);
                var user = new User(users[i]);
                delete user.password;
                delete user.permissions;
                results.push(user);
            }

            cb(null, results);
        })
        .catch(cb);
},

/**
 * Get member count of this Group
 *
 * @param   Func    cb      Completion Callback
 */
Group.prototype.get_members_count = function(cb) {
    Mynews.odb
        .select("in('UserInGroup').size()")
        .from(this['@rid'])
        .scalar()
        .then(function(count) {
            cb(null, count);
        })
        .catch(function(e) {
            console.log(e);
            cb(e);
        });
},

/**
 * Get follower count of this Group
 *
 * @param   Func    cb      Completion Callback
 */
Group.prototype.get_followers_count = function(cb) {
    Mynews.odb
        .select("in('UserFeedSettingsHasGroup').size()")
        .from(this['@rid'])
        .scalar()
        .then(function(count) {
            cb(null, count);
        })
        .catch(function(e) {
            console.log(e);
            cb(e);
        });
},

/**
 * Remove member from this Group
 *
 * @param   User        member_id    Id of Member to remove
 * @param   Func        cb           Completion Callback
 */
Group.prototype.remove_member = function(member_id, cb) {
    Mynews.odb
        .edge
        .from(member_id)
        .to(this['@rid'])
        .delete()
        .then(function(done) {
            cb(null, true);
        })
        .catch(function(e) {
            cb(e);
        });
},

/**
 * Add moderator to this Group
 *
 * @param   User        member_id    Id of Member to add
 * @param   Func        cb           Completion Callback
 */
Group.prototype.add_moderator = function(member_id, cb) {
    Mynews.odb
        .update('UserInGroup')
        .set({ moderator: 1 })
        .where({ 'in': this['@rid'], out: member_id })
        .scalar()
        .then(function(done) {
            cb(null, true);
        })
        .catch(function(e) {
            cb(e);
        })
},

/**
 * Get moderators  of this Group
 *
 * @param   Func    cb      Completion Callback
 */
Group.prototype.get_moderators = function(cb) {
    Mynews.odb
        .select()
        .from('User')
        .where({
            'out_UserInGroup.in': this['@rid'],
            'out_UserInGroup.moderator': 1
        })
        .all()
        .then(function(mods) {
            var moderators = [];

            for (var i in mods) {
                mods[i]['@rid'] = Mynews.RID.Build(mods[i]['@rid']);
                var user = new User(mods[i]);

                delete user.password;
                delete user.permissions;

                moderators.push( user );
            }

            cb(null, moderators);
        })
        .catch(function(e) {
            console.log(e);
            cb(e);
        });

},

/**
 * Remove mod from this Group
 *
 * @param   User        moderator_id    Id of moderator to remove
 * @param   Func        cb              Completion Callback
 */
Group.prototype.remove_moderator = function(moderator_id, cb) {
    Mynews.odb.query(
        'UPDATE UserInGroup SET moderator = 0 WHERE out = '
        + moderator_id +' AND in = ' + this['@rid']
    )
        .then(function(data) {
            cb(null, true);
        })
        .catch(function(e) {
            console.log(e);
            cb(e);
        });
},

/**
 * Get the slug base value
 *
 * @returns String   string that will be used as base value for generating slug
 */
Group.prototype._get_slug_base_string = function() {
    return this['name'];
},

/**
 * get recently rated
 *
 * @param   Func        cb      Completion Callback
 */
Group.prototype.get_recently_rated = function(cb) {
    Mynews.odb.query(
        "SELECT FROM ( SELECT expand(in('UserInGroup').out('UserRateArticle')) "
        + "FROM Group WHERE @rid = " + this["@rid"] + " ORDER BY in.out.creation_date DESC) GROUP BY title LIMIT 50"
    )
        .then(function(data) {
            console.log('review data>>>>',data);
            cb(null, data);
        })
        .catch(function(e) {
            console.log(e);
            cb(e);
        });

},

/**
 * Find a single Group
 *
 * @param   obj         filters     Filters Object
 * @param   Func        cb          Completion Callback
 */
Group.Find = function(filter, cb) {
    Model.Find(this, filter, function(e, group) {
        if (!group) {
            return cb(null, false);
        }
        Async.parallel({
            member_count: function(done) {
                group.get_members_count(done);
            },
            follow_count: function(done) {
                group.get_followers_count(done);
            },
            moderators: function(done) {
        	group.get_moderators(done);
    	    },
        }, function(err, results) {
            if (err) {
                return cb(err);
            }

            group.follow_count = results.follow_count;
            group.member_count = results.member_count;
            group.moderators = results.moderators;
            
            cb(false, group);
        });
    });
},

/**
 * Find groups
 *
 * @param   Obj         filters     Finder Filters
 * @param   Func        cb          Completion Callback
 */
Group.FindAll = function(filters, cb) {
    Model.FindAll(this, filters, cb);
},

/**
 * Create a single group
 *
 * @param   Obj         props   Object Properties
 * @param   Func        cb      Completion Callback
 */
Group.Create = function(props, cb) {  
    Model.Create(this, props, cb);
}


module.exports = Group;

// -------------------------
//   Circular Dependencies
// -------------------------

/**
 * Why are these dependancies down here?
 *   Answer: Fixes a Node.js Circular dependancy problem
 */

// Models
var User                = require('./user');