// ----------------
//   Dependencies
// ----------------

// --
// Register your models here:
// --
var models = [
    'Model',
    'User',
    'Article',
    'Article_Fact',
    'Article_Statement',
    'Comment',
    'Journalist',
    'Journalist_Background',
    'Tag',
    'User_Profile',
    'User_Background',
    'Publisher',
    'Group',
    'User_FeedSettings',
    'Source_Feed'
];


models.forEach(function(model) {
    module.exports[model.replace(/_/g, '')] = require(__dirname + '/' + model.toLowerCase());
});


(function(m) {

    // Post Op Work...

})(module.exports);
