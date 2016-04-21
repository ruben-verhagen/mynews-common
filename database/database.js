'use strict';

// ----------------
//   Dependencies
// ----------------

var _           = require('underscore');
var Oriento     = require('oriento');

// Database connection
var ors, odb;

// Create OrientDB connection
var connect = function(config, next) {
    // Check "config.orientdb" existance
    var cfg = (config.orientdb) ? config.orientdb: {};

    ors = module.exports.ors = Oriento({
        host: cfg.serverHost,
        port: cfg.serverPortBinary,
        username: cfg.serverUsername,
        password: cfg.serverPassword,
        logger: {
            debug: (cfg.do_logging) ? console.log.bind(console) : false
        }
    });

    odb = module.exports.odb = ors.use({
        name: cfg.databaseName,
        username: cfg.serverUsername,
        password: cfg.serverPassword
    });

    next()
};

var escape = function(text) {
  text = _.escape(text);

  return text;
};

/**
 * @rid Utilities Object
 */
var RID = {

    /**
     * Encodes an OrientDB @rid for use in urls.
     *
     * @param   String    rid     RID Value (Eg. #30:1)
     * @returns String
     */
    Encode: function(rid) {
        if (rid) {
            return rid.replace('#', '').replace(':', '.');
        } else {
            return false;
        }
    },

    /**
     * Decodes an OrientDB @rid from use in urls.
     *
     * @param   String    rid     RID Value in URL format (Eg. 30.1)
     * @returns String
     */
    Decode: function(rid) {
        if (rid) {
            return '#' + rid.replace('.', ':');
        } else {
            return false;
        }
    },

    /**
     * Build a string representation of @rid from
     * and Oriento @rid object.
     *
     * @param obj   rid     Oriento @rid object.
     */
    Build: function(rid) {
        return '#' + rid.cluster + ':' + rid.position;
    }

}

module.exports = {
    connect: connect,
    RID: RID,
    escape: escape
};
