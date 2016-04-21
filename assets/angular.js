'use strict';

// ----------------
//   Dependencies
// ----------------

var fs                          = require('fs');

// --
// Stored Stuff
// --

var assets = {
    js: [],
    css: []
}

// --
// Helpers
// --

var crawl = function(dir, type) {
    var root = fs.readdirSync(dir);
    for (var i in root) {
        var file = dir + '/' + root[i];
        var meta = fs.statSync(file);
        if (meta && meta.isDirectory()) {
            crawl(file, type);
        } else {
            assets[type].push( file.replace('./public', '') );
        }
    }
}

// --
// Init
// --

crawl(__dirname + '/public/js/models', 'js');
crawl(__dirname + '/public/js/services', 'js');

module.exports = {

    /**
     * Copy the library to the parent project.
     */
    Import: function(dir) {
        for (var i in assets.js) {
            var filename = assets.js[i].split('/');
            filename = filename[ filename.length - 1 ];

            if (!fs.existsSync(dir + filename)) {
                console.log('Importing:', dir + filename);
                fs.createReadStream(assets.js[i]).pipe(fs.createWriteStream(dir + filename));
            }
        }
    },

    /**
     * Return an array of assets
     *
     * @return   array              Array of assets
     **/
    GetAssets: function() {
        return assets.js;
    }
}