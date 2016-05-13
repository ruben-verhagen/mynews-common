// ----------------
//   Dependencies
// ----------------

var Util        = require('util');
var Config      = require('../config.json');
var Mynews       = require('../database/database');
var crypto      = require('crypto');
var should      = require('should');
var Async       = require('async');

var Publisher   = require('../models/publisher');
var Journalist  = require('../models/journalist')
var User        = require('../models/user');
var Article     = require('../models/article');

var test = it;

// ----------------
//   Test
// ----------------

var TestData = {
    TestPublisher: {
        name: 'test publisher',
        url: 'http://sample.test.publisher',
        imageUrl: 'http://image.test.publisher',
        summary: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque sapien massa, ullamcorper eu.',
        about: 'Consectetur adipiscing elit. Pellentesque sapien massa, ullamcorper eu. Praesent gravida purus id consequat dapibus.',
        specialty: 'Nunc ac ante egestas, interdum massa sed, rutrum libero. Praesent nec elit ipsum.',
        owner: 'Somebody Cool',
        owner_url: 'http://somecoolcompany.com',
        twitter: 'test.publisher',
        facebook: 'testpub'
    },
    TestPublisher2: {
        name: 'test publisher',
        url: 'http://sample.test.publisher',
        imageUrl: 'http://image.test.publisher'
    },
    TestPublisherChanged: {
        name: 'test publisher changed',
        url: 'http://changed.test.publisher',
        imageUrl: 'http://image.changed.publisher',
        summary: '2 Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque sapien massa, ullamcorper eu.',
        about: '2 Consectetur adipiscing elit. Pellentesque sapien massa, ullamcorper eu. Praesent gravida purus id consequat dapibus.',
        specialty: '2 Nunc ac ante egestas, interdum massa sed, rutrum libero. Praesent nec elit ipsum.',
        owner: '2 Somebody Cool',
        owner_url: 'http://somecoolcompany2.com',
        twitter: 'test2.publisher2',
        facebook: 'test22pub'
    },
    TestUser: {
        handle: 'testuser',
        password: 'testpass',
        first_name: 'Test',
        last_name: 'User',
        email: 'test_name@publisher.com',
        status : 1
    },
    TestUser2: {
        handle: 'testuser2',
        password: 'testpass2',
        first_name: 'Test2',
        last_name: 'User2',
        email: 'test_name2@publisher.com',
        status : 1
    },
    TestArticle: {
        title: "Sample article",
        body: "Sample article body",
        imageUrl: "http://www.sampleimage.com/1.jpg",
        url: "http://www.samplearticle.com/sample-url",
        post_date: 1395833698,
        featured: 1
    },
    TestArticle2: {
        title: "Sample article 2",
        body: "Sample article body 2",
        imageUrl: "http://www.sampleimage.com/2.jpg",
        url: "http://www.samplearticle.com/2nd-sample-url",
        post_date: 1395833698,
        featured: 1
    },
    TestArticle3: {
        title: "Sample article 3",
        body: "Sample article body 3",
        imageUrl: "http://www.sampleimage.com/3.jpg",
        url: "http://www.samplearticle.com/third-sample-url",
        post_date: 1395833698,
        featured: 1
    },
    TestArticle4: {
        title: "Sample article 4",
        body: "Sample article body 4",
        imageUrl: "http://www.sampleimage.com/4.jpg",
        url: "http://www.samplearticle.com/fourth-sample-url",
        post_date: 1395833698,
        featured: 1
    },
    TestJournalist: {
        first_name: 'test',
        last_name: 'Journalist',
        email: 'ruben+mynews_tu@gmail.com',
        url: 'http://sample.journalist',
        imageUrl: 'http://sample.journalist.img',
        status: 1
    },
    TestJournalist2: {
        first_name: 'secondtest',
        last_name: 'Journalist',
        email: 'ruben+mynews_tu2@gmail.com',
        url: 'http://secondsample.journalist',
        imageUrl: 'http://secondsample.journalist.img',
        status: 1
    },
    TestJournalist3: {
        first_name : "The",
        last_name : "UnderTaker",
        email: "deadman@wwe.com",
        imageUrl:"www.google.com",
        status :1,
        journalistBackground:
            [{
                organization : 'Indian Institute of Technology, Delhi',
                title : 'Computer Science',
                year_start : '2003',
                year_end : '2007',
                description: 'B. Tech in Computer Science'
            }]
    }
}

describe('Publisher :', function() {

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
                TestData.TestUser['@rid'] = user['@rid'];
                Article.Create(TestData.TestArticle, function(e, article) {
                    TestData.TestArticle['@rid'] = article['@rid'];
                    Article.Create(TestData.TestArticle2, function(e, article2) {
                        TestData.TestArticle2['@rid'] = article2['@rid'];
                        User.Create(TestData.TestUser2, function(e, user2) {
                            TestData.TestUser2['@rid'] = user2['@rid'];
                            user.add_friend(user2['@rid'], function(e, added) {
                                done(e);
                            })
                        })
                    });
                });
            });
        });
    });

    // --
    // Model CRUD
    // --

    test('> Create a Publisher', function(done) {
        Publisher.Create(TestData.TestPublisher, function(e, publisher) {
            try {
                publisher.should.be.ok;
                if (publisher) {
                    publisher['@rid'].should.be.ok;
                    publisher['slug'].should.be.ok;
                    TestData.TestPublisher['@rid'] = publisher['@rid'];
                    TestData.TestPublisher['slug'] = publisher['slug'];
                    publisher.name.should.equal(TestData.TestPublisher.name);
                    publisher.url.should.equal(TestData.TestPublisher.url);
                    publisher.imageUrl.should.equal(TestData.TestPublisher.imageUrl);
                    publisher.summary.should.equal(TestData.TestPublisher.summary);
                    publisher.about.should.equal(TestData.TestPublisher.about);
                    publisher.specialty.should.equal(TestData.TestPublisher.specialty);
                    publisher.owner.should.equal(TestData.TestPublisher.owner);
                    publisher.owner_url.should.equal(TestData.TestPublisher.owner_url);
                    publisher.twitter.should.equal(TestData.TestPublisher.twitter);
                    publisher.facebook.should.equal(TestData.TestPublisher.facebook);
                    publisher.creation_date.should.be.ok;
                    publisher.modification_date.should.be.ok;
                    publisher.creation_date.should.equal(publisher.modification_date);
                    publisher.creation_date.should.be.within(Math.round(Date.now() / 1000) - 2, Math.round(Date.now() / 1000));
                }
                done();
            }
            catch (e) {
                done(e);
                return;
            }
        });
    });

    test('> Create 2nd Publisher', function(done) {
        Publisher.Create(TestData.TestPublisher2, function(e, publisher) {
            try {
                publisher.should.be.ok;
                if (publisher) {
                    publisher['@rid'].should.be.ok;
                    publisher['slug'].should.be.ok;
                    TestData.TestPublisher2['@rid'] = publisher['@rid'];
                    TestData.TestPublisher2['slug'] = publisher['slug'];
                    publisher.name.should.equal(TestData.TestPublisher.name);
                    publisher.url.should.equal(TestData.TestPublisher.url);
                    publisher.imageUrl.should.equal(TestData.TestPublisher.imageUrl);
                    publisher.creation_date.should.be.ok;
                    publisher.modification_date.should.be.ok;
                    publisher.creation_date.should.equal(publisher.modification_date);
                    publisher.creation_date.should.be.within(Math.round(Date.now() / 1000) - 2, Math.round(Date.now() / 1000));
                }
                done();
            }
            catch (e) {
                done(e);
                return;
            }
        });
    });

    test('> Retrieve a Publisher', function(done) {
        Publisher.Find({ where: { '@rid': TestData.TestPublisher['@rid'] }}, function(e, publisher) {
            try {
                publisher.should.be.ok;
                if (publisher) {
                    publisher['@rid'].should.equal(TestData.TestPublisher['@rid']);
                    publisher.name.should.equal(TestData.TestPublisher.name);
                    publisher.url.should.equal(TestData.TestPublisher.url);
                    publisher.imageUrl.should.equal(TestData.TestPublisher.imageUrl);
                    publisher.slug.should.equal(TestData.TestPublisher.slug);
                    publisher.summary.should.equal(TestData.TestPublisher.summary);
                    publisher.about.should.equal(TestData.TestPublisher.about);
                    publisher.specialty.should.equal(TestData.TestPublisher.specialty);
                    publisher.owner.should.equal(TestData.TestPublisher.owner);
                    publisher.owner_url.should.equal(TestData.TestPublisher.owner_url);
                    publisher.twitter.should.equal(TestData.TestPublisher.twitter);
                    publisher.facebook.should.equal(TestData.TestPublisher.facebook);
                    publisher.creation_date.should.be.ok;
                    publisher.modification_date.should.be.ok;
                    publisher.creation_date.should.equal(publisher.modification_date);
                    publisher.creation_date.should.be.within(Math.round(Date.now() / 1000) - 2, Math.round(Date.now() / 1000));
                }
                done();
            }
            catch (e) {
                done(e);
                return;
            }
        })
    });

    test('> Update a Publisher', function(done) {
        Publisher.Find({ where: { '@rid': TestData.TestPublisher['@rid'] }}, function(e, publisher) {
            try {
                publisher.should.be.ok;
                if (publisher) {
                    publisher.url = TestData.TestPublisherChanged.url;
                    publisher.name = TestData.TestPublisherChanged.name;
                    publisher.imageUrl = TestData.TestPublisherChanged.imageUrl;
                    publisher.summary = TestData.TestPublisherChanged.summary;
                    publisher.about = TestData.TestPublisherChanged.about;
                    publisher.specialty = TestData.TestPublisherChanged.specialty;
                    publisher.owner = TestData.TestPublisherChanged.owner;
                    publisher.owner_url = TestData.TestPublisherChanged.owner_url;
                    publisher.facebook = TestData.TestPublisherChanged.facebook;
                    publisher.twitter = TestData.TestPublisherChanged.twitter;
                    setTimeout(function(){
                        publisher.save(function(e) {
                            Publisher.Find({ where: { '@rid': TestData.TestPublisher['@rid'] }}, function(e, dpublisher) {
                                dpublisher.should.be.ok;
                                if (dpublisher) {
                                    dpublisher.url.should.equal( TestData.TestPublisherChanged.url );
                                    dpublisher.name.should.equal( TestData.TestPublisherChanged.name );
                                    dpublisher.imageUrl.should.equal( TestData.TestPublisherChanged.imageUrl );
                                    dpublisher.summary.should.equal(TestData.TestPublisherChanged.summary);
                                    dpublisher.about.should.equal(TestData.TestPublisherChanged.about);
                                    dpublisher.specialty.should.equal(TestData.TestPublisherChanged.specialty);
                                    dpublisher.owner.should.equal(TestData.TestPublisherChanged.owner);
                                    dpublisher.owner_url.should.equal(TestData.TestPublisherChanged.owner_url);
                                    dpublisher.twitter.should.equal(TestData.TestPublisherChanged.twitter);
                                    dpublisher.facebook.should.equal(TestData.TestPublisherChanged.facebook);
                                    dpublisher.modification_date.should.be.above(dpublisher.creation_date);
                                }
                                done();
                            });
                        });
                    }, 1000);
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

    test('> Get average rating of publishers who is not rated yet', function(done) {
        Publisher.Find({where : {'@rid' : TestData.TestPublisher['@rid'] }}, function(e, publisher) {
            publisher.get_avg_rating_user(function(e, rating) {
                rating.should.equal(0);
                done();
            });
        });
    });

    test('> Get Recently rated publishers', function(done) {
        Article.Find({ where: { '@rid': TestData.TestArticle['@rid']}}, function(e, article) {
            article.should.be.ok;

            article.assign_publisher(TestData.TestPublisher['@rid'], function(e, added) {
                article.rate({
                    importance: 3,
                    independence: 3,
                    factuality: 3,
                    transparency: 3
                }, TestData.TestUser['@rid'], function(e, rated) {
                    rated.should.be.true;

                    Publisher.FindAll_RecentlyRated( {where : {'@rid' : TestData.TestUser['@rid'] }}, function(e, publishers) {
                        publishers.should.be.Array;
                        publishers.length.should.be.equal(1);

                        Article.Find({ where: { '@rid': TestData.TestArticle2['@rid']}}, function(e, article2) {
                            article2.should.be.ok;

                            article2.assign_publisher(TestData.TestPublisher2['@rid'], function(e, added) {
                                article2.rate({
                                    importance: 4,
                                    independence: 4,
                                    factuality: 4,
                                    transparency: 4
                                }, TestData.TestUser['@rid'], function(e, rated) {
                                    rated.should.be.true;

                                    Publisher.FindAll_RecentlyRated({where : {'@rid' : TestData.TestUser['@rid'] }}, function(e, publishers) {
                                        publishers.should.be.Array;
                                        publishers.length.should.be.equal(2);
                                        //publishers[0]['@rid'].should.be.equal(TestData.TestPublisher2['@rid']);
                                        //publishers[1]['@rid'].should.be.equal(TestData.TestPublisher['@rid']);
                                        done();
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });

    test('> Get average rating of publishers by users', function(done) {
        Article.Find({ where: { '@rid': TestData.TestArticle2['@rid']}}, function(e, article2) {
            try {
                article2.should.be.ok;

                article2.assign_publisher(TestData.TestPublisher['@rid'], function (e, added) {
                    article2.rate({
                        importance: 4,
                        independence: 4,
                        factuality: 4,
                        transparency: 4
                    }, TestData.TestUser2['@rid'], function (e, rated) {
                        rated.should.be.true;

                        Publisher.Find({ where: { '@rid': TestData.TestPublisher['@rid'] }}, function (e, publisher) {

                            publisher.get_avg_rating_user(function(e, rating) {
                                try {
                                    rating.should.be.within(0.1, 4.9);
                                    done();
                                }
                                catch (ee) {
                                    console.log(ee);
                                    done(ee);
                                }
                            });
                        });
                    });
                });
            }
            catch(e) {
                done(e);
            }
        });
    });

    test('> Get Recently rated Publishers by friends', function(done) {
        Publisher.FindAll_RecentlyRatedByFriends({ where: { '@rid': TestData.TestUser2['@rid'] }}, function(e, publishers) {
            try {
                // TODO: Improve test!
                publishers.should.be.Array;
                done();
            }
            catch(e) {
                done(e);
            }
        });
    });

    test('> Get Top rated publishers ', function(done) {
        Publisher.FindAll_TopRated({}, function(e, publishers) {
            publishers.should.be.Array;
            done();
        });
    });

    test('> Get the Publishers\'s Journalists ', function(done) {
        Publisher.Find({ where: { '@rid': TestData.TestPublisher['@rid'] }}, function(e, publisher) {
            try {
                publisher.should.be.ok;

                var articles = {
                    three: false,
                    four: false
                };

                var journalists = {
                    two: false,
                    three: false
                };

                Async.series([
                    // Create a test Journalist
                    function(done) {
                        Journalist.Create(TestData.TestJournalist2, function(e, journalist) {
                            journalist.should.be.ok;
                            TestData.TestJournalist2['@rid'] = journalist['@rid'];
                            journalists.two = journalist;
                            done(e);
                        });
                    },

                    // Create a second Journalist
                    function(done) {
                        Journalist.Create(TestData.TestJournalist3, function(e, journalist) {
                            journalist.should.be.ok;
                            TestData.TestJournalist3['@rid'] = journalist['@rid'];
                            journalists.three = journalist;
                            done(e);
                        });
                    },

                    // Create a test Article
                    function(done) {
                        Article.Create(TestData.TestArticle3, function(e, article) {
                            article.should.be.ok;
                            TestData.TestArticle3['@rid'] = article['@rid'];
                            articles.three = article;

                            // Assign our Publisher to the Article
                            article.assign_publisher(publisher['@rid'], function(e, result) {
                                result.should.be.true;

                                article.assign_journalist(TestData.TestJournalist2['@rid'], function(e, result) {
                                    result.should.be.true;
                                    done(e);
                                });
                            });
                        });
                    },

                    // Create another test Article
                    function(done) {
                        Article.Create(TestData.TestArticle4, function(e, article) {
                            article.should.be.ok;
                            TestData.TestArticle4['@rid'] = article['@rid'];
                            articles.four = article;

                            // Assign our Publisher to the Article
                            article.assign_publisher(publisher['@rid'], function(e, result) {
                                result.should.be.true;

                                article.assign_journalist(TestData.TestJournalist3['@rid'], function(e, result) {
                                    result.should.be.true;
                                    done(e);
                                });
                            });
                        });
                    }
                ], function(e) {
                    // Finally, get journalists of this publisher
                    publisher.get_journalists(function(e, journs) {
                        journs.should.be.Array;
                        journs.length.should.be.above(1);

                        Async.parallel([
                            function(done) {
                                articles.three.delete(function(e, result) {
                                    done();
                                });
                            },
                            function(done) {
                                articles.four.delete(function(e, result) {
                                    done();
                                });
                            },
                            function(done) {
                                journalists.two.delete(function(e, result) {
                                    done();
                                });
                            },
                            function(done) {
                                journalists.three.delete(function(e, result) {
                                    done();
                                });
                            }
                        ], done);
                    });
                });
            }
            catch (e) {
                done(e);
                return;
            }
        })
    });

    test('> Get count of this Publishers Articles ', function(done) {
        Publisher.Find({ where: { '@rid': TestData.TestPublisher['@rid'] }}, function(e, publisher) {
            try {
                publisher.should.be.ok;

                publisher.get_article_count(function(e, count) {
                    count.should.be.above(0);
                    done();
                });
            }
            catch(e) {
                done(e);
                return;
            }
        });
    });

    test('> Count number of people following this Publisher', function(done) {
        try {
            User.Find({ where: { '@rid': TestData.TestUser['@rid'] }}, function(e, user) {
                user.should.be.ok;
                user.get_feed_settings(function(e, settings) {
                    settings.should.be.ok;
                    settings.assign_publisher(TestData.TestPublisher['@rid'], function(e, status) {
                        // User is now following Publisher
                        Publisher.Find({ where: { '@rid': TestData.TestPublisher['@rid'] }}, function(e, publisher) {
                            publisher.should.be.ok;
                            publisher.get_follower_count(function(e, count) {
                                count.should.be.above(0);
                                done();
                            });
                        });
                    });
                });
            });
        }
        catch(e) {
            done(e);
            return;
        }

    })

    /*test('> Get the Publishers\'s Articles ', function(done) {
        Publisher.Find({ where: { '@rid': TestData.TestPublisher['@rid'] }}, function(e, publisher) {
            try {
                publisher.should.be.ok;

                // Check the articles
                // TODO:

                done();
            }
            catch (e) {
                done(e);
                return;
            }
        })
    });*/

    test('> Get Publishers Comments ', function(done) {
        // TODO:
        done();
    });

    // --
    // Model Integrity
    // --

    test('> Integrity: Creating a Publisher with duplicate name should have a unique slug', function(done) {
        Publisher.Create(TestData.TestPublisher2, function(e, publisher) {
            try {
                publisher.should.be.ok;
                if (publisher) {
                    publisher['@rid'].should.be.ok;
                    publisher['slug'].should.be.ok;
                    publisher['slug'].should.not.equal(TestData.TestPublisher.slug);

                    publisher.delete(function(e) {
                        Publisher.Find({ where: { '@rid': publisher['@rid'] }}, function(e, dpublisher) {
                            dpublisher.should.not.be.ok;
                        });
                    });
                }
                done();
            }
            catch (e) {
                done(e);
                return;
            }
        });
    });

    test('> Integrity: Trying to change a slug should be ignored', function(done) {
        Publisher.Find({ where: { '@rid': TestData.TestPublisher['@rid'] }}, function(e, publisher) {
            try {
                publisher.should.be.ok;
                if (publisher) {
                    publisher.slug = "new-slug";
                    publisher.save(function(e) {
                        Publisher.Find({ where: { '@rid': TestData.TestPublisher['@rid'] }}, function(e, dpublisher) {
                            dpublisher.should.be.ok;
                            if (dpublisher) {
                                dpublisher.slug.should.equal(TestData.TestPublisher['slug']);
                                dpublisher.slug.should.not.equal('new-slug');
                            }
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

    test('> Integrity: Slug uniqueness check should work', function(done) {
        Publisher.Find({ where: { '@rid': TestData.TestPublisher['@rid'] }}, function(e, publisher) {
            try {
                publisher._check_slug_uniqueness(TestData.TestPublisher.slug, function(e, result) {
                    if (e) {
                        throw e;
                    }
                    result.should.not.be.ok;

                    publisher._check_slug_uniqueness('x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x', function(e, result2) {
                        if (e) {
                            throw e;
                        }
                        result2.should.be.ok;

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

    test('> Integrity: Changing a slug (correctly) should work', function(done) {
        Publisher.Find({ where: { '@rid': TestData.TestPublisher['@rid'] }}, function(e, publisher) {
            try {
                var new_slug = '1234554321-slug-for-publisher-model-test-suite';

                publisher.change_slug(new_slug, function(e, pub) {
                    if (e) {
                        throw e;
                    }

                    pub.slug.should.equal( new_slug );

                    done();
                });
            }
            catch(e) {
                done(e);
                return;
            }
        });
    });

    // --
    // Suite Teardown
    // --

    test('> Delete a Publisher', function(done) {
        Publisher.Find({ where: { '@rid': TestData.TestPublisher['@rid'] }}, function(e, publisher) {
            try {
                publisher.should.be.ok;
                if (publisher) {
                    publisher.delete(function(e) {
                        Publisher.Find({ where: { '@rid': TestData.TestPublisher['@rid'] }}, function(e, dpublisher) {
                            dpublisher.should.not.be.ok;
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
        User.Find({ where: { '@rid': TestData.TestUser['@rid'] }}, function(e, user) {
            user.delete(function(e) {
                Article.Find({ where: { '@rid': TestData.TestArticle['@rid']}}, function(e, article) {
                    article.delete(function(e) {
                        User.Find({ where: { '@rid': TestData.TestUser2['@rid'] }}, function(e, user2) {
                            user2.delete(function(e) {
                                Article.Find({ where: { '@rid': TestData.TestArticle2['@rid']}}, function(e, article) {
                                    article.delete(done);
                                });
                            });
                        });
                    });
                });
            });
        });
    });

});
