mynews-common
=========

Common code for all other MyNews projects

Testing
----

Summarized:

    grunt test

Full Report:

    grunt test_report

Registering Models
----

Models should be registered in the file: /models/index.php

When registering models, two-word model names should be broken up with an underscore.

Example:

```javascript
var models = [
    'Model',
    'User',
    'Article',
    'User_Profile',
    'User_Background'
];
```

Naming & Filenames for Models
----

Models should be named using CamelCase (starting with a capitol, and having no dashes or underscores).

Model filenames should be the opposite, and should be entirely lowercase, with two-word names broken up with an underscore.

Example:
  - ``User`` becomes ``user.js``
  - ``UserProfile`` becomes ``user_profile.js``

Style Conventions
----

As a general rule, you should be able to tell a lot about an object/variable by its case. Throughout the code, whenever possible, objects of a static nature should be CamelCase, and special care should be taken not to modify these objects/variables.

For example, when working with models, their name will be CamelCase, and you should know not to modify them.  Example: ``User`` should should not have custom properties applied to it (``User.myvar = 'my value';``).  Instead, you should recognize that this object provides you access to instances of a ``User`` via helper functions like ``User.Find()`` or via the **new** operator (``var user = new User();``).

Including in a Project
----

Including **mynews-common** in a project is easy, just add the respository as a dependency, then require it from within your project:

```javascript
var Core = require('mynews-common');
```

Using/Declaring Models
----

Not required, but makes for clean code:

```javascript
var Core = require('mynews-common');
var Models = Core.Models;
var User = Models.User;
```

Using Common AngularJS Models
----

This imports the common AngularJS models for interacting with the Mynews API.  This should be called during the startup of the application.  It's a synchronous operation that copies the model files into the defined folder.

While these models can be used directly, it's suggested that they be wrapped with an AngularJS Service.

The global JS value **NL_API_HOST** must also be defined within the <head> section of your page.

Logically, these models might make more sense to be part of the API repository, but since **mynews-common** currently houses any/all shared resources, they reside here for the time being.

```javascript
Core.Assets.Models.Import(__dirname.toString() + '/public/js/_models/');
```

Connecting to OrientDB
----

You should not manage your connection to OrientDB on your own.  Instead use the shared library to connect for you.

You should also make sure you've connected to the database before attempting to use any of the models or database related functions.

```javascript
var Core = require('mynews-common');
...
Core.Database.connect(Core.Config, function(e) {
    if (e) {
        Util.log(e);
        Util.log("Mynews.com shutting down...");
    } else {
        Util.log("OrientDB connection available.");
        http.createServer(app).listen(app.get('port'), function() {
            Util.log("Express listening on port " + app.get('port'));
        });
    }
})
```

Shared Configuration
----

Common configuration information is also available via this shared library.  Have a look at ``/config.json`` for the available configuration data.

Example:

```javascript
var Core = require('mynews-common');
var CommonConfig = Core.Config;  // This is data from `config.json`
```
