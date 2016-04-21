// Config
var Config = require('../config.json');

// Redis
var Redis = require('redis');
var RedisStore = Redis.createClient(Config.redis.port, Config.redis.host);

module.exports = {
    TokenStore: RedisStore
}
