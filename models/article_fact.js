// ----------------
//   Dependencies
// ----------------

var Model       = require('./model');
var Mynews       = require('../database/database');

// ----------------
//   Definition
// ----------------

var ArticleFact = function(data) {
    this._load(data);
}

// Inherit from Model
ArticleFact.prototype.__proto__ = Model.prototype;

ArticleFact.prototype['@class'] = ArticleFact['@class'] = 'ArticleFact';

ArticleFact.prototype.properties = {
    "@rid":              Model.Type.RID(),
    "note":              Model.Type.STRING(true, 0, 1024),
    "type":              Model.Type.ENUM(false, ['immediate', 'contextual']),
    "creation_date":     Model.Type.LONG(false),
    "modification_date": Model.Type.LONG(false)
}

ArticleFact.properties = ArticleFact.prototype.properties;

// --
// Public Helpers
// --

/**
 * Find a single ArticleFact
 *   - Note: Requires an Article ID be set via: filter.where.article_id
 *
 * @param   String      filters      filters
 * @param   Func        cb      Completion Callback
 */
ArticleFact.Find = function(filter, cb) {
    if (typeof filter.where.article_id != 'undefined') {
        delete filter.where.article_id;
    }

    Mynews.odb
        .select( Model._select(filter.select) )
        .from('ArticleFact')
        .where( Model._where(filter.where) )
        .all()
        .then(function(data) {
            if (data.length) {
                data[0]['@rid'] = Mynews.RID.Build(data[0]['@rid']);
                cb(null, new ArticleFact(data[0]));
            } else {
                cb(null, false);
            }
        })
        .catch(cb);
},

/**
 * Find within all ArticleFact
 *
 * @param   Obj         filters     ArticleFact Filters
 * @param   Func        cb          Completion Callback
 */
ArticleFact.FindAll = function(filters, cb) {
    throw new Error('Not Implemented: ArticleFact.FindAll()');
},

/**
 * Create a ArticleFact
 *
 * @param   Obj         props       Object Properties
 * @param   Func        cb          Completion Callback
 */
ArticleFact.Create = function(props, cb) {
    var article_id = false;
    if (!props.article_id) {
        throw new Error('ArticleFact.Create() requires an :article_id be set.');
    }

    Model.Create(this, props, function(e, fact) {
        if (e || !fact) {
            cb(e, false);
        } else {
            Mynews.odb
                .edge
                .from(props.article_id)
                .to(fact['@rid'])
                .create('ArticleHasFact')
                .then(function(data) {
                    cb(null, fact);
                })
                .catch(cb);
        }
    });
}

module.exports = ArticleFact;