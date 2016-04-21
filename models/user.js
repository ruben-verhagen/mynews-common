// ----------------
//   Dependencies
// ----------------

var Model               = require('./model');
var Mynews               = require('../database/database');
var crypto              = require('crypto');
var Slug                = require('slug');
var Async               = require('async');

// ----------------
//   Definition
// ----------------

var User = function(data) {

    this._load(data);

    if (!this.permissions) {
        this.permissions = {};
    }

}

// Inherit from Model
User.prototype.__proto__ = Model.prototype;

User.prototype['@class'] = User['@class'] = 'User';

User.prototype.properties = {
    "@rid":                     Model.Type.RID(),
    "password":                 Model.Type.STRING(true,0,64),
    "handle":                   Model.Type.STRING(false,0,64),
    "first_name":               Model.Type.STRING(true,0,64),
    "last_name":                Model.Type.STRING(true,0,64),
    "imageUrl":                 Model.Type.URL(false),
    "email":                    Model.Type.EMAIL(true),
    "last_login":               Model.Type.LONG(false),
    "creation_date":            Model.Type.LONG(false),
    "modification_date":        Model.Type.LONG(false),
    "status":                   Model.Type.SHORT(true)
}

// --
// Instance Methods
// --

/**
 * Assign a role to the user
 *
 * @param   Role        role    Role to assign
 * @param   Func        cb      Completion Callback
 */
User.prototype.assign_role = function(role, cb) {
    Mynews.odb
        .edge
        .from(this['@rid'])
        .to(role['@rid'])
        .create('UserHasRoles')
        .then(function(data) {
            cb(null, data[0]);
        })
        .catch(cb);
},

/**
 *  Fetch profile of the current user
 *
 *  @param  User    user    User object
 *  @param  Func    cb      Callback
 */
User.prototype.fetch_profile = function(cb) {
    var that = this;

    Mynews.odb
        .select()
        .from(this['@rid'])
        .all()
        .then(function(udata) {
            udata[0]['@rid'] = Mynews.RID.Build(udata[0]['@rid']);

            if (typeof udata[0].out_UserHasProfile != 'undefined') {
                udata[0].out_UserHasProfile = Mynews.RID.Build(udata[0].out_UserHasProfile);
            }
            if (typeof udata[0].in_UserHasFeedSettings != 'undefined') {
                udata[0].in_UserHasFeedSettings = Mynews.RID.Build(udata[0].in_UserHasFeedSettings);
            }
            if (typeof udata[0].in_UserFriendUser != 'undefined') {
                udata[0].in_UserFriendUser = Mynews.RID.Build(udata[0].in_UserFriendUser);
            }
            if (typeof udata[0].in_UserFollow != 'undefined') {
                udata[0].in_UserFollow = Mynews.RID.Build(udata[0].in_UserFollow);
            }
            if (typeof udata[0].out_UserFollow != 'undefined') {
                udata[0].out_UserFollow = Mynews.RID.Build(udata[0].out_UserFollow);
            }
            if (typeof udata[0].in_UserFeedSettingsHasFriend != 'undefined') {
                udata[0].in_UserFeedSettingsHasFriend = Mynews.RID.Build(udata[0].in_UserFeedSettingsHasFriend);
            }

            UserProfile.Find({ where: { '@rid': udata[0].out_UserHasProfile }}, function(e, profile) {
                if (profile) {
                    // Followers
                    if (typeof(udata[0].in_UserFollow) == 'object') {
                        profile.followers = udata[0].in_UserFollow.length
                    } else if(typeof udata[0].in_UserFollow == 'undefined') {
                        profile.followers = 0;
                    } else {
                        profile.followers = 1;
                    }

                    // Following
                    if (typeof(udata[0].out_UserFollow) == 'object') {
                        profile.following = udata[0].out_UserFollow.length
                    } else if (typeof udata[0].out_UserFollow == 'undefined') {
                        profile.following = 0;
                    } else {
                        profile.following = 1;
                    }

                    // Friends
                    if (typeof(udata[0].out_UserFriendUser) == 'object') {
                        profile.friends = udata[0].out_UserFriendUser.length
                    } else if (typeof udata[0].out_UserFriendUser == 'undefined') {
                        profile.friends = 0;
                    } else {
                        profile.friends = 1;
                    }
                    
                } else {
                    profile = {};
                }

                profile.user_id = that['@rid'];

                cb(false, profile);
            });
        })
        .catch(cb);
},

/**
 * Assign group to user
 *
 * @param   Group       group   Group to assign user to
 * @param   Func        cb      Completion Callback
 */
User.prototype.assign_group = function(group, cb) {
    Mynews.odb
        .edge
        .from(this['@rid'])
        .to(group['@rid'])
        .create('UserInGroup')
        .then(function(data) {
            cb(null, true);
        })
        .catch(cb);
},

/**
 * Get all the groups for a user
 *
 * @param   Group       group   Group to check
 * @param   Func        cb      Completion Callback
 */
User.prototype.get_groups = function(cb) {
    Mynews.odb
        .select("expand(out('UserInGroup'))")
        .from(this['@rid'])
        .all()
        .then(function(data) {
            var groups = {};

            for (var i in data) {
                data[i]['@rid'] = Mynews.RID.Build(data[i]['@rid']);
                groups.push(new Group(data[i]));
            }

            cb(null, groups);
        })
        .catch(cb);
},

/**
 * Return a count of the number of friends the user has.
 *
 * @param   Func        cb      Completion Callback
 */
User.prototype.get_group_count = function(cb) {
    Mynews.odb
        .select("COUNT(*) AS count")
        .from('UserInGroup')
        .where({ out: this['@rid'] })
        .all()
        .then(function(data) {
            data[0]['@rid'] = Mynews.RID.Build(data[0]['@rid']);
            cb(false, data[0].count);
        })
        .catch(cb);
}

/**
 * Get Comments of this User
 * 
 * @param Func          cb          Completion Callback
 */
User.prototype.get_comments = function(cb) {
    Mynews.odb
        .select("expand(out('UserHasComment'))")
        .from('User')
        .where({ '@rid': this['@rid'] })
        .all()
        .then(function(data) {
            var results = [];

            for (var i in data) {
                data[i]['@rid'] = Mynews.RID.Build(data[i]);
                results.push(new Comment(data[i]));
            }

            cb(null, results);
        })
        .catch(cb);
},

/**
 * Add a friend
 *
 * @param   User        user    User
 * @param   friend_id   user    friend to be added
 * @param   Func        cb      Completion Callback
 */
User.prototype.add_friend = function(friend_id, cb) {
    Mynews.odb
        .edge
        .from(this['@rid'])
        .to(friend_id)
        .create('UserFriendUser')
        .then(function(data) {
            cb(null, true);
        })
        .catch(cb);
},

/**
 * Start following a person. User will follow the person passed as followed
 *
 * @param   User        followed    Person to be followed
 * @param   Func        cb          Completion Callback
 */
User.prototype.follow = function(followed, cb) {
    Mynews.odb
        .edge
        .from(this['@rid'])
        .to(followed['@rid'])
        .create('UserFollow')
        .then(function(data) {
            cb(null, true);
        })
        .catch(cb);
},

/**
 * Remove a friend
 *
 * @param   friend      user    friend to be added
 * @param   Func        cb      Completion Callback
 */
User.prototype.remove_friend =  function(friend, cb) {
    // ToDO
},

/**
 * Check if person is friend
 *
 * @param   Func        cb      Completion Callback
 */
User.prototype.get_friends = function(cb) {
    Mynews.odb
        .select("expand(out('UserFriendUser'))")
        .from('USer')
        .where({ '@rid': this['@rid'] })
        .all()
        .then(function(data) {
            var friends = [];

            for (var i in data) {
                data[i]['@rid'] = Mynews.RID.Build(data[i]['@rid']);
                friends.push(new User(data[i]));
            }

            cb(false, friends);
        })
        .catch(cb);
},

/**
 * Return a count of the number of friends the user has.
 *
 * @param   Func        cb      Completion Callback
 */
User.prototype.get_friend_count = function(cb) {
    Mynews.odb
        .select('COUNT(*) AS count')
        .from('User')
        .where({ 'in_UserFriendUser': this['@rid'] })
        .all()
        .then(function(data) {
            cb(false, data[0].count);
        })
        .catch(cb);
}

/**
 * List people whom user is following
 *
 * @param   Func        cb      Completion Callback
 */
User.prototype.followed_people = function(cb) {
    Mynews.odb
        .select("expand(out('UserFollow'))")
        .from(this['@rid'])
        .all()
        .then(function(data) {
            var followed = [];

            for (var i in data) {
                data[i]['@rid'] = Mynews.RID.Build(data[i]['@rid']);
                followed.push(new User(data[i]));
            }

            cb(false, followed);
        })
        .catch(cb);
},

/**
 * Count of the people the user is following
 *
 * @param   Func        cb      Completion Callback
 */
User.prototype.get_followed_count = function(cb) {
    Mynews.odb
        .select('COUNT(*) AS count')
        .from('User')
        .where({ in_UserFollow: this['@rid'] })
        .all()
        .then(function(data) {
            cb(false, data[0].count);
        })
        .catch(cb);
},

/**
 * List people who are following the user
 *
 * @param   Func        cb      Completion Callback
 */
User.prototype.get_followers = function(cb) {
    Mynews.odb
        .select("expand(in('UserFollow'))")
        .from(this['@rid'])
        .all()
        .then(function(data) {
            var followers = [];

            for (var i in data) {
                data[i]['@rid'] = Mynews.RID.Build(data[i]['@rid']);
                followers.push(new User(data[i]));
            }

            cb(false, followers);
        })
        .catch(cb);
},

/**
 * Get a count of the users following this user
 *
 * @param   Func        cb      Completion Callback
 */
User.prototype.get_follower_count = function(cb) {
    Mynews.odb
        .select('COUNT(*) AS count')
        .from('User')
        .where({ out_UserFollow: this['@rid'] })
        .all()
        .then(function(data) {
            cb(false, data[0].count);
        })
        .catch(cb);
},

/**
 * Get the UserFeedSettings for the user
 *
 * @param   Func        cb      Completion Callback
 */
User.prototype.get_feed_settings = function(cb) {
    var that = this;

    Mynews.odb
        .select("expand(in('UserHasFeedSettings'))")
        .from(this['@rid'])
        .all()
        .then(function(data) {
            if (data && data[0]) {
                data[0]['@rid'] = Mynews.RID.Build(data[0]['@rid']);

                UserFeedSettings.Find({
                    where: { '@rid': data[0]['@rid'] }
                }, cb);
            } else {
                // Creating default feed setiings as there is no way to create userfeedsettings
                UserFeedSettings.Create({
                    track_public_ratings: 0,
                    article_filter: 0,
                    avg_article_rating: 4
                }, function(e, feedSettings) {
                    if (e || !feedSettings) {
                        return cb(e, false);
                    }

                    Mynews.odb
                        .edge
                        .from(feedSettings['@rid'])
                        .to(that['@rid'])
                        .create('UserHasFeedSettings')
                        .then(function(data) {
                            cb(null, feedSettings);
                        })
                        .catch(cb);
                });
            }
        })
        .catch(cb);
},

/**
 * Get Recently Rated Publishers
 *
 *  ?? CURRENTLY UNUSED ??
 *
 * @param   Func        cb      Completion Callback
 */
User.prototype.get_recent_rated_publishers = function(cb) {
    // This code appears to have never been completed or tested
    Mynews.odb
        .select()
        .from()
        .where({ out: this['@rid'] })
        .order(['creation_date'])
        .all()
        .then(function(data) {
            // Really stupid code below, clearly would never
            // work as intended....
            // TODO: fix stupid crap below
            var publishers = {};

            for (var i in data.result){
                Article.Find(data.result['@rid'], function(e, article){
                    publishers.push(new Publisher(article.publisher));
                });
            }

            cb(null, publishers);
        })
        .catch(cb);
},

/**
 * List people whom user is following
 *
 * @param   Func        cb      Completion Callback
 */
User.prototype.get_avg_rating = function(cb) {
    Mynews.odb
        .select('AVG(value) AS count')
        .from('UserRateArticle')
        .where({ out: this['@rid'] })
        .all()
        .then(function(data) {
            if (data.length) {
                cb(null, data[0].count);
            } else {
                cb(null, 0);
            }
        })
        .catch(cb);
},

/**
 * Count of number of articles this user has rated.
 *
 * @param   Func        cb      Completion Callback
 */
User.prototype.get_rated_article_count = function(cb) {
    Mynews.odb
        .select('COUNT(*) AS count')
        .from('UserRateArticle')
        .where({ out: this['@rid'] })
        .all()
        .then(function(data) {
            cb(false, data[0].count);
        })
        .catch(cb);
},

/**
 *
 */
User.prototype.get_recently_rated_by_user = function(cb) {
    var that = this;

    Async.parallel({
        articles: function(done) {
            Mynews.odb.query(
                "SELECT * FROM (" +
                "    SELECT expand(out('UserRateArticle')) FROM User WHERE @rid = :id" +
                ") GROUP BY title ORDER BY creation_date DESC LIMIT 50",
                { params: { id: that['@rid'] }}
            )
                .then(function(data) {
                    var articles = [];

                    for (var i in data) {
                        data[i]['@rid'] = Mynews.RID.Build(data[i]['@rid']);
                        articles.push(new Article(data[i]));
                    }

                    done(false, articles);
                })
                .catch(done);
        },
        ratings: function(done) {
            Mynews.odb
                .select()
                .from('UserRateArticle')
                .where({ out: that['@rid'] })
                .all()
                .then(function(data) {
                    var ratings = [];
                    for (var i in data) {
                        data[i]['@rid'] = Mynews.RID.Build(data[i]['@rid']);
                        ratings.push( data[i] );
                    }
                    done(false, ratings);
                })
                .catch(done);
        }
    }, function(errors, results) {
        if (errors) {
            return cb(errors, []);
        }
        var rating_index = {};
        for (var i in results.ratings) {
            rating_index[ results.ratings[i].in ] = results.ratings[i];
        }

        for (var i in results.articles) {
            results.articles[i].rating = rating_index[ results.articles[i]['@rid'] ].value;
            results.articles[i].rate_date = rating_index[ results.articles[i]['@rid'] ].creation_date;
        }

        cb(null, results.articles);
    });
}

/**
 * Deleta a user. This function will also delete profile of the user
 *
 * @param    function    cb      Completion callback
 */
User.prototype.delete = function(cb) {
    var that = this;
    Async.series({
        profile: function(callback) {
            // Deleting Profile
            that.fetch_profile(function (e, profile) {
                if (e) {
                    return callback(e);
                }
                if (profile) {
                    profile.delete(function (e) {
                        if (e) {
                            callback(e);
                        } else {
                            callback();
                        }
                    });
                } else {
                    // Profile don't exist
                    callback();
                }
            });
        },
        settings: function(callback) {
            // Deleting Feed Settings
            that.get_feed_settings(function (e, feedSettings) {
                if (e) {
                    callback(e);
                } else {
                    feedSettings.delete(function (e) {
                        if (e) {
                            callback(e);
                        } else {
                            callback();
                        }
                    });
                }
            });
        },
        obj: function(callback) {
            Mynews.odb
                .vertex
                .delete(that['@rid'])
                .then(function(data) {
                    callback();

                    /*Resque.enqueue('search:remove', 'worker', [{ type: that['@class'], data: that['@rid'] }], function(err) {
                        cb(null);
                        that._empty();
                    });*/
                })
                .catch(callback);
        }
    }, function(err) {
        if (err) {
            cb(err);
        } else {
            cb(false, true);
        }
    });
},

/**
 * Change current handle to new value
 *
 * @param String    new_handle      New handle value
 * @param Func      cb              Completion Callback
 */
User.prototype.change_handle = function(new_handle, cb) {
    var that = this;
    new_handle = new_handle.toLowerCase();

    Mynews.odb
        .update(this['@class'])
        .set({ handle: new_handle })
        .where({ '@rid': this['@rid'] })
        .scalar()
        .then(function(data) {
            that['handle'] = new_handle;
            cb(null, that);
        })
        .catch(cb);
},

// --
// Private Instance Methods
// --

/**
 * Load User Permissions
 *
 * @param   Func        cb      Completion Callback
 */
User.prototype._load_permissions = function(cb) {
    var self = this;
    
    Mynews.odb
        .select("expand(out('UserHasRole').out('RoleHasPermission'))")
        .from('User')
        .where({ '@rid': this['@rid'] })
        .limit(9999)
        .all()
        .then(function(data) {
            for (var i in data) {
                self.permissions[data[i].name] = true;
            }
            cb(null, self);
        })
        .catch(cb);
},

/**
 * Insert field values to the database
 *
 * @param Func      cb      Completion Callback
 */
User.prototype._insert = function(cb) {
    var that = this;
    if (that["handle"] && that["handle"] != '') {
        that["handle"] = that["handle"].toLowerCase();
        Model.prototype._insert.call(this, cb);
    } else {
        this._new_handle(0, function(error, new_handle) {
            if (error) {
                cb(error, false);
            } else {
                that['handle'] = new_handle;
                Model.prototype._insert.call(that, cb);
            }
        });
    }
},

/**
 * Create new unique handle value for user
 *
 * @param int       postfix_num     handle postfix number
 * @param Func      cb              Completion Callback
 */
User.prototype._new_handle = function(postfix_num, cb) {
    var that = this;
    var handle_base_value = this['first_name'] + " " + this['last_name'];
    if (handle_base_value == '') {
        cb(new Error("Handle base property has empty value."), false);
        return;
    }

    var new_handle = Slug(handle_base_value).toLowerCase();
    if (postfix_num > 0) {
        new_handle = new_handle + '-' + postfix_num;
    }

    User.CheckHandle(new_handle, function(error, handle){
        if (error) {
            cb(error, false);
            return;
        }
        if (handle == '') {
            // same handle already exists
            that._new_handle(postfix_num + 1, cb);
        } else {
            // handle is unique
            cb(null, handle);
        }
    });
},

// --
// Public Helpers
// --

/**
 * Find a single user
 *
 * @param   obj         filters Filters Object
 * @param   Func        cb      Completion Callback
 */
User.Find = function(filter, cb) {
    Model.Find(this, filter, function(e, user) {
        if (!e && user) {
            user._load_permissions(cb);
        } else {
            cb(e, false);
        }
    });
},

/**
 * Find Users
 *
 * @param   Obj         filters     Finder Filters
 * @param   Func        cb          Completion Callback
 */
User.FindAll = function(filters, cb)  {
    Model.FindAll(this, filters, cb);
},

/**
 * Create a single user
 *
 * @param   Obj         props   Object Properties
 * @param   Func        cb      Completion Callback
 */
User.Create = function(props, cb) {
    try {
        // Hash the password
        props.password = crypto.createHash('sha1').update(props.password).digest('hex');
        if (props.handle) {
            props.handle = props.handle.toLowerCase();
        }
        Model.Create(this, props, function(e, user) {
            if (e || !user) {
                console.log(e);
                console.log('Error 1');
                return cb(e, false);
            }
            // Adding userprofile as part of User
            if (!props.userProfile) {
                props.userProfile = { about_me: '' };
            }

            UserProfile.Create(props.userProfile, user['@rid'], function(e, profile) {
                if (e || !profile) {
                    console.log(e);
                    console.log('Error 2', profile);
                    return cb(e, false);
                }
                user.userProfile = profile;

                // Create default Feed Settings for the user
                UserFeedSettings.Create({
                    'track_public_ratings':'0',
                    'article_filter': '0',
                    'avg_article_rating': '4'
                }, function(e, feedSettings) {
                    if (e || !feedSettings) {
                        console.log(e);
                        console.log('Error 3');
                        return cb(e, false)
                    }

                    Mynews.odb
                        .edge
                        .from(user['@rid'])
                        .to("SELECT FROM Role WHERE name = 'Registered User'")
                        .create('UserHasRole')
                        .then(function(data) {
                            Mynews.odb
                                .edge
                                .from(feedSettings['@rid'])
                                .to(user['@rid'])
                                .create('UserHasFeedSettings')
                                .then(function(data) {
                                    cb(null, user)
                                })
                                .catch(cb);
                        })
                        .catch(cb);
                })
            });
        });
    }
    catch(e) {
        cb(e);
    }
},

/**
 * Check the uniqueness of handle value
 *
 * @param string    handle              handle value to check
 * @param Func      cb                  Completion Callback
 *
 */
User.CheckHandle = function(handle, cb) {
    Mynews.odb
        .select()
        .from('User')
        .where({ handle: handle.toLowerCase() })
        .all()
        .then(function(data) {
            if (data.length) {
                // same handle already exists
                cb(null, false);
            } else {
                // handle is unique now
                cb(null, handle);
            }
        })
        .catch(cb);
}

// --
// Public Static
// --

User.Status = {
    VALIDATING: 0,
    ACTIVE: 1,
    LOCKED: 2
}

module.exports = User;

// -------------------------
//   Circular Dependencies
// -------------------------

/**
 * Why are these dependancies down here?
 *   Answer: Fixes a Node.js Circular dependancy problem
 */

// Models
var Group               = require('./group');
var Article             = require('./article');
var Publisher           = require('./publisher');
var Comment             = require('./comment');
var UserProfile         = require('./user_profile');
var UserFeedSettings    = require('./user_feedsettings');
