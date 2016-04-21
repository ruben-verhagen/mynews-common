// ----------------
//   Dependencies
// ----------------

var Model       = require('./model');
var Mynews       = require('../database/database');

// ----------------
//   Definition
// ----------------

var SourceFeed = function(data) {
    this._load(data);
}

// Inherit from Model
SourceFeed.prototype.__proto__ = Model.prototype;

SourceFeed.prototype['@class'] = SourceFeed['@class'] = 'SourceFeed';

SourceFeed.prototype.properties = {
    "@rid":                 Model.Type.RID(),
    "title":                Model.Type.STRING(true, 0, 255),
    "url":                  Model.Type.URL(true),
    "endpoint":             Model.Type.URL(true),
    "slug":                 Model.Type.STRING(false, 0, 512),
    "creation_date":        Model.Type.LONG(false),
    "modification_date":    Model.Type.LONG(false)
}

/**
 * Get Publisher of this SourceFeed
 *
 * @param   Function    cb     Completion Callback
 */
SourceFeed.prototype.get_publisher = function(cb) {
    Mynews.odb
        .select("expand(out('SourceFeedOfPublisher'))")
        .from('SourceFeed')
        .where({ '@rid': this['@rid'] })
        .all()
        .then(function(data) {
            if (data && data[0]) {
                data[0]['@rid'] = Mynews.RID.Build(data[0]['@rid']);
                cb(null, new Publisher(data[0]));
            } else {
                cb(null, false);
            }
        })
        .catch(cb);
}

/**
 * Set Publisher of this SourceFeed
 *
 * @param   Publisher   publisher   Publisher Object
 * @param   Function    cb          Completion Callback
 */
SourceFeed.prototype.set_publisher = function(publisher, cb) {
    Mynews.odb
        .edge
        .from(this['@rid'])
        .to(publisher['@rid'])
        .create('SourceFeedOfPublisher')
        .then(function(data) {
            cb(null, true);
        })
        .catch(cb);
}

/**
 * Get the slug base value
 *
 * @returns String   string that will be used as base value for generating slug
 */
SourceFeed.prototype._get_slug_base_string = function(){
    return this['title'];
}

/**
 * Find a single sourcefeed
 *
 * @param   String      filters         filters
 * @param   Func        cb              Completion Callback
 */
SourceFeed.Find = function(filter, cb) {
    Model.Find(this, filter, cb);
},

/**
 * Find within all sourcefeeds
 *
 * @param   Obj         filters     sourcefeed Filters
 * @param   Func        cb          Completion Callback
 */
SourceFeed.FindAll = function(filters, cb) {
    Mynews.odb
        .select(Model._select(filters.select))
        .from('SourceFeed')
        .where(Model._where(filters.where))
        .limit(9999)
        .all()
        .then(function(data) {
            if (data.length) {
                var results = [];
                var publisher_ids = [];

                for (var i in data) {
                    data[i]['@rid'] = Mynews.RID.Build(data[i]['@rid']);
                    data[i].out_SourceFeedOfPublisher = Mynews.RID.Build(data[i].out_SourceFeedOfPublisher);

                    var feed = new SourceFeed(data[i]);

                    if (data[i].out_SourceFeedOfPublisher) {
                        feed.publisher = data[i].out_SourceFeedOfPublisher;
                        publisher_ids.push( data[i].out_SourceFeedOfPublisher );
                    }

                    results.push(feed);
                }

                Publisher.FindAll({ where: { '@rid': publisher_ids } }, function(e, pubs) {
                    if (e) {
                        cb(e, null);
                    } else {
                        var pub_index = {};
                        pubs.forEach(function(pub) {
                            pub_index[pub['@rid']] = pub;
                        });

                        results.forEach(function(feed) {
                            if (feed.publisher) {
                                feed.publisher = pub_index[ feed.publisher ];
                            }
                        });

                        cb(null, results);
                    }
                });
            } else {
                cb(null, []);
            }
        })
        .catch(cb)
},

/**
 * Create a SourceFeed
 *
 * @param   Obj         props   Object Properties
 * @param   Func        cb      Completion Callback
 */
SourceFeed.Create = function(props, cb) {
    Model.Create(this, props, cb);
}

module.exports = SourceFeed;

// -------------------------
//   Circular Dependencies
// -------------------------

/**
 * Why are these dependancies down here?
 *   Answer: Fixes a Node.js Circular dependancy problem
 */

// Models
var Publisher           = require('./publisher');
