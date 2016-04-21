// ----------------
//   Dependencies
// ----------------

var Model                 = require('./model');
var Mynews                 = require('../database/database');
var Async                 = require('async');
var Config                = require('../config.json');

var Resque = require('coffee-resque').connect({
    host: Config.redis.host,
    port: Config.redis.port
});

// ----------------
//   Definition
// ----------------

var Journalist = function(data) {
    this._load(data);
}

// Inherit from Model
Journalist.prototype.__proto__ = Model.prototype;

Journalist.prototype['@class'] = Journalist['@class'] = 'Journalist';

Journalist.prototype.properties = {
    "@rid":                     Model.Type.RID(),
    "first_name":               Model.Type.STRING(true,0,64),
    "last_name":                Model.Type.STRING(true,0,64),
    "email":                    Model.Type.EMAIL(false),
    "creation_date":            Model.Type.LONG(false),
    "modification_date":        Model.Type.LONG(false),
    "status":                   Model.Type.SHORT(true),
    "imageUrl":                 Model.Type.URL(false),
    "url":                      Model.Type.URL(false),
    "slug":                     Model.Type.STRING(false, 0, 512),
    "summary":                  Model.Type.STRING(false, 0, 1024),
    "interest":                 Model.Type.STRING(false, 0, 1024),
    "contact_url":              Model.Type.URL(false),
    "contact_email":            Model.Type.EMAIL(false),
    "contact_twitter":          Model.Type.URL(false),
    "contact_fb":               Model.Type.URL(false),
    "contact_linkedin":         Model.Type.URL(false)
}

/**
 * Add a publisher to journalist
 *
 *  ?? CURRENTLY UNUSED ??
 *
 * @param Publisher     publisher   Publisher to add
 * @param Func          cb          Completion Callback
 */
Journalist.prototype.add_publisher = function(publisher, cb) {
    Mynews.odb
        .edge
        .from(this['@rid'])
        .to(publisher['@rid'])
        .create('JournalistHasPublisher')
        .then(function(data) {
            cb(null, data[0]);
        })
        .catch(cb);
}

/**
 * Get publishers of this journalist
 *
 * @param Func          cb          Completion Callback
 */
Journalist.prototype.get_publishers = function(cb) {
    Mynews.odb
        .select("expand(in('ArticleHasJournalist').out('ArticleHasPublisher'))")
        .from('Journalist')
        .where({ '@rid': this['@rid'] })
        .all()
        .then(function(data) {
            if (data && data.length) {
                var results = [];
                var index = {};

                for (var i in data) {
                    data[i]['@rid'] = Mynews.RID.Build(data[i]['@rid']);
                    if (!index[data[i]['@rid']]) {
                        index[data[i]['@rid']] = new Publisher(data[i])
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
        .catch(cb);
}

/**
 * Get Comments of this journalist
 *
 * @param Func          cb          Completion Callback
 */
Journalist.prototype.get_comments = function(filter_all,cb) {
    Mynews.odb
        .select("expand(out('JournalistHasComment'))")
        .from('Journalist')
        .where({ '@rid': this['@rid'] })
        .all()
        .then(function(data) {
            var results = [];

            for (var i in data) {
                data[i]['@rid'] = Mynews.RID.Build(data[i]['@rid']);

                var comment = new Comment(data[i]);
                comment.owner_id = data[i].in_JournalistHasComment;
                comment.user_id = data[i].in_UserHasComment;

                if (typeof data[i].in_CommentHasChildComments != 'undefined') {
                    comment.parent_id = data[i].in_CommentHasChildComments;
                }

                results.push(comment);
            }

            cb(null, results);
        })
        .catch(function(e) {
            console.log(e);
            cb(e);
        });
},

/**
 * Get articles of this journalist
 *
 * @param Func          cb          Completion Callback
 */
Journalist.prototype.get_articles = function(cb) {
    Mynews.odb
        .select("expand(in('ArticleHasJournalist'))")
        .from('Journalist')
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
 * Get average rating of Journalist by users
 *
 * @param   Func     cb     Completion Callback
 */
Journalist.prototype.get_avg_rating_user = function(cb) {
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

                    cb(null, total_avg || 0);
                })
                .catch(cb);

        } else {
            cb(null, 0);
        }
    });
},

/**
 * Get count of users following
 *
 * @param Func          cb          Completion Callback
 */
Journalist.prototype.get_follower_count = function(cb) {
    Mynews.odb
        .select("COUNT(*) AS count")
        .from('UserFeedSettingsHasJournalist')
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
 * Get user rating of this journalist
 *
 * @param Func          cb          Completion Callback
 */
Journalist.prototype.get_rating = function(cb) {
    Mynews.odb
        .select("AVG(in('ArticleHasJournalist').in('UserRateArticle').value) AS journalist_rating")
        .from('Journalist')
        .where({ '@rid': this['@rid'] })
        .all()
        .then(function(data) {
            if (data.length) {
                cb(null, data[0]['journalist_rating']);
            } else {
                cb(null, false);
            }
        })
        .catch(cb);
}

/**
 * Get the slug base value
 *
 * @returns String   string that will be used as base value for generating slug
 */
Journalist.prototype._get_slug_base_string = function() {
    return this['first_name'] + " " + this['last_name'];
},

/**
 * Save a Journalist in database. Also update journalistBackground
 *
 * @param   Func    cb    Completion Callback
 */
Journalist.prototype.save = function(cb) {
    var backgrounds = this.journalistBackground;
    var bgdata      = [];
    var that        = this;

    Async.series([
        function(callback) {
            if (backgrounds) {
                Async.forEachSeries(backgrounds, function(background, callbackground) {
                    if (background["@rid"]) {
                        JournalistBackground.Find({ where: { "@rid": background["@rid"] }}, function(e, journbg) {
                            if (e) {
                                return callbackground(e);
                            }
                            if (journbg) {
                                if (typeof background.organization != 'undefined') {
                                    journbg.organization = background.organization;
                                }
                                if (typeof background.title != 'undefined') {
                                    journbg.title = background.title;
                                }
                                if (typeof background.year_start != 'undefined') {
                                    journbg.year_start = background.year_start;
                                }
                                if (typeof background.year_end != 'undefined') {
                                    journbg.year_end = background.year_end;
                                }
                                if (typeof background.description != 'undefined') {
                                    journbg.description = background.description;
                                }
                                journbg.save(function(e, data) {
                                    if (e) {
                                        callbackground(e);
                                    } else {
                                        bgdata.push(data);
                                        callbackground();
                                    }
                                });
                            } else {
                                callbackground(new Error("Error updating background data"));
                            }
                        });
                    } else {
                        JournalistBackground.Create(background, that["@rid"], function(e, journalistBackground) {
                            if (e) {
                                callbackground(e);
                            } else {
                                bgdata.push(journalistBackground);
                                callbackground();
                            }
                        });  
                    }
                }, function(err) {
                    if (err) {
                        callback(err);
                    } else {
                        callback();
                    }
                });
            } else {
                callback();
            }   
        },
        function(callback) {
            if (!that['@rid']) {
                that._insert(callback);
            } else {
                that._update(callback);
            }
        } 
    ], function(err) {
        if (err) {
            cb(err, false);
        } else {
            that.journalistBackground = bgdata;
            cb(false, that);
        }
    });
},

/**
 * Deleta a Journalist. Also delete associated JournalistBackgrounds
 *
 * @param    function    cb      Completion callback
 */
Journalist.prototype.delete = function(cb) {
    var that = this;
    var journalistBackgrounds = that.journalistBackground;

    Async.series([
        function(callback) {
            if (journalistBackgrounds) {
                Async.forEachSeries(journalistBackgrounds, function(journalistBackground, callbackground) {
                    JournalistBackground.Find({ where: { '@rid': journalistBackground["@rid"] + '' }}, function(e, jBg) {
                        if (jBg) {
                            jBg.delete(function(e) {
                                if (e) {
                                    callbackground(e);
                                } else {
                                    callbackground();
                                }
                            });
                        } else {
                            callbackground(new Error("Error Deleting Journalist Background"));
                        }
                    });
                }, function(err) {
                    if (err) {
                        callback(err);
                    } else {
                        callback();
                    }
                });
            } else {
                callback();
            }
        },
        function(callback) {
            Mynews.odb
                .vertex
                .delete(that['@rid'])
                .then(function() {
                    Resque.enqueue('search:remove', 'worker', [{ type: that['@class'], data: that['@rid'] }], function(err) {
                        callback(null);
                        that._empty();
                    });
                })
                .catch(callback);
        }
    ], function(err) {
        if (err) {
            cb(err, false);
        } else {
            cb(null, true);
        }
    });
},

/**
 * Get Recently Rated Journalists
 *
 * @param   Obj     filters     Journalist Filters
 * @param   Func    cb          Completion Callback
 */
Journalist.FindAll_RecentlyRated = function(filters, cb) {
    User.Find(filters, function(e, user) {
        if (e) {
            cb (e, null) 
        } else {
            if (user) {
                Mynews.odb
                    .select("in.out('ArticleHasJournalist')")
                    .from('UserRateArticle')
                    .where({ out: user['@rid'] })
                    .order('creation_date')
                    .all()
                    .then(function(data) {
                        if (data && data.length) {
                            var journalists = [];
                            for (var i in data) {
                                for (var j in data[i].in) {
                                    data[i].in[j] = Mynews.RID.Build(data[i].in[j]);
                                    journalists[ data[i].in[j] ] = true;
                                }
                            }

                            var journ_ids = [];
                            for (var i in journalists) {
                                journ_ids.push(i);
                            }

                            Mynews.odb
                                .select()
                                .from("Journalist")
                                .where("@rid IN [" + journ_ids.join(',') + "]")
                                .all()
                                .then(function(data) {
                                    var journalists = [];
                                    if (data && data.length) {
                                        for (var i in data) {
                                            data[i]['@rid'] = Mynews.RID.Build(data[i]['@rid']);
                                            journalists.push(new Journalist(data[i]));
                                        }
                                        cb(null, journalists);
                                    } else {
                                        cb(null, []);
                                    }
                                })
                                .catch(function(e) {
                                    console.log('SELECT ERROR', e);
                                    cb(e);
                                });

                        } else {
                            cb(null, []);
                        }
                    })
                    .catch(function(e) {
                        console.log('ERROR Journalist.FindAll_RecentlyRated', e);
                        cb(e);
                    });
            } else {
                return cb(new Error("User not found"), null);
            }
        }
    });
},

/**
 * Get Recently Rated Journalists by Friends
 *
 * @param   Obj     filters     Journalist Filters
 * @param   Func    cb          Completion Callback
*/
Journalist.FindAll_RecentlyRatedByFriends = function(filters, cb) {
    User.Find(filters, function(e, user){
        if (e) {
            cb(e, null)
        } else {
            user.get_friends(function(e, friends) {
                if (e) {
                    cb(e, null)
                } else {
                    if(friends && friends.length) {
                        var journalists = [];
                        var friendids = [];
                        for (var i in friends){
                            friendids.push(friends[i]['@rid']);
                        }

                        Mynews.odb
                            .select("in.out('ArticleHasJournalist')")
                            .from('UserRateArticle')
                            .where('out IN [' + friendids + ']')
                            .order(['creation_date'])
                            .all()
                            .then(function(data) {
                                if (data && data.length) {
                                    for (var i in data) {
                                        for (var j in data[i].in) {
                                            data[i].in[j] = Mynews.RID.Build(data[i].in[j]);
                                            journalists[ data[i].in[j] ] = true;
                                        }
                                    }

                                    if (journalists) {
                                        var journ_ids = [];
                                        for (var i in journalists) {
                                            journ_ids.push(i);
                                        }

                                        journ_ids.reverse();

                                        Mynews.odb
                                            .select()
                                            .from("[" + journ_ids + "]")
                                            .all()
                                            .then(function(data) {
                                                var journalists = [];
                                                if (data && data.length) {
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
},

/**
 * Get Top Rated Journalists, sorted in descending order of user rating
 * 
 * @param   Obj     filters      Journalist Filters
 * @param   Func    cb          Completion Callback
 */
Journalist.FindAll_TopRated = function(filters, cb) {
     Journalist.FindAll(filters, function(e, journalists) {
        if (e) {
            cb(e, []);
        } else {
            Async.forEach(journalists, function(journalist, done) {
                journalist.get_avg_rating_user(function(e, rating) {
                    journalist.rating = rating;
                    done();
                })
            }, function(err) {
                if (err) {
                    console.log(err)
                    cb(err, null);
                } else {
                    journalists.sort(function(a,b) { return parseFloat(b.rating) - parseFloat(a.rating) } );
                    cb(null, journalists);
                }
            })
        }
    });
},

/**
 * Find a single Journalist
 *
 * @param   obj         filters Filters Object
 * @param   Func        cb      Completion Callback
 */
Journalist.Find = function(filter, cb) {
    Model.Find(this, filter, function(e, journalist) {
        if (e) {
            cb(e, null);
        }
        if (journalist) {
            Mynews.odb
                .select("expand(in('JournalistLinkBackground'))")
                .from( journalist["@rid"] )
                .all()
                .then(function(data) {
                    if (data && data.length) {
                        for (var i in data) {
                            data[i]['@rid'] = Mynews.RID.Build( data[i]['@rid'] );
                        }

                        journalist.journalistBackground = data;
                    }
                    cb(null, journalist);
                });
        } else{
            cb(null, journalist);
        }
    });
},

/**
 * Find within all Journalists
 *
 * @param   Obj         filters     Finder Filters
 * @param   Func        cb          Completion Callback
 */
Journalist.FindAll = function(filters, cb) {
    Model.FindAll(this, filters, cb);
},

/**
 * Create a single Journalist
 *
 * @param   Obj         props   Object Properties
 * @param   Func        cb      Completion Callback
 */
Journalist.Create = function(props, cb) {
    Model.Create(this, props, function(e, journalist) {
        if (e) {
            cb(e, journalist)
        } else {
            if (props.journalistBackground) {
                JournalistBackground.Create(props.journalistBackground, journalist['@rid'], function(e, edata) {
                    if (e) {
                        cb(e, null);
                    } else {
                        journalist.journalistBackground = edata;
                        cb(null, journalist);
                    }
                });
            } else {
                cb(null, journalist);
            }
        }
    });
}

/**
 * Get Journalist with given info or create it
 *
 * @param   Object  journalist      Journalist Info
 * @param   Object  publisher       Publisher
 * @param   Func    cb              Completion Callback
 */
Journalist.FindOrCreate = function(journalist, publisher,  cb) {
    var that = this;
    Mynews.odb
        .select()
        .from(that['@class'])
        .where( Model._where(journalist) + ' AND JournalistHasPublisher.in = ' + publisher['@rid'] )
        .limit(1)
        .all()
        .then(function(data) {
            if (data && data.length) {
                // return found journalist
                data[0]['@rid'] = Mynews.RID.Build(data[0]['@rid']);
                cb(null, new Journalist(data[0]));
            } else {
                // Check the existence of Journalist without publisher link
                Mynews.odb
                    .select()
                    .from(that['@class'])
                    .where( Model._where(journalist) )
                    .limit(1)
                    .all()
                    .then(function(data) {
                        if (data && data.length) {
                            data[0]['@rid'] = Mynews.RID.Build(data[0]['@rid']);
                            var ejournalist = new Journalist(data[0]);
                            ejournalist.add_publisher(publisher, function (aerror, aresult) {
                                if (aerror || !aresult) {
                                    return cb(aerror, false);
                                }
                                cb(null, ejournalist);
                            })
                        } else {
                            // Journalist does not exist. Create and Return
                            Journalist.Create(journalist, function(cerror, cjournalist) {
                                if (cerror || !cjournalist) {
                                    return cb(cerror, false);
                                }
                                cjournalist.add_publisher(publisher, function (aerror, aresult) {
                                    if (aerror || !aresult) {
                                        return cb(aerror, false);
                                    }
                                    cb(null, cjournalist);
                                });
                            });
                        }
                     })
                    .catch(cb);
            }
        })
        .catch(cb);
}


module.exports = Journalist;

// -------------------------
//   Circular Dependencies
// -------------------------

/**
 * Why are these dependancies down here?
 *   Answer: Fixes a Node.js Circular dependancy problem
 */

// Models
var JournalistBackground  = require('../models/journalist_background');
var User                  = require('../models/user');
var Article               = require('./article');
var Publisher             = require('./publisher');
var Comment               = require('./comment');
