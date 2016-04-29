// ----------------
//   Dependencies
// ----------------

var Config      = require('../config.json');
var Mynews       = require('../database/database');
var crypto      = require('crypto');
var should      = require('should');
var Util        = require('util');

var User            = require('../models/user');
var UserProfile     = require('../models/user_profile');
var UserBackground  = require('../models/user_background');
var Tag             = require('../models/tag');
var Publisher       = require('../models/publisher');
var Journalist      = require('../models/journalist');
var Group           = require('../models/group');

var test = it;

// ----------------
//   Test Data
// ----------------

var TestData = {
    TestUser: {
        handle: 'testuser',
        password: 'testpass',
        first_name: 'Test',
        last_name: 'User',
        email: 'ruben+mynews_tu@gmail.com',
        imageUrl: 'http://files1.mynews.com:3000/files/sites/mynews/user/2014/8/12/7df4048c075d590207b39ba9a1f8c801/Windows-7-RTM-Default-Wallpaper-the-Design-Story-2.jpg',
        status: 1,
        userProfile: {
            street1: '710, Park Kiely',
            street2: 'Norwalk Drive',
            city: 'San Jose',
            state: 'California',
            country: 'usa',
            website_url: 'www.google.com',
            phone_home: '0123456789',
            phone_mobile: '9876543210',
            about_me: "I am a scientist who love to read latest journals about science and technology",
            userBackground : [{
                organization : 'Mynews',
                title : 'Senior Engineer',
                year_start : '2014',
                year_end : 'current',
                description: 'NodeJS project',
            },{
                organization : 'Indian Institute of Technology, Delhi',
                title : 'Computer Science',
                year_start : '2003',
                year_end : '2007',
                description: 'B. Tech in Computer Science',
            }]
        }
    },
    TestTag:{
        name: 'nodejs',
        type_group:  1
    },
    TestPublisher: {
        name: 'Top Publisher',
        url:  'http://news.google.com'
    },
    TestJournalist: {
        first_name: 'Top Journalist',
        last_name:  'James Bond',
        email :  'iamboss@topjournalist.com',
        url: 'http://news.google.com/checkthispage.html',
        status : 1
    },
    TestGroup: {
        name: 'administrators',
        url: 'http://mynews.com/group/admins',
        status: 1,
        imageUrl:'http://www.google.com',
        type: 0
    },
    TestUser1: {
        handle: 'testuser1',
        password: 'testpass',
        first_name: 'Test',
        last_name: 'User',
        email: 'test_name@abc.com',
        status : 1
    }
}

// ----------------
//   Test
// ----------------

describe('Users :', function() {

    // --
    // Suite Setup
    // --

    before(function(done) {
        Mynews.connect(Config, function(e) {
            if (e) {
                Util.log(e);
                Util.log("No OrientDB, test shutting down...");
            }

            Mynews.odb.vertex.create({
                '@class': 'User',
                handle: 'munish',
                password: 'munishpassword',
                email: 'manish0109@gmail.com',
                first_name: 'munish',
                last_name: 'chopra',
                status: 1
            }).then(function() {
                done();
            });
        });
    });

    // --
    // Model CRUD
    // --

    test('> Create a User', function(done) {
        User.Create(TestData.TestUser, function(e, user) {
            try {
                user.should.be.ok;
                if (user) {
                    user['@rid'].should.be.ok;
                    user.handle.should.be.ok;
                    TestData.TestUser['@rid'] = user['@rid'];
                    TestData.TestUser.handle = user.handle;
                    user.handle.should.equal(TestData.TestUser.handle);
                    user.password.should.equal(TestData.TestUser.password);
                    user.first_name.should.equal(TestData.TestUser.first_name);
                    user.last_name.should.equal(TestData.TestUser.last_name);
                    user.email.should.equal(TestData.TestUser.email);
                    user.status.should.equal(TestData.TestUser.status);
                    user.creation_date.should.be.ok;
                    user.modification_date.should.be.ok;
                    user.creation_date.should.equal(user.modification_date);
                    user.creation_date.should.be.within(Math.round(Date.now() / 1000) - 2, Math.round(Date.now() / 1000));
                    user.userProfile.street1.should.equal(TestData.TestUser.userProfile.street1);
                    user.userProfile.street2.should.equal(TestData.TestUser.userProfile.street2);
                    user.userProfile.city.should.equal(TestData.TestUser.userProfile.city);
                    user.userProfile.state.should.equal(TestData.TestUser.userProfile.state);
                    user.userProfile.country.should.equal(TestData.TestUser.userProfile.country);
                    user.userProfile.phone_mobile.should.equal(TestData.TestUser.userProfile.phone_mobile);
                    user.userProfile.phone_home.should.equal(TestData.TestUser.userProfile.phone_home);
                    user.userProfile.website_url.should.equal(TestData.TestUser.userProfile.website_url);
                    user.userProfile.about_me.should.equal(TestData.TestUser.userProfile.about_me);
                    user.userProfile.userBackground[0].description.should.equal(TestData.TestUser.userProfile.userBackground[0].description);
                    user.userProfile.userBackground[0].year_end.should.equal(TestData.TestUser.userProfile.userBackground[0].year_end);
                    user.userProfile.userBackground[0].year_start.should.equal(TestData.TestUser.userProfile.userBackground[0].year_start);
                    user.userProfile.userBackground[0].title.should.equal(TestData.TestUser.userProfile.userBackground[0].title);
                    user.userProfile.userBackground[1].description.should.equal(TestData.TestUser.userProfile.userBackground[1].description);
                    user.userProfile.userBackground[1].year_end.should.equal(TestData.TestUser.userProfile.userBackground[1].year_end);
                    user.userProfile.userBackground[1].year_start.should.equal(TestData.TestUser.userProfile.userBackground[1].year_start);
                    user.userProfile.userBackground[1].title.should.equal(TestData.TestUser.userProfile.userBackground[1].title);

                    // Create user should create FeedSettings with default data
                    user.get_feed_settings(function(e, feedSetting) {
                        feedSetting.track_public_ratings.should.equal(0);
                        feedSetting.article_filter.should.equal(0);
                        feedSetting.avg_article_rating.should.equal(4);
                        done();
                    })

                }
            }
            catch (e) {
                done(e);
                return;
            }
        });
    });

    test('> Create a User with less data', function(done) {
        User.Create(TestData.TestUser1, function(e, user) {
            try {
                user.should.be.ok;
                if (user) {
                    user['@rid'].should.be.ok;
                    TestData.TestUser1['@rid'] = user['@rid'];
                    TestData.TestUser1.handle =  user.handle;
                    user.password.should.equal(TestData.TestUser1.password);
                    user.first_name.should.equal(TestData.TestUser1.first_name);
                    user.last_name.should.equal(TestData.TestUser1.last_name);
                    user.email.should.equal(TestData.TestUser1.email);
                    user.status.should.equal(TestData.TestUser1.status);
                    user.creation_date.should.be.ok;
                    user.modification_date.should.be.ok;
                    user.creation_date.should.equal(user.modification_date);
                    user.creation_date.should.be.within(Math.round(Date.now() / 1000) - 2, Math.round(Date.now() / 1000));
                    user.fetch_profile(function(e, profile) {
                        profile.should.be.ok;

                        done();
                    });
                }
            }
            catch (e) {
                done(e);
                return;
            }
        });
    });

    test('> Retrieve a User', function(done) {
        User.Find({ where: { '@rid': TestData.TestUser['@rid'] }}, function(e, user) {
            try {
                user.should.be.ok;
                
                if (user) {
                    user.handle.should.equal(TestData.TestUser.handle);
                    user.password.should.equal(TestData.TestUser.password);
                    user.password.should.equal(TestData.TestUser.password);
                    user.first_name.should.equal(TestData.TestUser.first_name);
                    user.last_name.should.equal(TestData.TestUser.last_name);
                    user.email.should.equal(TestData.TestUser.email);
                    user.status.should.equal(TestData.TestUser.status);
                    user.creation_date.should.be.ok;
                    user.modification_date.should.be.ok;
                    user.creation_date.should.equal(user.modification_date);
                    user.creation_date.should.be.within(Math.round(Date.now() / 1000) - 2, Math.round(Date.now() / 1000));
                }
                done();
            }
            catch(e) {
                done(e);
                return;
            }
        })
    });

    test('> Retrieve a User without UserFeedSettings', function(done) {
        User.Find({ where: { 'handle': 'munish' }}, function(e, user) {
            try {
                user.should.be.ok;
                if (user) {
                    user.get_feed_settings(function(e, feedSetting) {
                        feedSetting.should.be.ok;
                        done();
                    });
                }
            }
            catch (e) {
                done(e);
                return;
            }
        })
    });

    test('> Update a User', function(done) {
        User.Find({ where: { '@rid': TestData.TestUser['@rid'] }}, function(e, user) {
            try {
                user.should.be.ok;
                if (user) {
                    user.handle = 'test_name';
                    user.save(function(e) {
                        User.Find({ where: { '@rid': TestData.TestUser['@rid'] }}, function(e, duser) {
                            duser.should.be.ok;
                            if (duser) {
                                duser.handle.should.equal('test_name');
                                duser.handle = 'testuser';
                                setTimeout(function(){
                                    duser.save(function(e, updatedUser) {
                                        updatedUser.handle.should.equal('testuser');
                                        updatedUser.modification_date.should.be.above(updatedUser.creation_date);
                                        done();
                                    });
                                }, 1000);
                            } else {
                                done();
                            }
                        });
                    });
                } else {
                    done();
                }
            }
            catch(e) {
                done(e);
                return;
            }
        });
    });

    // --
    // Instance Method Tests
    // --

    test('> Create & Fetch a friend', function(done) {
        User.Find({ where: { handle: 'munish' }}, function(e, user) {
            try {
                user.should.be.ok;

                user.add_friend(TestData.TestUser['@rid'], function(e, data) {
                    try {
                        data.should.be.ok;

                        user.get_friends(function(e, friends) {
                            try {
                                friends.should.be.ok;
                                var friend_exists = false;
                                for (var i in friends) {
                                    if (friends[i].handle == TestData.TestUser.handle) {
                                        friend_exists = true;
                                    }
                                }

                                friend_exists.should.be.ok;
                                done();
                            }
                            catch(e) {
                                done(e);
                            }
                        });
                    }
                    catch(e) {
                        done(e);
                        return;
                    }
                });
            }
            catch(e) {
                done(e)
                return;
            }
        });
    });

    test('> Create & Fetch multiple friends', function(done) {
        User.Find({ where: { handle: 'munish' }}, function(e, user) {
            try {
                user.should.be.ok;

                user.add_friend(TestData.TestUser1['@rid'], function(e, data) {
                    try {
                        data.should.be.ok;
                        user.get_friends(function(e, friends) {
                            try {
                                friends.should.be.ok;
                                for (var i in friends) {
                                    if (friends[i].handle == TestData.TestUser1.handle) {
                                        friend_exists = true;
                                    }
                                }
                                friend_exists.should.be.ok;
                                done();
                            }
                            catch(e) {
                                done(e);
                            }
                        });
                    }
                    catch(e) {
                        done(e);
                        return;
                    }
                });
            }
            catch(e) {
                done(e)
                return;
            }
        });
    });

    test('> Follow & Fetch people I follow', function(done) {
        User.Find({ where: { handle: 'munish' }}, function(e, user) {
            try {
                user.should.be.ok;

                user.follow(TestData.TestUser, function(e, data) {
                    try {
                        data.should.be.ok;

                        user.followed_people(function(e, followed) {
                            try {
                                followed.should.be.ok;

                                var followed_exists = false;
                                for (var i in followed) {
                                    if (followed[i].handle == TestData.TestUser.handle) {
                                        followed_exists = true;
                                    }
                                }

                                followed_exists.should.be.ok;
                                done();
                            }
                            catch(e) {
                                done(e);
                            }
                        });
                    }
                    catch(e) {
                        done(e);
                        return;
                    }
                });
            }
            catch(e) {
                done(e)
                return;
            }
        });
    });

    test('> Follow multiple & Fetch people I follow', function(done) {
        User.Find({ where: { handle: 'munish' }}, function(e, user) {
            try {
                user.should.be.ok;

                user.follow(TestData.TestUser1, function(e, data) {
                    try {
                        data.should.be.ok;

                        user.followed_people(function(e, followed) {
                            try {
                                followed.should.be.ok;
                                var followed_exists = false;
                                for (var i in followed) {
                                    if (followed[i].handle == TestData.TestUser.handle) {
                                        followed_exists = true;
                                    }
                                }

                                followed_exists.should.be.ok;
                                done();
                            }
                            catch(e) {
                                done(e);
                            }
                        });
                    }
                    catch(e) {
                        done(e);
                        return;
                    }
                });
            }
            catch(e) {
                done(e)
                return;
            }
        });
    });

    test('> Follow and get followers', function(done) {
        User.Find({ where: { 'handle': TestData.TestUser.handle }}, function(e, user) {
            try {
                user.should.be.ok;

                user.get_followers(function(e, followed) {
                            try {
                                followed.should.be.ok;


                                var followed_exists = false;
                                for (var i in followed) {
                                    if (followed[i].handle == 'munish') {
                                        followed_exists = true;
                                    }
                                }

                                followed_exists.should.be.ok;
                                done();
                            }
                            catch(e) {
                                done(e);
                            }
                        });
            }
            catch(e) {
                done(e)
                return;
            }
        });
    });

    test('> Follow and get multiple followers', function(done) {
        User.Find({ where: { handle: TestData.TestUser.handle }}, function(e, user) {
            try {
                user.should.be.ok;

                user.follow(TestData.TestUser1, function(e, data) {
                    try {
                        data.should.be.ok;
                        User.Find({ where: { 'handle': TestData.TestUser1.handle }}, function(e, user) {
                             try {
                                user.should.be.ok;
                                user.get_followers(function(e, followed) {
                                    try {
                                        followed.should.be.ok;
                                        var followed_exists = false;
                                        for (var i in followed) {
                                            if (followed[i].handle == 'munish') {
                                                followed_exists = true;
                                            }
                                        }
                                        followed_exists.should.be.ok;
                                        done();
                                    }
                                    catch(e) {
                                        done(e);
                                    }
                                });
                            }
                            catch(e) {
                                done(e)
                                return;
                            }
                        });

                    }
                    catch(e) {
                        done(e);
                        return;
                    }
                });
            }
            catch(e) {
                done(e)
                return;
            }
        });
    });

    test('> Fetch UserProfile from User ', function(done) {
        User.Find({ where: { '@rid': TestData.TestUser['@rid'] }}, function(e,user) {
            if (!e && user) {
                user.fetch_profile(function(e, profile) {
                    profile.phone_mobile.should.be.equal(TestData.TestUser.userProfile.phone_mobile);
                    profile.phone_home.should.equal(TestData.TestUser.userProfile.phone_home);
                    profile.userBackground.should.be.an.Array;
                    TestData.TestUser.userProfile.userBackground[0]["@rid"] = profile.userBackground[0]["@rid"];
                    TestData.TestUser.userProfile.userBackground[1]["@rid"] = profile.userBackground[1]["@rid"]
                    profile.userBackground[0].organization.should.equal(TestData.TestUser.userProfile.userBackground[0].organization);
                    profile.userBackground[1].organization.should.equal(TestData.TestUser.userProfile.userBackground[1].organization);
                    profile.street1.should.equal(TestData.TestUser.userProfile.street1);
                    profile.street2.should.equal(TestData.TestUser.userProfile.street2);
                    profile.city.should.equal(TestData.TestUser.userProfile.city);
                    profile.state.should.equal(TestData.TestUser.userProfile.state);
                    profile.country.should.equal(TestData.TestUser.userProfile.country);
                    profile.phone_mobile.should.equal(TestData.TestUser.userProfile.phone_mobile);
                    profile.phone_home.should.equal(TestData.TestUser.userProfile.phone_home);
                    profile.website_url.should.equal(TestData.TestUser.userProfile.website_url);
                    profile.about_me.should.equal(TestData.TestUser.userProfile.about_me);
                    profile.userBackground[0].description.should.equal(TestData.TestUser.userProfile.userBackground[0].description);
                    profile.userBackground[0].year_end.should.equal(TestData.TestUser.userProfile.userBackground[0].year_end);
                    profile.userBackground[0].year_start.should.equal(TestData.TestUser.userProfile.userBackground[0].year_start);
                    profile.userBackground[0].title.should.equal(TestData.TestUser.userProfile.userBackground[0].title);
                    profile.userBackground[1].description.should.equal(TestData.TestUser.userProfile.userBackground[1].description);
                    profile.userBackground[1].year_end.should.equal(TestData.TestUser.userProfile.userBackground[1].year_end);
                    profile.userBackground[1].year_start.should.equal(TestData.TestUser.userProfile.userBackground[1].year_start);
                    profile.userBackground[1].title.should.equal(TestData.TestUser.userProfile.userBackground[1].title);
                    done();
                });
            } else {
                done(e);
            }
        });
    });

    test('> Fetch UserProfile from User with empty userProfile', function(done) {
        User.Find({ where: { '@rid': TestData.TestUser1['@rid'] }}, function(e,user) {
            if (!e && user) {
                user.fetch_profile(function(e, profile) {
                    profile.should.be.ok;
                    profile.about_me.should.be.empty;
                    done();
                });
            } else {
                done(e);
            }
        });
    });

    test('> Updating a UserProfile ', function(done){
        User.Find({ where: { '@rid': TestData.TestUser['@rid'] }}, function(e, user) {
            user.fetch_profile(function(e, profile) {
                console.log('Original Backgrounds:', profile.userBackground);
                profile.country = "India";
                profile.userBackground[0].description = "This is updated profile";
                profile.save(function(e, data) {
                    console.log('<--- CHECK:', e, data);
                    data.userBackground[0].description = "This is updated profile";
                    data.country.should.equal("India");
                    done();
                });
            })
        })
    });

    test('> Updating a UserProfile with empty profile', function(done){
        User.Find({ where: { '@rid': TestData.TestUser1['@rid'] }}, function(e, user) {
            user.fetch_profile(function(e, profile) {
                profile.country = "India";
                var userBg = {};
                userBg.description = "This is first profile";
                profile.userBackground.push(userBg);
                profile.save(function(e, data) {
                    data.userBackground[0].description.should.equal("This is first profile");
                    
                    done();
                });
            })
        })
    });

    test('> Adding more than one backgrounds to an empty profile', function(done){
        User.Find({ where: { '@rid': TestData.TestUser1['@rid'] }}, function(e, user) {
            user.fetch_profile(function(e, profile) {
                profile.userBackground[0].description= "This description is changed";
                profile.country = "India";
                var userBg = {};
                userBg.description = "This is second profile";
                var userBg1 = {};
                userBg1.description = "This is third profile";
                userBg1.year_end = "2009";
                profile.userBackground.push(userBg);
                profile.userBackground.push(userBg1);

                console.log('Saving Profile:', profile);

                profile.save(function(e, data) {
                    data.userBackground[0].description.should.equal("This description is changed");
                    data.userBackground[1].description.should.equal("This is second profile");
                    data.userBackground[2].description.should.equal("This is third profile");
                    data.userBackground[2].year_end.should.equal("2009");

                    done();
                });
            })
        })
    });

    test('> Updating UserFeedSettings', function(done){
        User.Find({ where: { '@rid': TestData.TestUser1['@rid'] }}, function(e, user) {
            user.get_feed_settings(function(e, feedSetting){
                feedSetting.ImportanceRating = '6';
                feedSetting.ratingsOverall = '1';
                
                feedSetting.save(function(e, data){
                    data.ImportanceRating.should.equal('6');
                    data.ratingsOverall.should.equal('1');
                    done();
                });
            })
        });
    });

    test('> Integrity : Updating UserFeedSettings with String data : should fail', function(done){
        User.Find({ where: { '@rid': TestData.TestUser1['@rid'] }}, function(e, user) {
            user.get_feed_settings(function(e, feedSetting) {
                feedSetting.importance_rating = 'Munish Chopra';
                feedSetting.article_filter = '1';
                
                feedSetting.save(function(e, data){
                    if (e) { done(); }
                });
            })
        });
    });

    // UserFeedSettings Test

    test('> Create & Fetch a tag from UserFeedSettings', function(done) {
        Tag.Create(TestData.TestTag, function(e, tag){
            tag.should.be.ok;
            tag['@rid'].should.be.ok;
            tag.slug.should.be.ok;
            TestData.TestTag['@rid'] = tag['@rid'];
        
            User.Find({ where: { handle: TestData.TestUser.handle }}, function(e, user) {
                try {
                    user.should.be.ok;
                    user.get_feed_settings(function(e, feedSetting){
                        feedSetting.should.be.ok;
                        feedSetting.assign_tag(TestData.TestTag['@rid'], function(e, data){
                            data.should.be.true;
                            feedSetting.get_tags(function(e, tags){
                                tags[0]['@rid'].should.be.equal(TestData.TestTag['@rid']);
                                tags[0].name.should.be.equal(TestData.TestTag.name);
                                done();
                            })
                        })
                    });
                }
                catch(e) {
                    done(e)
                    return;
                }
            });
        });
    });

    test('> Remove a tag from UserFeedSettings', function(done) {
        User.Find({ where: { handle: TestData.TestUser.handle }}, function(e, user) {
            try {
                user.should.be.ok;
                user.get_feed_settings(function(e, feedSetting) {
                    feedSetting.should.be.ok;
                    feedSetting.tags[0].name.should.equal(TestData.TestTag.name);
                    feedSetting.remove_tag(TestData.TestTag['@rid'], function(e, data){
                        data.should.be.true;
                        feedSetting.get_tags(function(e, tags){
                            tags.should.be.empty;
                            done();
                        })
                    })
                });
            }
            catch(e) {
                done(e)
                return;
            }
        });
    });
    
    test('> Add same tag again to UserFeedSettings', function(done) {
        User.Find({ where: { handle: TestData.TestUser.handle }}, function(e, user) {
                try {
                    user.should.be.ok;
                    user.get_feed_settings(function(e, feedSetting){
                        feedSetting.should.be.ok;
                        feedSetting.assign_tag(TestData.TestTag['@rid'], function(e, data){
                            data.should.be.true;
                            feedSetting.get_tags(function(e, tags){
                                tags[0]['@rid'].should.be.equal(TestData.TestTag['@rid']);
                                tags[0].name.should.be.equal(TestData.TestTag.name);
                                done();
                            })
                        })
                    });
                }
                catch(e) {
                    done(e)
                    return;
                }
            });
    });

    test('> Remove a tag from UserFeedSettings by deleting tag itself', function(done) {
        User.Find({ where: { handle: TestData.TestUser.handle }}, function(e, user) {
            try {
                user.should.be.ok;
                user.get_feed_settings(function(e, feedSetting) {
                    feedSetting.should.be.ok;
                    feedSetting.tags[0].name.should.equal(TestData.TestTag.name);
                    feedSetting.tags[0].delete(function (e, data) {
                        should(e).not.be.ok;

                        feedSetting.get_tags(function (e, tags) {
                            try {
                                tags.should.be.empty;
                                done();
                            }
                            catch (e) {
                                console.log(e);
                                done(e);
                            }

                        });
                    });
                });
            }
            catch(e) {
                done(e)
                return;
            }
        });
    });

    test('> Create & Fetch a Publisher from UserFeedSettings', function(done) {
        Publisher.Create(TestData.TestPublisher , function(e, publisher) {
            publisher.should.be.ok;
            publisher['@rid'].should.be.ok;
            publisher.slug.should.be.ok;
            TestData.TestPublisher['@rid'] = publisher['@rid'];
        
            User.Find({ where: { handle: TestData.TestUser.handle }}, function(e, user) {
                try {
                    user.should.be.ok;
                    user.get_feed_settings(function(e, feedSetting) {
                        feedSetting.should.be.ok;
                        feedSetting.assign_publisher(TestData.TestPublisher['@rid'], function(e, data) {
                            data.should.be.true;
                            feedSetting.get_publishers(function(e, publishers) {
                                publishers[0]['@rid'].should.be.equal(TestData.TestPublisher['@rid']);
                                publishers[0].name.should.be.equal(TestData.TestPublisher.name);
                                publishers[0].url.should.be.equal(TestData.TestPublisher.url);
                                done();
                            })
                        })
                    });
                }
                catch(e) {
                    done(e)
                    return;
                }
            });
        });
    });

    test('> Remove a publisher from UserFeedSettings', function(done) {
        User.Find({ where: { handle: TestData.TestUser.handle }}, function(e, user) {
            try {
                user.should.be.ok;
                user.get_feed_settings(function(e, feedSetting){
                    feedSetting.should.be.ok;
                    feedSetting.publishers[0].name.should.equal(TestData.TestPublisher.name);
                    feedSetting.remove_publisher(TestData.TestPublisher['@rid'], function(e, data){
                        data.should.be.true;
                        feedSetting.get_publishers(function(e, publishers){
                            publishers.should.be.empty;
                            done();
                        })
                    })
                });
            }
            catch(e) {
                done(e)
                return;
            }
        });
    });

    test('> Add same publisher again to UserFeedSettings', function(done) {
        User.Find({ where: { handle: TestData.TestUser.handle }}, function(e, user) {
                try {
                    user.should.be.ok;
                    user.get_feed_settings(function(e, feedSetting){
                        feedSetting.should.be.ok;
                        feedSetting.assign_publisher(TestData.TestPublisher['@rid'], function(e, data){
                            data.should.be.true;
                            feedSetting.get_publishers(function(e, publishers){
                                publishers[0]['@rid'].should.be.equal(TestData.TestPublisher['@rid']);
                                publishers[0].name.should.be.equal(TestData.TestPublisher.name);
                                done();
                            })
                        })
                    });
                }
                catch(e) {
                    done(e)
                    return;
                }
            });
    });

    test('> Remove a publisher from UserFeedSettings by deleting publisher itself', function(done) {
        User.Find({ where: { handle: TestData.TestUser.handle }}, function(e, user) {
            try {
                user.should.be.ok;
                user.get_feed_settings(function(e, feedSetting){
                    feedSetting.should.be.ok;
                    feedSetting.publishers[0].name.should.equal(TestData.TestPublisher.name);
                    feedSetting.publishers[0].delete(function(e) {
                        should(e).not.be.ok;
                        feedSetting.get_publishers(function(e, publishers){
                            publishers.should.be.empty;
                            done();
                        })
                    })
                    
                });
            }
            catch(e) {
                done(e)
                return;
            }
        });
    });

    test('> Create & Fetch a Journalist from UserFeedSettings', function(done) {
        Journalist.Create(TestData.TestJournalist , function(e, journalist){
            journalist.should.be.ok;
            journalist['@rid'].should.be.ok;
            journalist.slug.should.be.ok;
            journalist.first_name.should.equal(TestData.TestJournalist.first_name);
            journalist.last_name.should.equal(TestData.TestJournalist.last_name);
            journalist.email.should.equal(TestData.TestJournalist.email);
            journalist.status.should.equal(TestData.TestJournalist.status);
            TestData.TestJournalist['@rid'] = journalist['@rid'];
        
            User.Find({ where: { handle: TestData.TestUser.handle }}, function(e, user) {
                try {
                    user.should.be.ok;
                    user.get_feed_settings(function(e, feedSetting){
                        feedSetting.should.be.ok;
                        feedSetting.assign_journalist(TestData.TestJournalist['@rid'], function(e, data){
                            data.should.be.true;
                            feedSetting.get_journalists(function(e, journalists){
                                journalists[0]['@rid'].should.be.equal(TestData.TestJournalist['@rid']);
                                journalists[0].first_name.should.be.equal(TestData.TestJournalist.first_name);
                                journalists[0].last_name.should.be.equal(TestData.TestJournalist.last_name);
                                journalists[0].email.should.be.equal(TestData.TestJournalist.email);
                                journalists[0].status.should.be.equal(TestData.TestJournalist.status);
                                done();
                            })
                        })
                    });
                }
                catch(e) {
                    done(e)
                    return;
                }
            });
        });
    });

    test('> Remove a journalist from UserFeedSettings', function(done) {
        User.Find({ where: { handle: TestData.TestUser.handle }}, function(e, user) {
            try {
                user.should.be.ok;
                user.get_feed_settings(function(e, feedSetting){
                    feedSetting.should.be.ok;
                    feedSetting.journalists[0].first_name.should.equal(TestData.TestJournalist.first_name);
                    feedSetting.journalists[0].last_name.should.be.equal(TestData.TestJournalist.last_name);
                    feedSetting.journalists[0].email.should.be.equal(TestData.TestJournalist.email);
                    feedSetting.journalists[0].status.should.be.equal(TestData.TestJournalist.status);
                    feedSetting.remove_journalist(TestData.TestJournalist['@rid'], function(e, data){
                        data.should.be.true;
                        feedSetting.get_journalists(function(e, journalists){
                            journalists.should.be.empty;
                            done();
                        })
                    })
                });
            }
            catch(e) {
                done(e)
                return;
            }
        });
    });

    test('> Add same journalist again to UserFeedSettings', function(done) {
        User.Find({ where: { handle: TestData.TestUser.handle }}, function(e, user) {
                try {
                    user.should.be.ok;
                    user.get_feed_settings(function(e, feedSetting){
                        feedSetting.should.be.ok;
                        feedSetting.assign_journalist(TestData.TestJournalist['@rid'], function(e, data){
                            data.should.be.true;
                            feedSetting.get_journalists(function(e, journalists){
                                journalists[0]['@rid'].should.be.equal(TestData.TestJournalist['@rid']);
                                journalists[0].first_name.should.be.equal(TestData.TestJournalist.first_name);
                                journalists[0].last_name.should.be.equal(TestData.TestJournalist.last_name);
                                journalists[0].email.should.be.equal(TestData.TestJournalist.email);
                                journalists[0].status.should.be.equal(TestData.TestJournalist.status);
                                done();
                            })
                        })
                    });
                }
                catch(e) {
                    done(e)
                    return;
                }
            });
    });

    test('> Remove a journalist from UserFeedSettings by deleting journalist itself', function(done) {
        User.Find({ where: { handle: TestData.TestUser.handle }}, function(e, user) {
            try {
                user.should.be.ok;
                user.get_feed_settings(function(e, feedSetting){
                    feedSetting.should.be.ok;
                    feedSetting.journalists[0].first_name.should.equal(TestData.TestJournalist.first_name);
                    feedSetting.journalists[0].last_name.should.be.equal(TestData.TestJournalist.last_name);
                    feedSetting.journalists[0].email.should.be.equal(TestData.TestJournalist.email);
                    feedSetting.journalists[0].status.should.be.equal(TestData.TestJournalist.status);
                    feedSetting.journalists[0].delete(function(e) {
                        should(e).not.be.ok;
                        feedSetting.get_journalists(function(e, journalists){
                            journalists.should.be.empty;
                            done();
                        })
                    })
                    
                });
            }
            catch(e) {
                done(e)
                return;
            }
        });
    });

    test('> Create & Fetch a friend to UserFeedSettings', function(done) {
        User.Find({ where: { handle: TestData.TestUser1.handle }}, function(e, user) {
            try {
                user.should.be.ok;
                user.get_feed_settings(function(e, feedSetting) {
                    feedSetting.should.be.ok;
                    feedSetting.assign_friend(TestData.TestUser['@rid'], function(e, data) {
                        data.should.be.true;
                        feedSetting.get_friends(function(e, friends) {
                            friends[0].handle.should.equal(TestData.TestUser.handle);
                            friends[0]['@rid'].should.equal(TestData.TestUser['@rid']);
                            done();
                        })
                    })
                });
            }
            catch(e) {
                done(e)
                return;
            }
        });
    });

    test('> Remove a friend to UserFeedSettings', function(done) {
        User.Find({ where: { handle: TestData.TestUser1.handle }}, function(e, user) {
            try {
                user.should.be.ok;
                user.get_feed_settings(function(e, feedSetting){
                    feedSetting.should.be.ok;
                    feedSetting.friends[0].handle.should.equal(TestData.TestUser.handle);
                    feedSetting.remove_friend(TestData.TestUser['@rid'], function(e, data){
                        feedSetting.get_friends(function(e, friends){
                            friends.should.be.empty;
                            done();
                        })
                    })
                });
            }
            catch(e) {
                done(e)
                return;
            }
        });
    });

    test('> Add same friend again to UserFeedSettings', function(done) {
        User.Find({ where: { handle: TestData.TestUser1.handle }}, function(e, user) {
                try {
                    user.should.be.ok;
                    user.get_feed_settings(function(e, feedSetting){
                        feedSetting.should.be.ok;
                        feedSetting.assign_friend(TestData.TestUser['@rid'], function(e, data){
                            data.should.be.true;
                            feedSetting.get_friends(function(e, friends){
                                friends[0]['@rid'].should.be.equal(TestData.TestUser['@rid']);
                                friends[0].first_name.should.be.equal(TestData.TestUser.first_name);
                                friends[0].last_name.should.be.equal(TestData.TestUser.last_name);
                                friends[0].email.should.be.equal(TestData.TestUser.email);
                                done();
                            })
                        })
                    });
                }
                catch(e) {
                    done(e)
                    return;
                }
            });
    });

    test('> Create & Fetch a Group from UserFeedSettings', function(done) {
        Group.Create(TestData.TestGroup , function(e, group){
            group.should.be.ok;
            group['@rid'].should.be.ok;
            group.slug.should.be.ok;
            group.name.should.equal(TestData.TestGroup.name);
            group.url.should.equal(TestData.TestGroup.url);
            TestData.TestGroup['@rid'] = group['@rid'];

        
            User.Find({ where: { handle: TestData.TestUser.handle }}, function(e, user) {
                try {
                    user.should.be.ok;
                    user.get_feed_settings(function(e, feedSetting){
                        feedSetting.should.be.ok;
                        feedSetting.assign_group(TestData.TestGroup['@rid'], function(e, data){
                            data.should.be.true;
                            feedSetting.get_groups(function(e, groups){
                                groups[0]['@rid'].should.be.equal(TestData.TestGroup['@rid']);
                                groups[0].name.should.be.equal(TestData.TestGroup.name);
                                groups[0].url.should.be.equal(TestData.TestGroup.url);
                                done();
                            })
                        })
                    });
                }
                catch(e) {
                    done(e)
                    return;
                }
            });
        });
    });

    test('> Remove a group from UserFeedSettings', function(done) {
        User.Find({ where: { handle: TestData.TestUser.handle }}, function(e, user) {
            try {
                user.should.be.ok;
                user.get_feed_settings(function(e, feedSetting){
                    feedSetting.should.be.ok;
                    feedSetting.groups[0]['@rid'].should.be.equal(TestData.TestGroup['@rid']);
                    feedSetting.groups[0].name.should.be.equal(TestData.TestGroup.name);
                    feedSetting.groups[0].url.should.be.equal(TestData.TestGroup.url);
                    feedSetting.remove_group(TestData.TestGroup['@rid'], function(e, data){
                        data.should.be.true;
                        feedSetting.get_groups(function(e, groups){
                            groups.should.be.empty;
                            done();
                        })
                    })
                });
            }
            catch(e) {
                done(e)
                return;
            }
        });
    });

    test('> Add same group again to UserFeedSettings', function(done) {
        User.Find({ where: { handle: TestData.TestUser.handle }}, function(e, user) {
                try {
                    user.should.be.ok;
                    user.get_feed_settings(function(e, feedSetting){
                        feedSetting.should.be.ok;
                        feedSetting.assign_group(TestData.TestGroup['@rid'], function(e, data){
                            data.should.be.true;
                            feedSetting.get_groups(function(e, groups){
                                groups[0]['@rid'].should.be.equal(TestData.TestGroup['@rid']);
                                groups[0].name.should.be.equal(TestData.TestGroup.name);
                                groups[0].url.should.be.equal(TestData.TestGroup.url);
                                done();
                            })
                        })
                    });
                }
                catch(e) {
                    done(e)
                    return;
                }
            });
    });

    test('> Remove a group from UserFeedSettings by deleting group itself', function(done) {
        User.Find({ where: { handle: TestData.TestUser.handle }}, function(e, user) {
            try {
                user.should.be.ok;
                user.get_feed_settings(function(e, feedSetting){
                    feedSetting.should.be.ok;
                    feedSetting.groups[0]['@rid'].should.be.equal(TestData.TestGroup['@rid']);
                    feedSetting.groups[0].name.should.be.equal(TestData.TestGroup.name);
                    feedSetting.groups[0].url.should.be.equal(TestData.TestGroup.url);
                    feedSetting.groups[0].delete(function(e) {
                        should(e).not.be.ok;
                        feedSetting.get_groups(function(e, groups){
                            groups.should.be.empty;
                            done();
                        })
                    })
                    
                });
            }
            catch(e) {
                done(e)
                return;
            }
        });
    });

    // --
    // Model Integrity
    // --

    test('> Create a User [ handle too long ][ should fail ]', function(done) {
        var old_name = TestData.TestUser.name;
        crypto.randomBytes(128, function(ex, buf) {
            TestData.TestUser.handle = buf.toString('hex');
            try {
                User.Create(TestData.TestUser, function(e, user) {
                    // There really should be an error
                    should(e).be.ok;
                    should(user).not.be.ok;
                    TestData.TestUser.handle = old_name;
                    done();
                })
            }
            catch(e) {
                TestData.TestUser.handle = old_name;
                done(e);
            }
        });
    });

    test('> Retrieve a non-existant User [ should fail ]', function(done) {
        User.Find({ where: { 'handle': '_-_-_-_-_-_-_-_-_' }}, function(e, user) {
            try {
                user.should.not.be.ok;
                done();
            }
            catch (e) {
                done(e);
                return;
            }
        });
    });

    // --
    // Suite Teardown
    // --

    test('> Delete a User', function(done) {
        User.Find({ where: { '@rid': TestData.TestUser['@rid'] }}, function(e, user) {
            try {
                user.should.be.ok;
                if (user) {
                    user.delete(function(e) {
                        User.Find({ where: { '@rid': TestData.TestUser['@rid'] }}, function(e, duser) {
                            duser.should.not.be.ok;
                            done();
                        });
                    });
                } else {
                    done();
                }
            }
            catch(e) {
                done(e);
                return;
            }
        });
    });

    test('> Deleting 2nd User', function(done) {
        User.Find({ where: { '@rid': TestData.TestUser1['@rid'] }}, function(e, user) {
            try {
                user.should.be.ok;
                if (user) {
                    user.delete(function(e) {
                        User.Find({ where: { '@rid': TestData.TestUser1['@rid'] }}, function(e, duser) {
                            duser.should.not.be.ok;
                            done();
                        });
                    });
                } else {
                    done();
                }
            }
            catch(e) {
                done(e);
                return;
            }
        });
    });

    after(function(done) {
        Mynews.odb
            .delete()
            .from('User')
            .where({ handle: 'munish' })
            .all()
            .then(function() {
                done();
            })
            .catch(done);
    });

});