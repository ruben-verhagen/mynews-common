// ----------------
//   Dependencies
// ----------------

var Model       = require('./model');
var Mynews       = require('../database/database');

// ----------------
//   Definition
// ----------------

var ArticleStatement = function(data) {
    this._load(data);
}

// Inherit from Model
ArticleStatement.prototype.__proto__ = Model.prototype;

ArticleStatement.prototype['@class'] = ArticleStatement['@class'] = 'ArticleStatement';

ArticleStatement.prototype.properties = {
    "@rid":              Model.Type.RID(),
    "note":              Model.Type.STRING(true, 0, 1024),
    "type":              Model.Type.ENUM(false, ['immediate', 'contextual']),
    "creation_date":     Model.Type.LONG(false),
    "modification_date": Model.Type.LONG(false)
}

ArticleStatement.properties = ArticleStatement.prototype.properties;

// --
// Public Helpers
// --

/**
 * Find a single ArticleStatement
 *
 * @param   String      filters     filters
 * @param   Func        cb          Completion Callback
 */
ArticleStatement.Find = function(filter, cb) {
    if (typeof filter.where.article_id != 'undefined') {
        delete filter.where.article_id;
    }

    Mynews.odb
        .select( Model._select(filter.select) )
        .from('ArticleStatement')
        .where( Model._where(filter.where) )
        .all()
        .then(function(data) {
            if (data.length) {
                data[0]['@rid'] = Mynews.RID.Build(data[0]['@rid']);
                cb(null, new ArticleStatement(data[0]));
            } else {
                cb(null, false);
            }
        })
        .catch(cb);
},

/**
 * Find within all ArticleStatement
 *
 * @param   Obj         filters     ArticleStatement Filters
 * @param   Func        cb          Completion Callback
 */
ArticleStatement.FindAll = function(filters, cb) {
    throw new Error('Not Implemented: ArticleStatement.FindAll()');
},

/**
 * Create an ArticleStatement
 *
 * @param   Obj         props       Object Properties
 * @param   Func        cb          Completion Callback
 */
ArticleStatement.Create = function(props, cb) {
    var article_id = false;
    if (!props.article_id) {
        throw new Error('ArticleStatement.Create() requires an :article_id be set.');
    }

    Model.Create(this, props, function(e, statement) {
        if (e || !statement) {
            cb(e, false);
        } else {
            Mynews.odb
                .edge
                .from(props.article_id)
                .to(statement['@rid'])
                .create('ArticleHasStatement')
                .then(function(data) {
                    cb(null, statement);
                })
                .catch(cb);
        }
    });
}

module.exports = ArticleStatement;