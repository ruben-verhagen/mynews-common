// ----------------
//   Dependencies
// ----------------

var Model       = require('./model');
var Mynews       = require('../database/database');
var Async       = require('async');
var Redis       = require('redis');
var Config      = require('../config.json');

var ArticlePublisher   = Redis.createClient(Config.redis.port, Config.redis.host);

// ----------------
//   Definition
// ----------------

var Article = function(data) {
    this._load(data);
}

// Inherit from Model
Article.prototype.__proto__ = Model.prototype;

Article.prototype['@class'] = Article['@class'] = 'Article';

Article.prototype.properties = {
    "@rid":                 Model.Type.RID(),
    "imageUrl":             Model.Type.URL(false),
    "title":                Model.Type.STRING(true, 0, 256),
    "body":                 Model.Type.STRING(true, 0, 102400),
    "url":                  Model.Type.URL(true),
    "creation_date":        Model.Type.LONG(false),
    "post_date":            Model.Type.LONG(false),
    "modification_date":    Model.Type.LONG(false),
    "featured":             Model.Type.SHORT(true),
    "slug":                 Model.Type.STRING(false, 0, 512),
    "point":                Model.Type.STRING(false, 0, 512)
}

// --
// Instance Methods
// --

/**
 * Add a tag to Article
 *
 * @param   tag_id      tag     tag to add to the article
 * @param   relevance   decimal Relance of tag 
 * @param   func        cb      Completion Callback
 */
Article.prototype.assign_tag = function(article_tag, relevance, cb) {
    Mynews.odb
        .edge
        .from(this['@rid'])
        .to(article_tag['@rid'])
        .create({
            '@class': 'ArticleHasTag',
            relevance: relevance
        })
        .then(function(data) {
            if (data && data.length) {
                data[0]['@rid'] = Mynews.RID.Build(data[0]['@rid']);
            }

            cb(null, data[0]);
        })
        .catch(cb);
},

/**
 * Get tags of this article
 *
 * @param   func        cb      Completion Callback
  */
Article.prototype.get_tags = function(cb) {
    Mynews.odb
        .select()
        .from('Tag')
        .where({ 'in_ArticleHasTag.out': this['@rid'] })
        .all()
        .then(function(data) {
            if (data && data.length) {
                var results = [];
                for (var i in data) {
                    data[i]['@rid'] = Mynews.RID.Build(data[i]['@rid']);
                    results.push(new Tag(data[i]));
                }

                cb(null, results);
            } else {
                cb(null, []);
            }
        })
        .catch(function(e) {
            console.log(e);
            cb(e);
        });
}

/**
 * Add a publisher to Article
 *
 * @param   publisher_id    role    publisher to add to the article
 * @param   Func            cb      Completion Callback
 */
Article.prototype.assign_publisher = function(publisher_id, cb) {
    Mynews.odb
        .edge
        .from(this['@rid'])
        .to(publisher_id)
        .create('ArticleHasPublisher')
        .then(function() {
            cb(null, true);
        })
        .catch(cb);
},

/**
 * Get publishers of this article
 *
 * @param   Func            cb    Completion Callback
 */
Article.prototype.get_publishers = function(cb) {
    Mynews.odb
        .select("expand(out('ArticleHasPublisher'))")
        .from('Article')
        .where({ '@rid': this['@rid'] })
        .all()
        .then(function(data) {
            var results = [];
            for (var i in data) {
                data[i]['@rid'] = Mynews.RID.Build(data[i]['@rid']);
                results.push(new Publisher(data[i]));
            }
            cb(null, results);
        })
        .catch(function(e) {
            console.log(e);
            cb(e);
        });
}

/**
 * Get Comments of this article
 * 
 * @param Func          cb          Completion Callback
 */
Article.prototype.get_comments = function(cb) {
    Mynews.odb
        .select("expand(out('ArticleHasComment'))")
        .from('Article')
        .where({ '@rid': this['@rid'] })
        .all()
        .then(function(data) {
            var results = [];

            for (var i in data) {
                data[i]['@rid'] = Mynews.RID.Build(data[i]['@rid']);

                var comment = new Comment(data[i]);
                comment.owner_id = data[i].in_ArticleHasComment;
                comment.user_id = data[i].in_UserHasComment;

                if (typeof data[i].in_CommentHasChildComments != 'undefined') {
                    comment.parent_id = data[i].in_CommentHasChildComments;
                }

                results.push(comment);
            }

            cb(null, results);
        })
        .catch(cb);
},

/**
 * Add a journalist to Article
 *
 * @param   journalist_id     role    journalist to add to the article
 * @param   Func              cb      Completion Callback
 */
Article.prototype.assign_journalist = function(journalist_id, cb) {
    Mynews.odb
        .edge
        .from(this['@rid'])
        .to(journalist_id)
        .create('ArticleHasJournalist')
        .then(function() {
            cb(null, true);
        })
        .catch(cb);
},

/**
 * Get journalists of this article
 *
 * @param   Func          cb          Completion Callback
 */
Article.prototype.get_journalists = function(cb) {
    Mynews.odb
        .select("expand(out('ArticleHasJournalist'))")
        .from('Article')
        .where({ '@rid': this['@rid'] })
        .all()
        .then(function(data) {
            var results = [];
            for (var i in data) {
                data[i]['@rid'] = Mynews.RID.Build(data[i]['@rid']);
                results.push( new Journalist(data[i]) );
            }
            cb(null, results);
        })
        .catch(function(e) {
            console.log(e);
            cb(e);
        });
}

/**
 * Get user's rating for the article
 *
 * @param User          user        User Object
 * @param Func          cb          Completion Callback
 */

Article.prototype.get_user_rating = function (user_id, cb) {
    var that = this;

    Mynews.odb
        .select("type, value")
        .from('UserRateArticle')
        .where({ 'in': this['@rid'], 'out': user_id })
        .all()
        .then(function(data) {
            var results = {};
            for (var i in data){
                results[data[i]["type"]] = data[i]["value"]/10;

            }
            cb(null, results);
        })
        .catch(function(e) {
            console.log(e);
            cb(e);
        });

}

/**
 * Rate Article by User
 *
 * @param User          user        User Object
 * @param array         ratings     Array of ratings (1-5x4)
 * @param Func          cb          Completion Callback
 */
Article.prototype.rate = function(ratings, user_id, cb) {

    if (
        !ratings
        || typeof ratings.importance == 'undefined'
        || typeof ratings.independence == 'undefined'
        || typeof ratings.factuality == 'undefined'
        || typeof ratings.transparency == 'undefined'
        ) {
        throw new Error('Rating an article requires a valid rating object.\n ' + JSON.stringify(ratings));
        return;
    }

    //because of AVG() issue
    for (key in ratings){
        ratings[key] = ratings[key]*10;
    }

    var that = this;
    var currentTime = Math.round(Date.now() / 1000);

    try {
        Mynews.odb.query(
                "DELETE EDGE UserRateArticle FROM " + user_id + " TO " + that['@rid']
        ).then(function(obj){
            Async.parallel({
                importance: function(done) {
                    Mynews.odb.query(
                            "CREATE EDGE UserRateArticle FROM " + user_id + " TO " + that['@rid'] +
                            " SET  type = :type, value = :value, creation_date = :creation_date",
                        { params: {
                            type: 'importance',
                            value: ratings.importance,
                            creation_date: currentTime
                        }}
                    )
                        .then(function(obj) {
                           done(null, obj)
                        });
                },
                independence: function(done) {
                   Mynews.odb.query(
                           "CREATE EDGE UserRateArticle FROM " + user_id + " TO " + that['@rid'] +
                            " SET  type = :type, value = :value, creation_date = :creation_date",
                        { params: {
                            type: 'independence',
                            value: ratings.independence,
                            creation_date: currentTime
                        }}
                   )
                        .then(function(obj) {
                            done(null, obj)
                       });
                },
                factuality: function(done) {
                    Mynews.odb.query(
                            "CREATE EDGE UserRateArticle FROM " + user_id + " TO " + that['@rid'] +
                            " SET  type = :type, value = :value, creation_date = :creation_date",
                        { params: {
                            type: 'factuality',
                            value: ratings.factuality,
                            creation_date: currentTime
                        }}
                    )
                        .then(function(obj) {
                            done(null, obj)
                        });
                },
                transparency: function(done) {
                    Mynews.odb.query(
                            "CREATE EDGE UserRateArticle FROM " + user_id + " TO " + that['@rid'] +
                           " SET  type = :type, value = :value, creation_date = :creation_date",
                        { params: {
                            type: 'transparency',
                            value: ratings.transparency,
                            creation_date: currentTime
                        }}
                    )
                        .then(function(obj) {
                            done(null, obj)
                        });
                }
            }, function(errors, results) {
                if (errors) {
                    console.log('Errors in rate()', errors);
                    cb(errors);
                } else {
                   console.log("rating done");
                    cb(null, true);
                }
            });
        });
    }
    catch(e) {
        console.log('Exception in rate()');
        console.log(e);
        cb(e);
    }
}

/**
 * Get avg user rating of this article
 *
 * @param   Func          cb   Completion Callback
 */
Article.prototype.get_rating = function(cb) {
    Mynews.odb
        .select('avg(value) AS rating, type AS type, COUNT(*) AS count')
        .from('UserRateArticle')
        .where({ 'in': this['@rid'] })
        .group(['type'])
        .all()
        .then(function(data) {
            if (data && data.length) {
                var ratings = {};
                for (var i in data) {
                    ratings[data[i].type] = data[i].rating/10;
                }

                cb(null, ratings);
            } else {
                cb(null, {
                    importance: 0,
                    independence: 0,
                    factuality: 0,
                    transparency: 0
                });
            }
        })
        .catch(cb);
}

/**
 * Retrieve Article meta data like Facts & Statements.
 *   - Note: Does not return data, simply populates the
 *           existing object with the desired data.
 *
 * @param Func      cb      Completion Callback
 * @param String    type    [Optional] Type of meta data to populate
 */
Article.prototype.fetch_meta = function(cb, type) {
    var self = this;
    var types = {};

    try {
        if (type == 'facts' || !type) {
            types.facts = function(done) {

                // --
                // Fetch Facts related to the Article
                // --

                Mynews.odb
                    .select("expand(out('ArticleHasFact'))")
                    .from('Article')
                    .where({ '@rid': self['@rid'] })
                    .all()
                    .then(function(data) {
                        self.facts = [];
                        for (var i in data) {
                            data[i]['@rid'] = Mynews.RID.Build(data[i]['@rid']);
                            self.facts.push( new ArticleFact(data[i]) );
                        }
                        done();
                    })
                    .catch(function(e) {
                        done(new Error('Encountered a problem loading ArticleFact data. ' + e));
                    });
            };
        }

        if (type == 'statements' || !type) {
            types.statements = function(done) {

                // --
                // Fetch Statements related to the Article
                // --

                Mynews.odb
                    .select("expand(out('ArticleHasStatement'))")
                    .from('Article')
                    .where({ '@rid': self['@rid'] })
                    .all()
                    .then(function(data) {
                        self.statements = [];
                        for (var i in data) {
                            data[i]['@rid'] = Mynews.RID.Build(data[i]['@rid']);
                            self.statements.push( new ArticleStatement(data[i]) );
                        }
                        done();
                    })
                    .catch(function(e) {
                        done(new Error('Encountered a problem loading ArticleStatement data. ' + e));
                    });
            };
        }

        Async.parallel(types, function(e, results) {
            cb(e);
        });
    }
    catch(e) {
        console.log(e);
        throw e;
    }
}

// --
// Private Instance Methods
// --

/**
 * Get the slug base value
 *
 * @returns String   string that will be used as base value for generating slug
 */
Article.prototype._get_slug_base_string = function(){
    return this['title'];
},

// --
// Public Helpers
// --

/**
 * Find a single article
 *
 * @param   String      filters      filters
 * @param   Func        cb      Completion Callback
 */
Article.Find = function(filter, cb) {
    Model.Find(this, filter, function(e, article) {
        if (e || !article) {
            cb(e, article);
        } else {
            Async.parallel({
                publisher: function(done) {
                    Mynews.odb
                        .select("expand(out('ArticleHasPublisher'))")
                        .from('Article')
                        .where({ '@rid': article['@rid'] })
                        .all()
                        .then(function(data) {
                            if (data && data.length) {
                                data[0]['@rid'] = Mynews.RID.Build(data[0]['@rid']);
                                if (filter.raw) {
                                    done(e, data[0]);
                                } else {
                                    done(e, new Publisher(data[0]));
                                }
                            } else {
                                done(null, []);
                            }
                        })
                        .catch(cb);
                },
                journalist: function(done) {
                    Mynews.odb
                        .select("expand(out('ArticleHasJournalist'))")
                        .from('Article')
                        .where({ '@rid': article['@rid'] })
                        .all()
                        .then(function(data) {
                            if (data && data.length) {
                                data[0]['@rid'] = Mynews.RID.Build(data[0]['@rid']);
                                if (filter.raw) {
                                    done(e, data[0]);
                                } else {
                                    done(e, new Journalist(data[0]));
                                }
                            } else {
                                done(null, []);
                            }
                        })
                        .catch(cb);
                },
                rating: function(done) {
                    article.get_rating(function(e, rating) {
                        if (e) {
                            done(e);
                        } else {
                            done(null, rating);
                        }
                    });
                }
            },function(errors, results) {
                if (errors) {
                    cb(errors, false);
                } else {
                    article.rating = results.rating;
                    article.publisher = results.publisher;
                    article.journalist = results.journalist;
                    cb(null, article);
                }
            });
        }
    });
},

/**
 * Find within all articles
 *
 * @param   Obj         filters     Finder Filters
 * @param   Func        cb          Completion Callback
 */
Article.FindAll = function(filters, cb) {
    Model.FindAll(this, filters, cb);
},

/**
 * Create an article
 *
 * @param   Obj         props   Object Properties
 * @param   Func        cb      Completion Callback
 */
Article.Create = function(props, cb) { 
    Model.Create(this, props, function(e, obj) {
        try {
            if (!e && obj && obj['@rid']) {
                ArticlePublisher.publish('new_article', obj['@rid']);
                cb(e, obj);
            } else {
                cb(e, obj);
            }
        }
        catch(e) {
            console.log('Article.Create Error', e);
        }
    });
}

module.exports = Article;

// -------------------------
//   Circular Dependencies
// -------------------------

/**
 * Why are these dependancies down here?
 *   Answer: Fixes a Node.js Circular dependancy problem
 */

// Models
var Tag                 = require('./tag');
var Publisher           = require('./publisher');
var Journalist          = require('./journalist');
var Comment             = require('./comment');
var ArticleFact         = require('./article_fact');
var ArticleStatement    = require('./article_statement');