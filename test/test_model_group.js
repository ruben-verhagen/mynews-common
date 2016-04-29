// ----------------
//   Dependencies
// ----------------

var Util        = require('util');
var Config      = require('../config.json');
var Mynews       = require('../database/database');
var crypto      = require('crypto');
var should      = require('should');
var Async       = require('async');

var Group       = require('../models/group');
var User        = require('../models/user');
var Article     = require('../models/article');
var ArticleFact = require('../models/article_fact');
var Journalist  = require('../models/journalist');
var Publisher   = require('../models/publisher');


var test = it;

// ----------------
//   Test
// ----------------
var TestData = {
    TestGroup: {
        name: 'test group',
        description: 'This group is created for testing the group model',
        url: 'http://test.group',
        imageUrl: 'http://www.google.com',
        type: 0,
        status: 1
    },
    TestGroup2: {
        name: 'test group',
        description: 'This 2nd group is created for testing the group model',
        url: 'http://sample.test.publisher',
        imageUrl: 'http://www.google.com/secondimage',
        type:0,
        status: 0
    },
    TestUser1: {
        handle: 'testuser1',
        password: 'testpass',
        first_name: 'Test',
        last_name: 'User',
        email: 'test_name@abc.com',
        status : 1
    },
    TestUser: {
        handle: 'testuser',
        password: 'testpass',
        first_name: 'Test',
        last_name: 'User',
        email: 'ruben+mynews_tu@gmail.com',
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
            }, {
                organization : 'Indian Institute of Technology, Delhi',
                title : 'Computer Science',
                year_start : '2003',
                year_end : '2007',
                description: 'B. Tech in Computer Science',
            }]
        }
    },
    TestArticle: {
        title:      "Test Articla",
        body:       "Sample article body",
        imageUrl:   "http://www.sampleimage.com/1.jpg",
        url:        "http://www.samplearticle.com/sample-url",
        post_date:  1395833698,
        featured:   1
    },
    TestArticleFact: {
        immediate: {
            note: "Fact note #1",
            type: "immediate"
        },
        contextual: {
            note: "Fact note #2",
            type: "contextual"
        }        
    },
    TestJournalist: {
        first_name: 'test',
        last_name : 'Journalist',
        email:      'ruben+mynews_tu@gmail.com',
        url:        'http://sample.journalist',
        imageUrl:   'http://sample.journalist.img',
        status:     1
    },
    TestPublisher: {
        name:       'test publisher',
        url:        'http://sample.test.publisher',
        imageUrl:   'http://image.test.publisher',
        summary:    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque sapien massa, ullamcorper eu.',
        about:      'Consectetur adipiscing elit. Pellentesque sapien massa, ullamcorper eu. Praesent gravida purus id consequat dapibus.',
        specialty:  'Nunc ac ante egestas, interdum massa sed, rutrum libero. Praesent nec elit ipsum.',
        owner:      'Somebody Cool',
        owner_url:  'http://somecoolcompany.com',
        twitter:    'test.publisher',
        facebook:   'testpub',
        email:      'testpub@mynews.com'
    }

}

describe('Group :', function() {

    // --
    // Suite Setup
    // --

    before(function(done) {
        Mynews.connect(Config, function(e) {
            if (e) {
                Util.log(e);
                Util.log("No OrientDB, test shutting down...");
            }

            User.Create(TestData.TestUser, function(e, user) {
                user.should.be.ok;
                TestData.TestUser['@rid'] = user['@rid'];

                User.Create(TestData.TestUser1, function(e, user2) {
                    user2.should.be.ok;
                    TestData.TestUser1['@rid'] = user2['@rid'];

                    done();
                });
            });
        });
    });

    // --
    // Model CRUD
    // --

    test('> Create a Group', function(done) {
        Group.Create(TestData.TestGroup, function(e, group) {
            try {
                group.should.be.ok;
                group['@rid'].should.be.ok;
                group.slug.should.be.ok;
                group.name.should.equal(TestData.TestGroup.name);
                group.description.should.equal(TestData.TestGroup.description);
                group.url.should.equal(TestData.TestGroup.url);
                group.status.should.equal(TestData.TestGroup.status);
                group.creation_date.should.be.ok;
                group.modification_date.should.be.ok;
                group.creation_date.should.equal(group.modification_date);
                group.creation_date.should.be.within(Math.round(Date.now() / 1000) - 2, Math.round(Date.now() / 1000));

                TestData.TestGroup['@rid'] = group['@rid'];
                TestData.TestGroup['slug'] = group['slug'];
                
                done();
            }
            catch (e) {
                done(e);
                return;
            }
        });
    });

    test('> Retrieve a Group', function(done) {
        Group.Find({ where: { '@rid': TestData.TestGroup['@rid'] }}, function(e, group) {
            try {
                group.should.be.ok;
                group['@rid'].should.equal(TestData.TestGroup['@rid']);
                group.name.should.equal(TestData.TestGroup.name);
                group.url.should.equal(TestData.TestGroup.url);
                group.description.should.equal(TestData.TestGroup.description);
                group.slug.should.equal(TestData.TestGroup.slug);
                group.status.should.equal(TestData.TestGroup.status);
                group.creation_date.should.be.ok;
                group.modification_date.should.be.ok;
                group.creation_date.should.equal(group.modification_date);
                group.creation_date.should.be.within(Math.round(Date.now() / 1000) - 2, Math.round(Date.now() / 1000));
                done();
            }
            catch (e) {
                done(e);
                return;
            }
        })
    });

    test('> Update a Group', function(done) {
        Group.Find({ where: { '@rid': TestData.TestGroup['@rid'] }}, function(e, group) {
            try {
                var new_url = 'http://newurl.com';

                group.should.be.ok;
                group.url = new_url;
                setTimeout(function(){
                    group.save(function(e) {
                        Group.Find({ where: { '@rid': TestData.TestGroup['@rid'] }}, function(e, dgroup) {
                            dgroup.should.be.ok;
                            dgroup.modification_date.should.be.above(dgroup.creation_date);
                            dgroup.url.should.equal(new_url);
                            done();
                        });
                    });
                }, 1000);
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

    test('> Add a member', function(done){
        Group.Find({ where: { '@rid': TestData.TestGroup['@rid'] }}, function(e, group) {
            group.add_member(TestData.TestUser['@rid'], function(e, added) {
                added.should.be.true;
                group.get_members(function(e, members) {
                    var exists = false;
                    members.forEach(function(member) {
                        if (member['@rid'] == TestData.TestUser['@rid']) {
                            exists = true;
                        }
                    });

                    exists.should.be.ok;

                    done();
                })
            })
        });
    });

    test('> Add another member', function(done){
        Group.Find({ where: { '@rid': TestData.TestGroup['@rid'] }}, function(e, group) {
            group.add_member(TestData.TestUser1['@rid'], function(e, added){
                added.should.be.true;
                group.get_members(function(e, members) {
                    var exists = { one: false, two: false };
                    members.forEach(function(member) {
                        if (member['@rid'] == TestData.TestUser['@rid']) {
                            exists.one = true;
                        }
                        if (member['@rid'] == TestData.TestUser1['@rid']) {
                            exists.two = true;
                        }
                    });

                    exists.one.should.be.ok;
                    exists.two.should.be.ok;

                    done();
                })
            })
        });
    });

    test('> Add a moderator', function(done){
        Group.Find({ where: { '@rid': TestData.TestGroup['@rid'] }}, function(e, group) {
            group.add_moderator(TestData.TestUser1['@rid'], function(e, added) {

                added.should.be.true;

                group.get_moderators(function(e, mods) {
                    var exists = false;
                    mods.forEach(function(mod) {
                        if (mod['@rid'] == TestData.TestUser1['@rid']) {
                            exists = true;
                        }
                    });

                    exists.should.be.ok;

                    done();
                })
            })
        });
    });

    test('> Remove a moderator', function(done){
        Group.Find({ where: { '@rid': TestData.TestGroup['@rid'] }}, function(e, group) {
            group.remove_moderator(TestData.TestUser1['@rid'], function(e, removed) {
                removed.should.be.true;

                group.get_moderators(function(e, mods) {
                    var found = false;

                    mods.forEach(function(mod) {
                        if (mod['@rid'] == TestData.TestUser1['@rid']) {
                            found = true;
                        }
                    });

                    found.should.not.be.ok;

                    done();
                })
            })
        });
    })

    test('> Get member count', function(done){
        Group.Find({ where: { '@rid': TestData.TestGroup['@rid'] }}, function(e, group) {
            group.get_members_count(function(e, count) {
                count.should.be.equal(2);
                done();
            });
        });
    })

    test('> Remove a member', function(done){
        Group.Find({ where: { '@rid': TestData.TestGroup['@rid'] }}, function(e, group) {
            group.remove_member(TestData.TestUser1['@rid'], function(e, added) {
                added.should.be.true;

                group.get_members(function(e, members) {
                    var exists = false;
                    members.forEach(function(member) {
                        if (member['@rid'] == TestData.TestUser1['@rid']) {
                            exists = true;
                        }
                    });

                    exists.should.not.be.ok;

                    members.length.should.equal(1);

                    done();
                })
            })
        });
    });




    
        test('> Get Recently Rated Articles', function(done){
        
        Async.parallel({
            article:function(finished) {
                Article.Create(TestData.TestArticle, function(e, article) {
                    TestData.TestArticle = article;
                    finished();
                })
            },
            journalist:function(finished) {
                Journalist.Create(TestData.TestJournalist,function(e,journalist) {
                    TestData.TestJournalist = journalist;
                    finished();
                });
            },
            publisher:function(finished) {
                Publisher.Create(TestData.TestPublisher,function(e,publisher) {
                    TestData.TestPublisher = publisher;
                    finished();
                });
            }
        },
        function(e1,results1) {
            console.log('in first step of series');
            Async.parallel({
                rate: function(finished) {
                    TestData.TestArticle.rate({
                        importance: 3,
                        independence: 5,
                        factuality: 4,
                        transparency: 5
                    }, TestData.TestUser['@rid'], function(e, rated) {
                        rated.should.be.true;
                        //console.log('rated>>',rated,'<<')
                        finished();
                    });
                },
                assignJournalist:function(finished) {
                    console.log('journalist id >>>',TestData.TestJournalist['@rid'],'<<<');
                    TestData.TestArticle.assign_journalist(TestData.TestJournalist['@rid'], function(e, added){
                        finished();
                    });
                },
                assignPublisher:function(finished) {
                    TestData.TestArticle.assign_publisher(TestData.TestPublisher['@rid'], function(e, added){
                        console.log('>>>',arguments,'<<<');
                        finished();
                    });
                }
            },function(e,results) {
                Group.Find({ where: { '@rid': TestData.TestGroup['@rid'] }}, function(e, group) {
                    group.get_recently_rated(function(e, reviews) {
                        var exists = false;
                        console.log('reviews==========',reviews.length);
                        if( reviews.length === 1 ) {
                            exists = reviews[0].title === TestData.TestArticle.title;
                            //exists = ( reviews[0].title === TestData.TestArticle.title ) &&
                            //( reviews[0].body === TestData.TestArticle.body );
                        }
                        exists.should.be.ok;
        
                        done();
                    })
                })
            });
        });
    });


    /**
     * Need a solution for this test
     *
    test('> Deleted member should not be part of group', function(done){
        Group.Find({ where: { '@rid': TestData.TestGroup['@rid'] }}, function(e, group) {
            group.get_members(function(e, members){
                console.log(members);
                console.log(e)
                members.should.be.empty;
                done();
            })

        });
    });
    */

    // --
    // Model Integrity
    // --

    test('> Integrity: Creating a Group with an existing name should have a unique slug', function(done) {
        Group.Create(TestData.TestGroup2, function(e, group) {
            try {
                group.should.be.ok;
                group['@rid'].should.be.ok;
                group['slug'].should.be.ok;
                group['slug'].should.not.equal(TestData.TestGroup.slug);

                group.delete(function(e) {
                    Group.Find({ where: { '@rid': group['@rid'] }}, function(e, group) {
                        group.should.not.be.ok;
                        done();
                    });
                });
            }
            catch (e) {
                done(e);
                return;
            }
        });
    });

    
    
    test('> Integrity: Adding a moderator who is not first a member should fail', function(done){
        Group.Find({ where: { '@rid': TestData.TestGroup['@rid'] }}, function(e, group) {
            group.add_moderator(TestData.TestUser1['@rid'], function(e, added) {
                should(e).should.be.ok;
                should(added).not.be.ok

                group.get_moderators(function(e, mods) {
                    mods.should.be.empty;
                    done();
                })
            })
        });
    })

    // --
    // Suite Teardown
    // --

    test('> Delete a Group', function(done) {
        Group.Find({ where: { '@rid': TestData.TestGroup['@rid'] }}, function(e, group) {
            try {
                group.should.be.ok;
                group.delete(function(e) {
                    Group.Find({ where: { '@rid': TestData.TestGroup['@rid'] }}, function(e, dgroup) {
                        dgroup.should.not.be.ok;
                        done();
                    });
                });
            }
            catch(e) {
                done(e);
                return;
            }
        });
    });

    after(function(done) {
        User.Find({ where: { '@rid': TestData.TestUser['@rid'] }}, function(e, user) {
            user.should.be.ok;
            user.delete(function(e) {
                User.Find({ where: { '@rid': TestData.TestUser1['@rid'] }}, function(e, user2) {
                    user2.should.be.ok;
                    user2.delete(function (e) {
                        done();
                    });
                });
            });
        });
    });

});
