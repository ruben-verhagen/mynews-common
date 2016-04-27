// ----------------
//   Dependencies
// ----------------

var Model       = require('./model');
var db          = require('../database/database');

// ----------------
//   Definition
// ----------------

var Tag = function(data) {
    this._load(data);
}

// Inherit from Model
Tag.prototype.__proto__ = Model.prototype;

Tag.prototype['@class'] = Tag['@class'] = 'Tag';

Tag.prototype.properties = {
    "@rid":                     Model.Type.RID(),
    "name":                     Model.Type.STRING(true,0,255),
    "type_group":               Model.Type.STRING(true, 0, 50),
    "type":                     Model.Type.STRING(false, 0, 50),
    "slug":                     Model.Type.STRING(false, 0, 512),
    "creation_date":            Model.Type.LONG(false),
    "modification_date":        Model.Type.LONG(false)
}

// --
// Private Instance Methods
// --

/**
 * Get the slug base value
 *
 * @returns String   string that will be used as base value for generating slug
 */
Tag.prototype._get_slug_base_string = function() {
    return this['name'];
},

// --
// Public Helpers
// --

/**
 * Find a single tag
 *
 * @param   String      filters      filters
 * @param   Func        cb      Completion Callback
 */
Tag.Find = function(filter, cb) {
    Model.Find(this, filter, cb);
},

/**
 * Find within all tags
 *
 * @param   Obj         filters     Tag Filters
 * @param   Func        cb          Completion Callback
 */
Tag.FindAll = function(filters, cb) {
    Model.FindAll(this, filters, cb);
},

/**
 * Create a tag
 *
 * @param   Obj         props   Object Properties
 * @param   Func        cb      Completion Callback
 */
Tag.Create = function(props, cb) {
    Model.Create(this, props, cb);
}

/**
 * Find or Create a tag
 *
 * @param   Obj         props   Object Properties
 * @param   Func        cb      Completion Callback
 */
Tag.FindOrCreate = function(props, cb) {
    var that = this;

    // Check if the tag with same name and type already exists
    Tag.Find({ where: {
        name: props['name'],
        type_group: props['type_group'],
        type: props['type']
    }}, function (e, tag) {
        // if not exists, create
        if (e || !tag) {
            Model.Create(that, props, cb);
        } else {
            cb(null, tag);
        }
    });
}

module.exports = Tag;