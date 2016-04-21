// ----------------
//   Dependancies
// ----------------

var Time        = require('time');
var UUID        = require('node-uuid');
var TokenStore  = require('./token_store').TokenStore;
var User        = require('../models/user');

/**
 * Utilities Object
 */
var Tokens = function() { }

/**
 * Lookup a token and check its validity
 *
 * @param    string    str    Token string
 * @return   obj              Object with token data
 **/
Tokens.prototype.Authenticate = function(str, callback) {
    if (!str) {
        var token = { is_valid: false };
        return callback(token);
    }
    TokenStore.get('token_' + str, function(error, token) {
        if (error) {
            console.log(error);
            var token = { is_valid: false };
        }

        var token = JSON.parse(token);

        var now = parseInt(new Time.Date().getTime() / 1000);
        if (token && token.expires && token.expires > now) {
            token.is_valid = true;
        } else if (token && token.expires && token.expires <= now) {
            TokenStore.del('token_' + str); // Untested
        } else {
            var token = { is_valid: false };
        }

        callback(token);
    });
}

/**
 * Issue a token for the user
 *
 * @param    string    str    Token string
 * @return   obj              Object with token data
 **/
Tokens.prototype.Issue = function(user) {
    var now = parseInt(new Time.Date().getTime() / 1000);
    var token_id = UUID.v4();

    var token = {
        issued: now,
        expires: (3600 * 48) + now,
        user: user
    }

    TokenStore.setex('token_' + token_id.toString(), 3600 * 48, JSON.stringify(token));

    return token_id.toString();
}

/**
 * Issue a token for anonymous web user
 *
 * @param    string    str    Token string
 * @return   obj              Object with token data
 **/
Tokens.prototype.IssueAnonymous = function() {
    var now = parseInt(new Time.Date().getTime() / 1000);
    var token_id = UUID.v4();

    var token = {
        issued: now,
        expires: (3600 * 48) + now,
        user: {
            permissions: {
                'article.api_get': true,
                'publisher.api_get': true,
                'journalist.api_get': true,
                'tag.api_get': true
            }
        }
    }

    TokenStore.setex('token_' + token_id.toString(), 3600 * 48, JSON.stringify(token));

    return token_id.toString();
}

/**
 * Sync Token Data
 *   - Ensures token data is up to date
 *
 * @param    obj       user_id  User data to sync
 * @param    obj       token    Token string
 * @param    func      cb       Completion Callback
 * @return   obj                Object with token data
 **/
Tokens.prototype.Sync = function(user_id, token, cb) {
    if (!cb) {
        cb = function() {};
    }
    User.Find({ where: { '@rid': user_id }}, function(e, user) {
        if (e) {
            console.log(e);
            return cb(false);
        }
        user.get_feed_settings(function(e, settings) {
            if (e) {
                console.log(e);
                return cb(false);
            } else {
                try {
                    user.settings = settings;

                    TokenStore.get('token_' + token, function(error, data) {
                        if (error) {
                            console.log(error);
                            return cb(false);
                        }

                        var data = JSON.parse(data);
                        var new_expiry = data.expires - parseInt(new Time.Date().getTime() / 1000);

                        if (new_expiry < 0) {
                            return cb(false);
                        } else {
                            data.user = user;
                        }

                        //console.log('Token Sync', token);
                        //console.log(data);

                        TokenStore.setex('token_' + token, data.expires, JSON.stringify(data));

                        cb(true);
                    });
                }
                catch(e) {
                    console.log(e);
                }
            }
        });
    });
}

module.exports = new Tokens();
