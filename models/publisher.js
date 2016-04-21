// ----------------
//   Dependencies
// ----------------

var Model       = require('./model');
var Mynews       = require('../database/database');
var Async       = require('async');

// ----------------
//   Definition
// ----------------

var Publisher = function(data) {
    this._load(data);
}

// Inherit from Model
Publisher.prototype.__proto__ = Model.prototype;

Publisher.prototype['@class'] = Publisher['@class'] = 'Publisher';

Publisher.prototype.properties = {
    "@rid":                 Model.Type.RID(),
    "name":                 Model.Type.STRING(true, 0, 64),
    "url":                  Model.Type.URL(true),
    "imageUrl":             Model.Type.URL(false),
    "slug":                 Model.Type.STRING(false, 0, 512),
    "email":                Model.Type.EMAIL(false),
    "summary":              Model.Type.STRING(false, 0, 1024),
    "about":                Model.Type.STRING(false, 0, 1024),
    "specialty":            Model.Type.STRING(false, 0, 1024),
    "owner":                Model.Type.STRING(false, 0, 64),
    "owner_url":            Model.Type.URL(false),
    "twitter":              Model.Type.STRING(false, 0, 64),
    "facebook":             Model.Type.STRING(false, 0, 64),
    "creation_date":        Model.Type.LONG(false),
    "modification_date":    Model.Type.LONG(false)
}

/**
 * Get Journalists of this Publisher
 *
 * @param   Func    cb     Completion Callback
 */
Publisher.prototype.get_journalists = function(cb) {
    Mynews.odb
        .select("expand(out.out('ArticleHasJournalist'))")
        .from('ArticleHasPublisher')
        .where({ 'in': this['@rid'] })
        .all()
        .then(function(data) {
            if (data && data.length) {
                var results = [];
                var index = {};

                for (var i in data) {
                    data[i]['@rid'] = Mynews.RID.Build(data[i]['@rid']);
                    if (!index[data[i]['@rid']]) {
                        index[data[i]['@rid']] = new Journalist(data[i])
                    }
                }

                for (var i in index) {
                    results.push( index[i] );
                }

                cb(null, results);
            } else {
                console.log('Empty Results: ', data);
                cb(null, []);
            }
        })
        .catch(function(e) {
            console.log('Caught', e);
            //cb(e);
        });
},

/**
 * Get Articles from this Publisher
 *
 *  ?? CURRENTLY UNUSED ??
 *
 * @param   Func     cb     Completion Callback
 */
Publisher.prototype.get_articles = function(cb) {
    Mynews.odb
        .select("expand(in('ArticleHasPublisher'))")
        .from('Publisher')
        .where({ '@rid': this['@rid'] })
        .all()
        .then(function(data) {
            var results = [];

            for (var i in data) {
                data[i]['@rid'] = Mynews.RID.Build(data[i]['@rid']);
                results.push( new Article(data[i]) );
            }

            cb(null, results);
        })
        .catch(cb);
},

/**
 * Get a total Articles count for this Publisher
 *
 * @param   Func     cb     Completion Callback
 */
Publisher.prototype.get_article_count = function(cb) {
    Mynews.odb
        .select("in('ArticleHasPublisher').size() AS count")
        .from('Publisher')
        .where({ '@rid': this['@rid'] })
        .all()
        .then(function(data) {
            cb(null, data[0].count);
        })
        .catch(cb);
},

/**
 * Get count of users following
 *
 * @param Func          cb          Completion Callback
 */
Publisher.prototype.get_follower_count = function(cb) {
    Mynews.odb
        .select("COUNT(*) AS count")
        .from('UserFeedSettingsHasPublisher')
        .where({ 'in': this['@rid'] })
        .all()
        .then(function(data) {
            if (data.length) {
                cb(null, data[0]['count']);
            } else {
                cb(null, false);
            }
        })
        .catch(cb);
}

/**
 * Get average rating of Publisher by users
 *
 * @param   Func     cb     Completion Callback
 */
Publisher.prototype.get_avg_rating_user = function(cb) {
    this.get_articles(function(e, articles) {
        if (e) {
            cb(e, 0)
        } else if (articles && articles.length > 0) {
            var articleids = [];
            for (var i in articles) {
                articleids.push(articles[i]['@rid']);
            }

            Mynews.odb
                .select('AVG(value) AS avg_rating, COUNT(value) AS count')
                .from('UserRateArticle')
                .where("in IN [" + articleids + "]")
                .group(['in'])
                .all()
                .then(function(data) {
                    // Build AVG
                    var total_avg = 0;
                    var total_count = 0;

                    for (var i in data) {
                        total_avg += data[i].avg_rating || 0;
                        total_count += data[i].count || 0;
                    }

                    cb(null, total_avg / total_count || 0);
                })
                .catch(cb);

        } else {
            cb(null, 0);
        }
    });
},

/**
 * Get Comments of this Publisher
 * 
 * @param Func          cb          Completion Callback
 * 
 */
Publisher.prototype.get_comments = function(cb) {
    Mynews.odb
        .select()
        .from('Comment')
        .where({ 'in_PublisherHasComment': this['@rid'] })
        .all()
        .then(function(data) {
            if (data && data.length) {
                var comments = [];
                for (var i in data) {
                    data[i]['@rid'] = Mynews.RID.Build( data[i]['@rid'] );
                    data[i].in_UserHasComment = Mynews.RID.Build( data[i].in_UserHasComment );
                    data[i].in_PublisherHasComment = Mynews.RID.Build( data[i].in_PublisherHasComment );

                    var new_comment = new Comment(data[i]);

                    if (typeof data[i].in_CommentHasChildComments != 'undefined') {
                        data[i].in_CommentHasChildComments = Mynews.RID.Build( data[i].in_CommentHasChildComments );
                        new_comment.parent_id = data[i].in_CommentHasChildComments;
                    }

                    new_comment.owner_id = data[i].in_PublisherHasComment;
                    new_comment.user_id = data[i].in_UserHasComment;

                    comments.push( new_comment );
                }
                cb(null, comments);
            } else {
                cb(null, []);
            }
        })
        .catch(cb);
}

/**
 * Get the slug base value
 *
 * @returns   String   string that will be used as base value for generating slug
 */
Publisher.prototype._get_slug_base_string = function() {
    return this['name'];
},

/**
 * Get Recently Rated Publishers
 *
 * @param   Obj     filters     Publisher Filters
 * @param   Func    cb          Completion Callback
 */
Publisher.FindAll_RecentlyRated = function(filters, cb) {
    User.Find(filters, function(e, user){
        if (e) {
            cb (e, null) 
        } else {
            if (user) {
                Mynews.odb
                    .select("in.out('ArticleHasPublisher')")
                    .from('UserRateArticle')
                    .where({ out: user['@rid'] })
                    .order('creation_date')
                    .all()
                    .then(function(data) {
                        if (data && data.length) {
                            var publishers = [];
                            for (var i in data) {
                                for (var j in data[i].in) {
                                    data[i].in[j] = Mynews.RID.Build(data[i].in[j]);
                                    publishers[ data[i].in[j] ] = true;
                                }
                            }

                            var pub_ids = [];
                            for (var i in publishers) {
                                pub_ids.push(i);
                            }

                            pub_ids.reverse();

                            Mynews.odb
                                .select()
                                .from("[" + pub_ids.join(',') + "]")
                                .all()
                                .then(function(data) {
                                    var publishers = [];
                                    if (data && data.length) {
                                        for (var i in data) {
                                            data[i]['@rid'] = Mynews.RID.Build(data[i]['@rid']);
                                            publishers.push(new Publisher(data[i]));
                                        }
                                        cb(null, publishers);
                                    } else {
                                        cb(null, []);
                                    }
                                })
                                .catch(function(e) {
                                    console.log(e);
                                    cb(e);
                                });

                        } else {
                            cb(null, []);
                        }
                    })
                    .catch(cb);

            } else {
                return cb(new Error("User not found"), null);
            }
        }
    });
},

/**
 * Get Recently Rated Publishers by Friends
 *
 * @param   Obj     filters     Publisher Filters
 * @param   Func    cb          Completion Callback
*/ 
Publisher.FindAll_RecentlyRatedByFriends = function(filters, cb) {
    try {
        User.Find(filters, function (e, user) {
            if (e) {
                cb(e, null);
            } else {
                user.get_friends(function(e, friends) {
                    if (e) {
                        cb(e, null)
                    } else {
                        if (friends && friends.length) {
                            var publishers = [];
                            var friendids = [];
                            for (var i in friends) {
                                friendids.push(friends[i]['@rid']);
                            }

                            Mynews.odb
                                .select("in.out('ArticleHasPublisher')")
                                .from('UserRateArticle')
                                .where('out IN [' + friendids + ']')
                                .order(['creation_date'])
                                .all()
                                .then(function(data) {
                                    if (data && data.length) {
                                        for (var i in data) {
                                            for (var j in data[i].in) {
                                                data[i].in[j] = Mynews.RID.Build(data[i].in[j]);
                                                publishers[ data[i].in[j] ] = true;
                                            }
                                        }

                                        if (publishers) {
                                            var pub_ids = [];
                                            for (var i in publishers) {
                                                pub_ids.push(i);
                                            }

                                            Mynews.odb
                                                .select()
                                                .from("[" + pub_ids + "]")
                                                .all()
                                                .then(function(data) {
                                                    var publishers = [];
                                                    if (data && data.length) {
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
                                        } else {
                                            cb(null, [])
                                        }
                                    } else {
                                        cb(null, []);
                                    }
                                })
                                .catch(cb);

                        } else {
                            cb(null, []);
                        }
                    }
                });
            }
        });
    }
    catch(e) {
        console.log(e);
    }
},

/**
 * Get Top Rated Publishers, sorted in descending order or user rating
 * 
 * @param   Obj     filters     Publisher Filters
 * @param   Func    cb          Completion Callback
 */
Publisher.FindAll_TopRated = function(filters, cb) {
    Publisher.FindAll(filters, function(e, publishers) {
        if (e) {
            cb(e, []);
        } else {
            Async.forEach(publishers, function(publisher, done) {
                publisher.get_avg_rating_user(function(e, rating) {
                    publisher.rating = rating;
                    done();
                })
            }, function(err) {
                if (err) {
                    cb(err, null);
                } else {
                    publishers.sort(function(a,b) { return parseFloat(b.rating) - parseFloat(a.rating) } );
                    cb(null, publishers);
                }
            })
        }
    });
},

/**
 * Find a single publisher
 *
 * @param   String      filters      filters
 * @param   Func        cb      Completion Callback
 */
Publisher.Find = function(filter, cb) {
    Model.Find(this, filter, cb);
},

/**
 * Find within all publishers
 *
 * @param   Obj         filters     Publisher Filters
 * @param   Func        cb          Completion Callback
 */
Publisher.FindAll = function(filters, cb) {
    Model.FindAll(this, filters, cb);
},

/**
 * Create a publisher
 *
 * @param   Obj         props   Object Properties
 * @param   Func        cb      Completion Callback
 */
Publisher.Create = function(props, cb) {
    Model.Create(this, props, cb);
}

module.exports = Publisher;

// -------------------------
//   Circular Dependencies
// -------------------------

/**
 * Why are these dependancies down here?
 *   Answer: Fixes a Node.js Circular dependancy problem
 */

// Models
var Article     = require('./article');
var Journalist  = require('./journalist');
var User        = require('./user');
var Comment     = require('./comment');
