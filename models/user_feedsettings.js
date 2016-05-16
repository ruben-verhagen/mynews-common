// ----------------
//   Dependencies
// ----------------

var Model               = require('./model');
var Mynews               = require('../database/database');
var Async               = require('async');

// ----------------
//   Definition
// ----------------

var UserFeedSettings = function(data) {
    this._load(data);
}

// Inherit from Model
UserFeedSettings.prototype.__proto__ = Model.prototype;

UserFeedSettings.prototype['@class'] = UserFeedSettings['@class'] = 'UserFeedSettings';

UserFeedSettings.prototype.properties = {
    "@rid":                         Model.Type.RID(),
    "article_filter":               Model.Type.SHORT(true),
    "track_public_ratings":         Model.Type.SHORT(true),
    "avg_article_rating":           Model.Type.SHORT(false),
    "importance_rating":            Model.Type.SHORT(false),
    "factuality_rating":            Model.Type.SHORT(false),
    "transparency_rating":          Model.Type.SHORT(false),
    "independence_rating":          Model.Type.SHORT(false),
     "creation_date":               Model.Type.LONG(false),
    "modification_date":            Model.Type.LONG(false)
}

/**
 * Assign tag to UserFeedSettings
 *
 * @param   Tag         tag_id      ID of Tag to assign user to
 * @param   Func        cb          Completion Callback
 */
UserFeedSettings.prototype.assign_tag = function(tag_id, cb) { 
    Mynews.odb
        .edge
        .from(this['@rid'])
        .to(tag_id)
        .create('UserFeedSettingsHasTag')
        .then(function(data) {
            cb(null, true);
        })
        .catch(cb);
}

/**
 * Get all the tags for a UserFeedSettings
 *
 * @param   Func        cb      Completion Callback
 */
UserFeedSettings.prototype.get_tags = function(cb) {
    var that = this;

    Mynews.odb
        .select("expand(out('UserFeedSettingsHasTag'))")
        .from(this['@rid'])
        .all()
        .then(function(data) {
            if (data) {
                var tags = [];
                for (var i in data) {
                    data[i]['@rid'] = Mynews.RID.Build(data[i]['@rid']);
                    tags.push(new Tag(data[i]));
                }

                cb(null, tags);
            } else {
                cb(null, []);
            }

        })
        .catch(cb);
}

/**
 * Remove tag from UserFeedSettings
 *
 * @param   Tag         tag_id     Id of Tag to remove from userfeedsettings
 * @param   Func        cb         Completion Callback
 */
UserFeedSettings.prototype.remove_tag = function(tag_id, cb) {
    Mynews.odb
        .edge
        .from(this['@rid'])
        .to(tag_id)
        .delete()
        .then(function(data) {
            cb(null, true);
        })
        .catch(cb);
}

/**
 * Assign publisher to UserFeedSettings
 *
 * @param   Publisher   publisher_id    Id of Publisher to assign with the user
 * @param   Func        cb              Completion Callback
 */
UserFeedSettings.prototype.assign_publisher = function(publisher_id, cb) { 
    Mynews.odb
        .edge
        .from(this['@rid'])
        .to(publisher_id)
        .create('UserFeedSettingsHasPublisher')
        .then(function(data) {
            cb(null, true);
        })
        .catch(cb);
}

/**
 * Get all the followed publishers for a UserFeedSettings
 *
 * @param   Func        cb          Completion Callback
 */
UserFeedSettings.prototype.get_publishers = function(cb) {
    var that = this;

    Mynews.odb
        .select("expand(out('UserFeedSettingsHasPublisher'))")
        .from(this['@rid'])
        .all()
        .then(function(data) {
            if (data) {
                var publishers = [];
                for (var i in data) {
                    data[i]['@rid'] = Mynews.RID.Build(data[i]['@rid']);
                    publishers.push(new Publisher(data[i]));
                }

                cb(null, publishers);
            } else {
                cb(null, []);
            }
        })
        .catch(cb);
}

/**
 * Remove publisher from UserFeedSettings
 *
 * @param   Publisher   publisher_id    Id of Publisher to assign user to
 * @param   Func        cb              Completion Callback
 */
UserFeedSettings.prototype.remove_publisher = function(publisher_id, cb) {
    Mynews.odb
        .edge
        .from(this['@rid'])
        .to(publisher_id)
        .delete()
        .then(function(data) {
            cb(null, true);
        })
        .catch(cb);
}

/**
 * Assign journalist to UserFeedSettings
 *
 * @param   Journalist   journalist_id    Id of Journalist to remove
 * @param   Func         cb               Completion Callback
 */
UserFeedSettings.prototype.assign_journalist = function(journalist_id, cb) {
    Mynews.odb
        .edge
        .from(this['@rid'])
        .to(journalist_id)
        .create('UserFeedSettingsHasJournalist')
        .then(function(data) {
            cb(null, true);
        })
        .catch(cb);
}

/**
 * Get all the followed journalists for a UserFeedSettings
 *
 * @param   Func         cb           Completion Callback
 */
UserFeedSettings.prototype.get_journalists = function(cb) {
    var that = this;

    Mynews.odb
        .select("expand(out('UserFeedSettingsHasJournalist'))")
        .from(this['@rid'])
        .all()
        .then(function(data) {
            if (data) {
                var journalists = [];
                for (var i in data) {
                    data[i]['@rid'] = Mynews.RID.Build(data[i]['@rid']);
                    journalists.push(new Journalist(data[i]));
                }

                cb(null, journalists);
            } else {
                cb(null, []);
            }
        })
        .catch(cb);
}

/**
 * Remove journalist from UserFeedSettings
 *
 * @param   Journalist   journalist_id      Id of journalist to delete
 * @param   Func        cb                  Completion Callback
 */
UserFeedSettings.prototype.remove_journalist = function(journalist_id, cb) {
    Mynews.odb
        .edge
        .from(this['@rid'])
        .to(journalist_id)
        .delete()
        .then(function(data) {
            cb(null, true);
        })
        .catch(cb);
}

/**
 * Assign friend to UserFeedSettings
 *
 * @param   Friend      friend_id    Id of Friend to add for the user
 * @param   Func        cb           Completion Callback
 */
UserFeedSettings.prototype.assign_friend = function(friend_id, cb) {
    Mynews.odb
        .edge
        .from(this['@rid'])
        .to(friend_id)
        .create('UserFeedSettingsHasFriend')
        .then(function(data) {
            cb(null, true);
        })
        .catch(cb);
}

/**
 * Get all the followed friends for a UserFeedSettings
 *
 * @param   Func         cb           Completion Callback
 */
UserFeedSettings.prototype.get_friends = function(cb) {
    var that = this;

    Mynews.odb
        .select("expand(out('UserFeedSettingsHasFriend'))")
        .from(this['@rid'])
        .all()
        .then(function(data) {
            if (data) {
                var friends = [];
                for (var i in data) {
                    data[i]['@rid'] = Mynews.RID.Build(data[i]['@rid']);
                    friends.push(new User(data[i]));
                }

                cb(null, friends);
            } else {
                cb(null, []);
            }
        })
        .catch(cb);
}

/**
 * Remove friend from UserFeedSettings
 *
 * @param   Friend      friend_id    Id of Friend to remove for the user
 * @param   Func        cb           Completion Callback
 */
UserFeedSettings.prototype.remove_friend = function(friend_id, cb) {
    Mynews.odb
        .edge
        .from(this['@rid'])
        .to(friend_id)
        .delete()
        .then(function(data) {
            cb(null, true);
        })
        .catch(cb);
}

/**
 * Assign group to UserFeedSettings
 *
 * @param   Group       group_id     Id of Group to add for the user
 * @param   Func        cb           Completion Callback
 */
UserFeedSettings.prototype.assign_group = function(group_id, cb) {
    Mynews.odb
        .edge
        .from(this['@rid'])
        .to(group_id)
        .create('UserFeedSettingsHasGroup')
        .then(function(data) {
            cb(null, true);
        })
        .catch(cb);
}

/**
 * Get all the followed friends for a UserFeedSettings
 *
 * @param   Func         cb           Completion Callback
 */
UserFeedSettings.prototype.get_groups = function(cb) {
    var that = this;

    Mynews.odb
        .select("expand(out('UserFeedSettingsHasGroup'))")
        .from(this['@rid'])
        .all()
        .then(function(data) {
            if (data) {
                var groups = [];
                for (var i in data) {
                    data[i]['@rid'] = Mynews.RID.Build(data[i]['@rid']);
                    groups.push(new Group(data[i]));
                }

                cb(null, groups);
            } else {
                cb(null, []);
            }
        })
        .catch(cb);
}

/**
 * Delete group from UserFeedSettings
 *
 * @param   Group       group_id     Id of Group to remove for the user
 * @param   Func        cb           Completion Callback
 */
UserFeedSettings.prototype.remove_group = function(group_id, cb) {
    Mynews.odb
        .edge
        .from(this['@rid'])
        .to(group_id)
        .delete()
        .then(function(data) {
            cb(null, true);
        })
        .catch(cb);
}

/**
 * Find a single UserFeedSettings
 *
 *
 * @param   obj         filters Filters Object
 * @param   Func        cb      Completion Callback
 */
UserFeedSettings.Find = function(filter, cb) {
    Model.Find(this, filter, function(e, settings) {
        Async.parallel({
            tags: function(done) {
                settings.get_tags(done);
            },
            groups: function(done) {
                settings.get_groups(done);
            },
            publishers: function(done) {
                settings.get_publishers(done);
            },
            friends: function(done) {
                settings.get_friends(done);
            },
            journalists: function(done) {
                settings.get_journalists(done);
            }
        }, function(errors, results) {
            if (errors) {
                return cb(errors, null);
            } else {
                settings.tags = results.tags;
                settings.groups = results.groups;
                settings.publishers = results.publishers;
                settings.journalists = results.journalists;
                settings.friends = results.friends;

                cb(null, settings);
            }
        });
    });
}

/**
 * Find within all UserFeedSettingss
 *
 * @param   Obj         filters     Finder Filters
 * @param   Func        cb          Completion Callback
 */
UserFeedSettings.FindAll = function(filters, cb) {
    Model.FindAll(this, filters, cb);
}

/**
 * Create a single UserFeedSettings
 *
 * @param   Obj         props   Object Properties
 * @param   Func        cb      Completion Callback
 */
UserFeedSettings.Create = function(props, cb) {
    Model.Create(this, props, cb);
}

module.exports = UserFeedSettings;

// -------------------------
//   Circular Dependencies
// -------------------------

/**
 * Why are these dependancies down here?
 *   Answer: Fixes a Node.js Circular dependancy problem
 */

// Models
var Group               = require('./group');
var Publisher           = require('./publisher');
var Journalist          = require('./journalist');
var Tag                 = require('./tag');
var User                = require('./user');