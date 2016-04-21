'use strict';

// ----------------
//   Dependencies
// ----------------

var db = require('./database/database.js');

module.exports = {

    // --
    // Common Config
    // --

    Config: require('./config.json'),

    // --
    // Common Models
    // --

    Models: require('./models'),

    // --
    // Raw Database
    // --

    Database: db,

    // --
    // Public Assets
    // --

    Assets: {
        Angular: require('./assets/angular'),
        Images: require('./assets/images')
    },

    // --
    // Auth Functions
    // --

    Auth: {
        Tokens: require('./auth/tokens'),
        TokenStore: require('./auth/token_store').TokenStore
    }

}