// ----------------
//   Dependencies
// ----------------

var Model       = require('./model');
var Mynews       = require('../database/database');
var Async       = require('async');

// ----------------
//   Definition
// ----------------

var Comment = function(data) {
    this._load(data);
}

// Inherit from Model

Comment.prototype.__proto__ = Model.prototype;
Comment.prototype['@class'] = Comment['@class'] = 'Comment';

Comment.prototype.properties = {
    "@rid":                 Model.Type.RID(),
    "body":                 Model.Type.STRING(true, 0, 102400),
    "type" :                Model.Type.SHORT(true),
    "creation_date":        Model.Type.LONG(false),
    "modification_date":    Model.Type.LONG(false),
}

// --
// Private Instance Methods
// --

/**
 * Vote a Comment by User
 *
 * @param User          user        User Object
 * @param short         rating      Value of Voting ('-1' = down; 1-Up)
 * @param Func          cb          Completion Callback
 */
Comment.prototype.vote = function(voting, user_id, cb) {
    var that = this;

    Mynews.odb
        .select()
        .from('UserVoteComment')
        .where({ out: user_id, 'in': this['@rid'] })
        .all()
        .then(function(data) {

            if (data && data.length > 0) {

                // --
                // Existing Vote
                // --

                // Delete old edge
                Mynews.odb
                    .edge
                    .from(user_id)
                    .to(that['@rid'])
                    .delete()
                    .then(function(data) {
                        // Create the replacement
                        Mynews.odb.query(
                            "CREATE EDGE UserVoteComment FROM " + user_id + " TO " + that['@rid'] + " SET voting = :vote",
                            { params: { vote: voting }}
                        )
                            .then(function(data) {
                                if (data && data.length) {
                                    cb(false, 'Updated');
                                } else {
                                    cb(null, false);
                                }
                            })
                            .catch(function(e) {
                                console.log(e);
                                cb(e);
                            });

                    })
                    .catch(function(e) {
                        console.log(e);
                        cb(e);
                    });

            } else {

                // --
                // New Vote
                // --

                Mynews.odb.query(
                    "CREATE EDGE UserVoteComment FROM " + user_id + " TO " + that['@rid'] + " SET voting = " + voting,
                    { params: { vote: voting }}
                )
                    .then(function(data) {
                        if (data && data.length) {
                            cb(false, 'Voted');
                        } else {
                            cb(null, false);
                        }
                    })
                    .catch(function(e) {
                        console.log(e);
                        cb(e);
                    });

            }
        })
        .catch(function(e) {
            console.log(e);
            cb(e);
        });
},

/**
 * Get user voring of this Comment
 *
 * @param   Func          cb   Completion Callback
 */
Comment.prototype.get_votes = function(cb, a, b) {
    Mynews.odb
        .select('count(*) AS total, sum(voting) AS effective')
        .from('UserVoteComment')
        .where({ 'in': this['@rid'] })
        .all()
        .then(function(data) {
            var votes = {
                effective: 0,
                total: 0,
                downVotes: 0,
                upVotes: 0
            };

            if (data && data.length > 0) {
                votes.effective = data[0].effective ? data[0].effective : 0;
                votes.total = data[0].total ? data[0].total : 0;
                votes.downVotes = (votes.total - votes.effective) / 2;
                votes.upVotes = votes.total - votes.downVotes;
            }

            cb(null, votes);
        })
        .catch(cb);
},

/** 
 * Attach Metadata for current comment  
 * 
 * @param   Func        cb      Completion Callback
 * @param   MetaData    meta    (this can be either publisher, journalist or article ,user)
 * @returns returns 
 */
Comment.prototype._attach_meta = function(meta,cb) {
    var db_query = "";
    var err= "";

    switch (this['type']) {
        case Comment.Type.PUBLISHER:
            if (meta['@class'] != "Publisher") {
                err= true;
                break;
            }
            db_query = 'CREATE EDGE PublisherHasComment FROM ' + meta['@rid'] + ' TO ' + this['@rid'];
            break;
        case Comment.Type.JOURNALIST:
            if (meta['@class'] != "Journalist") {
                err= true;
                break;
            }
            db_query = 'CREATE EDGE JournalistHasComment FROM ' + meta['@rid'] + ' TO ' + this['@rid'];
            break;
        case Comment.Type.ARTICLE:
            if (meta['@class'] != "Article") {
                err= true;
                break;
            }
            db_query = 'CREATE EDGE ArticleHasComment FROM ' + meta['@rid'] + ' TO ' + this['@rid'];
            break;
        default:
            err = true;
    }

    if (err) {
        cb(err, false);
    } else {
        Mynews.odb.query(
            db_query
        )
            .then(function(data) {
                cb(false, true)
            })
            .catch(cb);
    }
}

/** 
 * detach MetaData for current comment   
 * 
 * @param   Func        cb      Completion Callback
 * @param   MetaData	meta 	(this can be either publisher, journalist or article ,user) 
 * @returns returns 
 */
Comment.prototype._detach_meta = function(meta,cb) {
    var db_query = "";
    var err= "";

    switch (this['type']) {
        case Comment.Type.PUBLISHER:
            if (meta['@class'] != "Publisher") {
                err= true;
                break;
            }
            db_query = 'DELETE EDGE FROM ' + meta['@rid'] + ' TO ' + this['@rid'] + ' PublisherHasComment';
            break;
        case Comment.Type.JOURNALIST:
            if (meta['@class'] != "Journalist") {
                err= true;
                break;
            }
            db_query = 'DELETE EDGE FROM ' + meta['@rid'] + ' TO ' + this['@rid'] + ' JournalistHasComment';
            break;
        case Comment.Type.ARTICLE:
            if (meta['@class'] != "Article") {
                err= true;
                break;
            }
            db_query = 'DELETE EDGE FROM ' + meta['@rid'] + ' TO ' + this['@rid'] + ' ArticleHasComment';
            break;
        default:
            err = true;
    }
    if (err) {
        cb(err, false);
    } else {

        Mynews.odb.query(
            db_query
        )
            .then(function(data) {
                cb(false, true)
            })
            .catch(cb);
    }
}

/** 
 * get MetaData for current comment   
 * 
 * @param   Func        cb      Completion Callback
 * @param   MetaData	meta 	(this can be either publisher, journalist or article , user ) 
 * @returns returns 
 */
Comment.prototype._get_meta = function(cb) {
    var db_query = "SELECT expand(in('ArticleHasComment')) from Comment WHERE @rid=" + this['@rid'];
    var Owner = Article;

    this.owner = false;

    var that = this;

    switch (this['type']) {
        case Comment.Type.PUBLISHER:
            db_query = "SELECT expand(in('PublisherHasComment')) from Comment WHERE @rid=" + this['@rid'];
            Owner = Publisher;
            break;

        case Comment.Type.JOURNALIST:
            db_query = "SELECT expand(in('JournalistHasComment')) from Comment WHERE @rid=" + this['@rid'];
            Owner = Journalist;
            break;

        default:
            db_query = "SELECT expand(in('ArticleHasComment')) from Comment WHERE @rid=" + this['@rid'];
            Owner = Article;
    }

    Mynews.odb.query(
        db_query
    )
        .then(function(data) {
            if (data && data.length) {
                data[0]['@rid'] = Mynews.RID.Build(data[0]['@rid']);
                cb(false, new Owner(data[0]));
                return;
            } else {
                cb(false, false);
                return;
            }
        })
        .catch(function(e) {
            console.log(e);
            cb(e, false);
        });
}

// --
// Instance Methods
// --

/** 
 * get MetaData for current comment   (Recursively look for parent)
 * 
 * @param   Func        cb      Completion Callback
 * @param   MetaData	meta 	(this can be either publisher, journalist or article , user ) 
 * @returns returns 
 */
Comment.prototype.get_meta = function(cb) {
    this._get_meta(cb);
}

/** 
 * fetch MetaData (whether this comment is attached to publisher, journalist or article , user)  
 * 
 * @param   Func        cb      Completion Callback
 * @returns returns 
 */
Comment.prototype.fetch_meta = function(cb) {
    var that = this;
    this._get_meta(function(e, meta) {
        if (e) {
            cb(e,that);
        } else {
            that.owner = meta;
            cb(e,that);
        }
    });
}

/**
 * Set Parent Comment
 *
 * @param   Comment     parent      Parent Comment
 * @param   Func        cb          Completion Callback
 */
Comment.prototype.set_parent_comment = function(parent,cb) {
    var that = this;

    this.get_parent_comment(function (err, p_comment) {
        if (err) {
            cb(err, {});
        } else {
            if (p_comment) {
                cb(true, false);
            } else {
                Mynews.odb
                    .edge
                    .from(parent['@rid'])
                    .to(that['@rid'])
                    .create('CommentHasChildComments')
                    .then(function(data) {
                        cb(false, false);
                    })
                    .catch(cb);
            }
        }
    });
}

/**
 * Get Parent Comment
 *
 * @param Func          cb          Completion Callback
 */
Comment.prototype.get_parent_comment = function(cb) {
    Mynews.odb
        .select("expand(in('CommentHasChildComments'))")
        .from('Comment')
        .where({ '@rid': this['@rid'] })
        .all()
        .then(function(data) {
            if (data && data.length) {
                data[0]['@rid'] = Mynews.RID.Build(data[0]['@rid']);

                if (data[0]['in_UserHasComment']) {
                    data[0]['in_UserHasComment'] = Mynews.RID.Build(data[0]['in_UserHasComment']);
                }
                if (data[0]['in_PublisherHasComment']) {
                    data[0]['in_PublisherHasComment'] = Mynews.RID.Build(data[0]['in_PublisherHasComment']);
                }
                if (data[0]['in_JournalistHasComment']) {
                    data[0]['in_JournalistHasComment'] = Mynews.RID.Build(data[0]['in_JournalistHasComment']);
                }
                if (data[0]['in_ArticleHasComment']) {
                    data[0]['in_ArticleHasComment'] = Mynews.RID.Build(data[0]['in_ArticleHasComment']);
                }

                cb(false, new Comment(data[0]));
            } else {
                cb(false, false);
            }
        })
        .catch(cb);
}

/**
 * Get Child Comments
 *
 * @param Func          cb          Completion Callback
 */
Comment.prototype.get_child_comments = function(cb) {
    Mynews.odb
        .select("expand(out('CommentHasChildComments'))")
        .from('Comment')
        .where({ '@rid': this['@rid'] })
        .all()
        .then(function(data) {
            if (data.length) {
                var results = [];
                for (var i in data) {
                    data[i]['@rid'] = Mynews.RID.Build(data[i]['@rid']);
                    results.push(new Comment(data[i]));
                }

                cb(false, results);
            } else {
                cb(false, []);
            }
        })
        .catch(cb);
}

/**
 * Get Child Comments
 *
 * @param   bool    option      (this can be updated to array later) it indicates get all child comments recursively or not
 * @param   Func    cb          Completion Callback
 */
Comment.prototype.fetch_child_comments= function(option, cb) {
    var that = this;

    if (!option) {
        this.get_child_comments( function (e, comments) {
            if (e) {
                that.child_comments = null;
                cb(e,that);
            } else {
                that.child_comments = comments;
                cb(null, that);
            }
        });
        return;
    }

    //Recursively
    that.child_comments = [];

    Async.series({
        itself: function(callback) {
            that.get_child_comments( function (e, comments) {
                if (e) {
                    that.child_comments = null;
                    callback(e);
                } else {
                    that.child_comments = comments;
                    callback();
                }
            });
        },
        child_comments: function(callback) {
            if (that.child_comments.length > 0) {
                Async.each(that.child_comments,
                    function(comment, callback1) {
                        comment.fetch_child_comments(true, function(err,result) {
                                if (err) {
                                    callback1(err);
                                } else {
                                    callback1();
                                }
                            });
                    },
                    function(err) {
                        if (err) {
                            callback(err);
                        } else {
                            callback();
                        }
                    }
                );
            } else {
                callback();
            }
        }
    }, function(err) {
        if (err) {
            cb(err,that);
        } else {
            cb(false, that);
        }
    });
}

/**
 * Delete all child comments recursively and delete itself
 *
 * @param   Func    cb          Completion Callback
 */
Comment.prototype.delete = function(cb) {
    this.body = 'deleted';
    this.save(cb);
}

// --
// Public Helpers
// --

/** 
 * Helper to check owner exists for certain comment type. 
 * 
 * @param   Func        cb          Completion Callback
 * @param   Int         type        type of comment
 * @param   RID         owner_id    RID of owner to be checked (this can be id of either publisher, journalist or article ,user)
 * @returns returns
 */
Comment.CheckOwnerType = function(type, owner_id, cb) {
    Owner = null;
    err = false;
    switch (type) {
        case Comment.Type.PUBLISHER:
            Owner = Publisher;
            break;
        case Comment.Type.JOURNALIST:
            Owner = Journalist;
            break;
        case Comment.Type.ARTICLE:
            Owner= Article;
            break;
        default:
            err = true;
    }

    if (err) {
        cb (err, false);
    } else {
        Owner.Find({ where: { '@rid': owner_id }}, function(e, owner) {
            if (e) {
                cb(e, false);
            } else {
                cb(false, owner);
            }
        });
    }
}

/**
 * Find a single comment
 *
 * @param   String      filters      filters
 * @param   Func        cb      Completion Callback
 */
Comment.Find = function(filter, cb) {
    Model.Find(this, filter, function (e,comment) {
        if (e || !comment ) {
            cb(e, comment);
        } else {
            Async.parallel({
                Parent: function(callback) {
                    comment.get_parent_comment(function(e, result_parent) {
                        if (e) {
                            callback(e);
                        } else if (result_parent) {
                            comment.parent_id = result_parent['@rid'];
                        } else {
                            comment.parent_id = null;
                        }
                        callback();
                    });
                },
                Owner: function(callback) {
                    comment._get_meta(function(e, meta) {
                        if (e) {
                            callback(e)
                        } else {
                            comment.owner_id = meta['@rid'];
                            callback();
                        }
                    });
                },
                Vote: function(callback) {
                    comment.get_votes(function(e, votes) {
                        if (e) {
                            callback(e)
                        } else {
                            comment.votes = votes;
                            callback();
                        }
                    });
                }
            }, function(err) {
                if (err) {
                    cb(err, comment);
                } else {
                    cb(null, comment);
                }
            });
        }
    });
},

/**
 * Find within all comments
 *
 * @param   Obj         filters     Finder Filters
 * @param   Func        cb          Completion Callback
 */
/*
Comment.FindAll = function(filters, cb) {
    Model.FindAll(this, filters, cb);
},
*/

/**
 * Find recent comments
 *   
 *   this function needs to be deleted when Model.FindALL is updated.
 * 
 *   @param   Func        cb          Completion Callback
 */
/*Comment.FindRecent = function(filters, cb) {
    Mynews.db.query(
        'SELECT FROM Comment ' +
        'GROUP BY @rid ' +
        'ORDER BY creation_date DESC' +
        'LIMIT 20'
    )
        .then(function(data) {
            if (data.result.length) {
                var results = [];
                for (var i in data.result){
                    results.push(new Comment(data.result[i]));
                }
                cb(null, results);
            } else {
                cb(null, []);
            }
        }, function(error) {
            cb(error, false);
        });
},*/

/**
 * Create an comment
 *
 * @param   Obj         props   Object Properties
 * @param   Func        cb      Completion Callback
 */
Comment.Create = function(props, cb) {
    var user_id = false;
    var owner_id = false;
    var parent_id = false;

    var owner = false;
    var parent = false;

    if (props.user_id) {
        user_id = props.user_id;
        delete props.user_id;
    } else {
        return cb(true, null);
    }

    if (props.parent_id) {
        parent_id = props.parent_id;
        delete props.parent_id;
    }

    if (props.owner_id) {
        owner_id = props.owner_id;
        delete props.owner_id;
    } else {
        return cb(true, null);
    }

    var that = this;

    Async.series({
        ParentCheck: function(callback) {
            if (parent_id) {
                Comment.Find({ where: { '@rid': parent_id } }, function(e, result_parent) {
                    if (e) {
                        callback(e);
                    } else {
                        parent = result_parent;
                        callback();
                    }
                });
            } else {
                callback();
            }
        },
        OwnerCheck: function(callback) {
            Comment.CheckOwnerType(props.type ,owner_id, function (e, result_owner){
                if (e) {
                    callback(e);
                } else {
                    owner = result_owner;
                    callback();
                }
            });
        }
    }, function(err) {
        if (err) {
            cb(err);
        } else {
            Model.Create(that, props, function (e,comment) {
                if (e) {
                    cb(e, comment)
                } else {
                    Mynews.odb
                        .edge
                        .from(user_id)
                        .to(comment['@rid'])
                        .create('UserHasComment')
                        .then(function(data) {
                            Async.parallel({
                                Parent: function(callback) {
                                    if (parent) {
                                        comment.set_parent_comment(parent,function (e, result) {
                                            if (e) {
                                                callback(e);
                                            } else {
                                                comment.parent_id = parent_id;
                                                callback();
                                            }
                                        });
                                    } else {
                                        callback();
                                    }
                                },
                                Owner: function(callback) {
                                    if (owner) {
                                        comment._attach_meta(owner,function (e, result) {
                                            if (e) {
                                                callback(e);
                                            } else {
                                                comment.owner_id = owner_id;
                                                callback();
                                            }
                                        });
                                    } else {
                                        callback();
                                    }
                                }
                            }, function(err) {
                                if (err) {
                                    cb(err, comment);
                                } else {
                                    cb(false, comment);
                                }
                            });
                        })
                        .catch(cb);
                }
            });
        }
    });
}

// --
// Static Properties
// --

Comment.Type = {
    ARTICLE : 0,
    PUBLISHER : 1,
    JOURNALIST : 2
}

module.exports = Comment;

// -------------------------
//   Circular Dependencies
// -------------------------

/**
 * Why are these dependancies down here?
 *   Answer: Fixes a Node.js Circular dependancy problem
 */

// Models
var Publisher           = require('./publisher');
var Journalist          = require('./journalist');
var Article             = require('./article');
var User                = require('./user');