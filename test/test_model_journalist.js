// ----------------
//   Dependencies
// ----------------

var Util        = require('util');
var Config      = require('../config.json');
var Mynews       = require('../database/database');
var crypto      = require('crypto');
var should      = require('should');
var Async       = require('async');

var Journalist              = require('../models/journalist');
var JournalistBackground    = require('../models/journalist_background');
var Article                 = require('../models/article');
var User                    = require('../models/user');
var Publisher               = require('../models/publisher');

var test = it;

// ----------------
//   Test
// ----------------

var TestData = {
    TestJournalist: {
        first_name: 'test',
        last_name: 'Journalist',
        email: 'ruben+mynews_tu@gmail.com',
        url: 'http://sample.journalist',
        imageUrl: 'http://sample.journalist.img',
        status: 1
    },
    TestJournalist2: {
        first_name: 'test',
        last_name: 'Journalist',
        email: 'ruben+mynews_tu2@gmail.com',
        url: 'http://sample.journalist',
        imageUrl: 'http://sample.journalist.img',
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
    },
    TestJournalist4: {
        first_name : "Shane",
        last_name : "Warne",
        email: "spinner@aussie.com",
        imageUrl:"www.google.com.au",
        status :1,
        journalistBackground:
        [{
            organization : 'Syndey Cricket Club',
            title : 'Leg Spinner',
            year_start : '2003',
            year_end : '2007',
            description: 'B. Tech in Computer Science'  
        },
        {
            organization : 'Mynews',
            title : 'Senior Engineer',
            year_start : '2014',
            year_end : 'current',
            description: 'NodeJS project',
        }]
    },
    TestJournalistFull:{
        first_name : "Brian",
        last_name : "Lara",
        email: "batsman@windies.com",
        imageUrl: "www.google.com.zk",
        status : 1,
        url : "www.facebook.com/brianlara",
        summary : "Brian lara is a left handed batsman. He plays for West Indies. he holds a record of 400 runs in test match",
        interest : 'cricket,batting,fielding,enjoy',
        contact_url : "www.donotcontact.com",
        contact_email :"me@myself.com",
        contact_twitter : "twitter.com",
        contact_fb : "fb.com/zGhGh",
        contact_linkedin :  "linkedin.com/ohyesabhi"
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
        imageUrl: "http://www.sampleimage.com/1.jpg",
        url: "http://www.samplearticle.com/sample-url",
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
    TestUser: {
        handle: 'testuser',
        password: 'testpass',
        first_name: 'Test',
        last_name: 'User',
        email: 'test_name@publisher.com',
        status : 1
    },
    TestPublisher: {
        name: 'test publisher10',
        url: 'http://sample.test10.publisher',
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
        name: 'test publisher11',
        url: 'http://sample.test11.publisher',
        imageUrl: 'http://image.test.publisher',
        summary: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque sapien massa, ullamcorper eu.',
        about: 'Consectetur adipiscing elit. Pellentesque sapien massa, ullamcorper eu. Praesent gravida purus id consequat dapibus.',
        specialty: 'Nunc ac ante egestas, interdum massa sed, rutrum libero. Praesent nec elit ipsum.',
        owner: 'Somebody Cool',
        owner_url: 'http://somecoolcompany.com',
        twitter: 'test.publisher',
        facebook: 'testpub'
    },
    TestPublisher3: {
        name: 'test publisher3',
        url: 'http://sample.test3.publisher',
        imageUrl: 'http://image.test3.publisher',
        summary: '3 Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque sapien massa, ullamcorper eu.',
        about: '3 Consectetur adipiscing elit. Pellentesque sapien massa, ullamcorper eu. Praesent gravida purus id consequat dapibus.',
        specialty: '3 Nunc ac ante egestas, interdum massa sed, rutrum libero. Praesent nec elit ipsum.',
        owner: '3 Somebody Cool',
        owner_url: 'http://somecoolcompany3.com',
        twitter: 'test3.publisher',
        facebook: 'testpub3'
    },
    TestPublisher4: {
        name: 'test publisher4',
        url: 'http://sample.test4.publisher',
        imageUrl: 'http://image.test4.publisher',
        summary: '4 Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque sapien massa, ullamcorper eu.',
        about: '4 Consectetur adipiscing elit. Pellentesque sapien massa, ullamcorper eu. Praesent gravida purus id consequat dapibus.',
        specialty: '4 Nunc ac ante egestas, interdum massa sed, rutrum libero. Praesent nec elit ipsum.',
        owner: '4 Somebody Cool',
        owner_url: 'http://somecoolcompany4.com',
        twitter: 'test4.publisher',
        facebook: 'testpub4'
    },
    TestJournalist5 : {
        first_name: 'testtest',
        last_name: 'journalist',
        email:  'testtest@journalist.com',
        status: 1
    }
}

describe('Journalist :', function() {

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
                    Article.Create(TestData.TestArticle2, function(e, article) {
                        TestData.TestArticle2['@rid'] = article['@rid'];
                        Publisher.Create(TestData.TestPublisher, function(e, publisher){
                           TestData.TestPublisher['@rid'] = publisher['@rid'];
                            Publisher.Create(TestData.TestPublisher2, function(e, publisher){
                               TestData.TestPublisher2['@rid'] = publisher['@rid'];
                               done();
                            });
                        });
                    });
                });
            });
        });
    });

    // --
    // Model CRUD
    // --

    test('> Create a Journalist', function(done) {
        Journalist.Create(TestData.TestJournalist, function(e, journalist) {
            try {
                journalist.should.be.ok;
                if (journalist) {
                    journalist['@rid'].should.be.ok;
                    journalist['slug'].should.be.ok;
                    TestData.TestJournalist['@rid'] = journalist['@rid'];
                    TestData.TestJournalist['slug'] = journalist['slug'];
                    journalist.first_name.should.equal(TestData.TestJournalist.first_name);
                    journalist.last_name.should.equal(TestData.TestJournalist.last_name);
                    journalist.email.should.equal(TestData.TestJournalist.email);
                    journalist.url.should.equal(TestData.TestJournalist.url);
                    journalist.imageUrl.should.equal(TestData.TestJournalist.imageUrl);
                    journalist.status.should.equal(TestData.TestJournalist.status);
                    journalist.creation_date.should.be.ok;
                    journalist.modification_date.should.be.ok;
                    journalist.creation_date.should.equal(journalist.modification_date);
                    journalist.creation_date.should.be.within(Math.round(Date.now() / 1000) - 2, Math.round(Date.now() / 1000));
                }
                done();
            }
            catch (e) {
                done(e);
                return;
            }
        });
    });

    test('> Create a Journalist with full data', function(done) {
        Journalist.Create(TestData.TestJournalistFull, function(e, journalist) {
            try {
                journalist.should.be.ok;
                if (journalist) {
                    journalist['@rid'].should.be.ok;
                    journalist['slug'].should.be.ok;
                    TestData.TestJournalistFull['@rid'] = journalist['@rid'];
                    TestData.TestJournalistFull['slug'] = journalist['slug'];
                    journalist.first_name.should.equal(TestData.TestJournalistFull.first_name);
                    journalist.last_name.should.equal(TestData.TestJournalistFull.last_name);
                    journalist.email.should.equal(TestData.TestJournalistFull.email);
                    journalist.url.should.equal(TestData.TestJournalistFull.url);
                    journalist.imageUrl.should.equal(TestData.TestJournalistFull.imageUrl);
                    journalist.status.should.equal(TestData.TestJournalistFull.status);
                    journalist.url.should.equal(TestData.TestJournalistFull.url);
                    journalist.summary.should.equal(TestData.TestJournalistFull.summary);
                    journalist.interest.should.equal(TestData.TestJournalistFull.interest);
                    journalist.contact_linkedin.should.equal(TestData.TestJournalistFull.contact_linkedin);
                    journalist.contact_fb.should.equal(TestData.TestJournalistFull.contact_fb);
                    journalist.contact_twitter.should.equal(TestData.TestJournalistFull.contact_twitter);
                    journalist.contact_email.should.equal(TestData.TestJournalistFull.contact_email);
                    journalist.contact_url.should.equal(TestData.TestJournalistFull.contact_url);
                    journalist.creation_date.should.be.ok;
                    journalist.modification_date.should.be.ok;
                    journalist.creation_date.should.equal(journalist.modification_date);
                    journalist.creation_date.should.be.within(Math.round(Date.now() / 1000) - 2, Math.round(Date.now() / 1000));
                }
                done();
            }
            catch (e) {
                done(e);
                return;
            }
        });
    });

    test('> Create a Journalist with a background', function(done) {
        Journalist.Create(TestData.TestJournalist3, function(e, journalist) {
            try {
                journalist.should.be.ok;
                journalist['@rid'].should.be.ok;
                journalist['slug'].should.be.ok;
                TestData.TestJournalist3['@rid'] = journalist['@rid'];
                TestData.TestJournalist3['slug'] = journalist['slug'];
                journalist.first_name.should.equal(TestData.TestJournalist3.first_name);
                journalist.last_name.should.equal(TestData.TestJournalist3.last_name);
                journalist.email.should.equal(TestData.TestJournalist3.email);
                journalist.imageUrl.should.equal(TestData.TestJournalist3.imageUrl);
                journalist.status.should.equal(TestData.TestJournalist3.status);
                journalist.creation_date.should.be.ok;
                journalist.modification_date.should.be.ok;
                journalist.creation_date.should.equal(journalist.modification_date);
                journalist.creation_date.should.be.within(Math.round(Date.now() / 1000) - 2, Math.round(Date.now() / 1000));
                journalist.journalistBackground.should.be.ok;
                journalist.journalistBackground[0].organization.should.equal(TestData.TestJournalist3.journalistBackground[0].organization);
                journalist.journalistBackground[0].title.should.equal(TestData.TestJournalist3.journalistBackground[0].title);
                journalist.journalistBackground[0].year_end.should.equal(TestData.TestJournalist3.journalistBackground[0].year_end);
                journalist.journalistBackground[0].year_start.should.equal(TestData.TestJournalist3.journalistBackground[0].year_start);
                journalist.journalistBackground[0].description.should.equal(TestData.TestJournalist3.journalistBackground[0].description);
                TestData.TestJournalist3.journalistBackground[0]['@rid'] = journalist.journalistBackground[0]['@rid'];
                done();
            }
            catch (e) {
                done(e);
                return;
            }
        });
    });

    test('> Create a Journalist with multiple backgrounds', function(done) {
        Journalist.Create(TestData.TestJournalist4, function(e, journalist) {
            try {
                journalist.should.be.ok;
                journalist['@rid'].should.be.ok;
                journalist['slug'].should.be.ok;
                TestData.TestJournalist4['@rid'] = journalist['@rid'];
                TestData.TestJournalist4['slug'] = journalist['slug'];
                journalist.first_name.should.equal(TestData.TestJournalist4.first_name);
                journalist.last_name.should.equal(TestData.TestJournalist4.last_name);
                journalist.email.should.equal(TestData.TestJournalist4.email);
                journalist.imageUrl.should.equal(TestData.TestJournalist4.imageUrl);
                journalist.creation_date.should.be.ok;
                journalist.modification_date.should.be.ok;
                journalist.creation_date.should.equal(journalist.modification_date);
                journalist.creation_date.should.be.within(Math.round(Date.now() / 1000) - 2, Math.round(Date.now() / 1000));
                journalist.status.should.equal(TestData.TestJournalist4.status);
                journalist.journalistBackground.should.be.Array;
                journalist.journalistBackground[0].organization.should.equal(TestData.TestJournalist4.journalistBackground[0].organization);
                journalist.journalistBackground[0].title.should.equal(TestData.TestJournalist4.journalistBackground[0].title);
                journalist.journalistBackground[0].year_end.should.equal(TestData.TestJournalist4.journalistBackground[0].year_end);
                journalist.journalistBackground[0].year_start.should.equal(TestData.TestJournalist4.journalistBackground[0].year_start);
                journalist.journalistBackground[0].description.should.equal(TestData.TestJournalist4.journalistBackground[0].description);
                journalist.journalistBackground[1].organization.should.equal(TestData.TestJournalist4.journalistBackground[1].organization);
                journalist.journalistBackground[1].title.should.equal(TestData.TestJournalist4.journalistBackground[1].title);
                journalist.journalistBackground[1].year_end.should.equal(TestData.TestJournalist4.journalistBackground[1].year_end);
                journalist.journalistBackground[1].year_start.should.equal(TestData.TestJournalist4.journalistBackground[1].year_start);
                journalist.journalistBackground[1].description.should.equal(TestData.TestJournalist4.journalistBackground[1].description);

                TestData.TestJournalist4.journalistBackground[0]['@rid'] = journalist.journalistBackground[0]['@rid']
                TestData.TestJournalist4.journalistBackground[1]['@rid'] = journalist.journalistBackground[1]['@rid']
                done();
            }
            catch (e) {
                done(e);
                return;
            }
        });
    });

    test('> Create a Journalist with Same name - for checking slug uniqueness', function(done) {
        Journalist.Create(TestData.TestJournalist2, function(e, journalist) {
            try {
                journalist.should.be.ok;
                if (journalist) {
                    journalist['@rid'].should.be.ok;
                    journalist['slug'].should.be.ok;
                    journalist['slug'].should.not.equal(TestData.TestJournalist.slug);

                    journalist.delete(function(e) {
                        Journalist.Find({ where: { '@rid': journalist['@rid'] }}, function(e, djournalist) {
                            djournalist.should.not.be.ok;
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

    test('> Retrieve a Journalist', function(done) {
        Journalist.Find({ where: { '@rid': TestData.TestJournalist['@rid'] }}, function(e, journalist) {
            try {
                journalist.should.be.ok;
                if (journalist) {
                    journalist['@rid'].should.equal(TestData.TestJournalist['@rid']);
                    journalist.first_name.should.equal(TestData.TestJournalist.first_name);
                    journalist.last_name.should.equal(TestData.TestJournalist.last_name);
                    journalist.email.should.equal(TestData.TestJournalist.email);
                    journalist.url.should.equal(TestData.TestJournalist.url);
                    journalist.imageUrl.should.equal(TestData.TestJournalist.imageUrl);
                    journalist.status.should.equal(TestData.TestJournalist.status);
                    journalist.slug.should.equal(TestData.TestJournalist.slug);
                    journalist.creation_date.should.be.ok;
                    journalist.modification_date.should.be.ok;
                    journalist.creation_date.should.equal(journalist.modification_date);
                    journalist.creation_date.should.be.within(Math.round(Date.now() / 1000) - 2, Math.round(Date.now() / 1000));
                }
                done();
            }
            catch (e) {
                done(e);
                return;
            }
        })
    });

    test('> Retrieve a Journalist with background', function(done) {
        Journalist.Find({ where: { '@rid': TestData.TestJournalist3['@rid'] }}, function(e, journalist) {
            try {
                journalist.should.be.ok;
                if (journalist) {
                    journalist['@rid'].should.equal(TestData.TestJournalist3['@rid']);
                    journalist.first_name.should.equal(TestData.TestJournalist3.first_name);
                    journalist.last_name.should.equal(TestData.TestJournalist3.last_name);
                    journalist.email.should.equal(TestData.TestJournalist3.email);
                    journalist.imageUrl.should.equal(TestData.TestJournalist3.imageUrl);
                    journalist.status.should.equal(TestData.TestJournalist3.status);
                    journalist.slug.should.equal(TestData.TestJournalist3.slug);
                    journalist.creation_date.should.be.ok;
                    journalist.modification_date.should.be.ok;
                    journalist.creation_date.should.equal(journalist.modification_date);
                    journalist.creation_date.should.be.within(Math.round(Date.now() / 1000) - 2, Math.round(Date.now() / 1000));
                    journalist.journalistBackground.should.be.ok;
                    journalist.journalistBackground[0].organization.should.equal(TestData.TestJournalist3.journalistBackground[0].organization);
                    journalist.journalistBackground[0].title.should.equal(TestData.TestJournalist3.journalistBackground[0].title);
                    journalist.journalistBackground[0].year_end.should.equal(TestData.TestJournalist3.journalistBackground[0].year_end);
                    journalist.journalistBackground[0].year_start.should.equal(TestData.TestJournalist3.journalistBackground[0].year_start);
                    journalist.journalistBackground[0].description.should.equal(TestData.TestJournalist3.journalistBackground[0].description);
                }
                done();
            }
            catch (e) {
                done(e);
                return;
            }
        })
    });

    test('> Retrieve a Journalist with multiple background', function(done) {
        Journalist.Find({ where: { '@rid': TestData.TestJournalist4['@rid'] }}, function(e, journalist) {
            try {
                journalist.should.be.ok;
                if (journalist) {
                    journalist['@rid'].should.equal(TestData.TestJournalist4['@rid']);
                    journalist.first_name.should.equal(TestData.TestJournalist4.first_name);
                    journalist.last_name.should.equal(TestData.TestJournalist4.last_name);
                    journalist.email.should.equal(TestData.TestJournalist4.email);
                    journalist.imageUrl.should.equal(TestData.TestJournalist4.imageUrl);
                    journalist.status.should.equal(TestData.TestJournalist4.status);
                    journalist.creation_date.should.be.ok;
                    journalist.modification_date.should.be.ok;
                    journalist.creation_date.should.equal(journalist.modification_date);
                    journalist.creation_date.should.be.within(Math.round(Date.now() / 1000) - 2, Math.round(Date.now() / 1000));
                    journalist.journalistBackground.should.be.Array;
                    journalist.journalistBackground[0].organization.should.equal(TestData.TestJournalist4.journalistBackground[0].organization);
                    journalist.journalistBackground[0].title.should.equal(TestData.TestJournalist4.journalistBackground[0].title);
                    journalist.journalistBackground[0].year_end.should.equal(TestData.TestJournalist4.journalistBackground[0].year_end);
                    journalist.journalistBackground[0].year_start.should.equal(TestData.TestJournalist4.journalistBackground[0].year_start);
                    journalist.journalistBackground[0].description.should.equal(TestData.TestJournalist4.journalistBackground[0].description);
                    journalist.journalistBackground[1].organization.should.equal(TestData.TestJournalist4.journalistBackground[1].organization);
                    journalist.journalistBackground[1].title.should.equal(TestData.TestJournalist4.journalistBackground[1].title);
                    journalist.journalistBackground[1].year_end.should.equal(TestData.TestJournalist4.journalistBackground[1].year_end);
                    journalist.journalistBackground[1].year_start.should.equal(TestData.TestJournalist4.journalistBackground[1].year_start);
                    journalist.journalistBackground[1].description.should.equal(TestData.TestJournalist4.journalistBackground[1].description);
                }
                done();
            }
            catch (e) {
                done(e);
                return;
            }
        })
    });

    test('> Update a Journalist - trying to change slug also ', function(done) {
        Journalist.Find({ where: { '@rid': TestData.TestJournalist['@rid'] }}, function(e, journalist) {
            try {
                journalist.should.be.ok;
                if (journalist) {
                    journalist.url = 'http://new.journalist.url';
                    journalist.slug = 'new-slug';
                    setTimeout(function() {
                        journalist.save(function(e) {
                            Journalist.Find({ where: { '@rid': TestData.TestJournalist['@rid'] }}, function(e, djournalist) {
                                djournalist.should.be.ok;
                                if (djournalist) {
                                    djournalist.url.should.equal('http://new.journalist.url');
                                    djournalist.slug.should.equal(TestData.TestJournalist['slug']);
                                    djournalist.slug.should.not.equal('new-slug');
                                    djournalist.modification_date.should.be.above(djournalist.creation_date);
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

    test('> Get Recently rated journalists', function(done) {
        Article.Find({ where: { '@rid': TestData.TestArticle['@rid']}}, function(e, article) {
            article.should.be.ok;
            article.assign_journalist(TestData.TestJournalist['@rid'], function(e, added){
                article.rate({
                    importance: 3,
                    independence: 3,
                    factuality: 3,
                    transparency: 3
                }, TestData.TestUser['@rid'], function(e, rated) {
                    rated.should.be.true;
                    Journalist.FindAll_RecentlyRated( {where : {'@rid' : TestData.TestUser['@rid'] }}, function(e, journalists) {
                        journalists.should.be.Array;
                        journalists.length.should.be.equal(1);
                        Article.Find({ where: { '@rid': TestData.TestArticle2['@rid']}}, function(e, article2) {
                            article2.should.be.ok;
                            article2.assign_journalist(TestData.TestJournalist3['@rid'], function(e, added) {
                                article2.rate({
                                    importance: 4,
                                    independence: 4,
                                    factuality: 4,
                                    transparency: 4
                                }, TestData.TestUser['@rid'], function(e, rated) {
                                    rated.should.be.true;
                                    Journalist.FindAll_RecentlyRated({where : {'@rid' : TestData.TestUser['@rid'] }}, function(e, journalists) {
                                        journalists.should.be.Array;
                                        journalists.length.should.be.equal(2);
                                        //journalists[0]['@rid'].should.be.equal(TestData.TestJournalist3['@rid']);
                                        //journalists[1]['@rid'].should.be.equal(TestData.TestJournalist['@rid']);
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

    test('> Journalist association: Find journalist or create one', function(done) {
        Journalist.FindOrCreate(TestData.TestJournalist5, TestData.TestPublisher, function(e, cjournalist) {
            try {
                cjournalist.should.be.ok;
                TestData.TestJournalist5['@rid'] = cjournalist['@rid'];
                done();
            }
            catch(e) {
                done(e);
                return;
            }
        });
    });

    test('> Journalist association: Find journalist or create one - 2', function(done) {
        Journalist.FindOrCreate(TestData.TestJournalist5, TestData.TestPublisher, function(e, cjournalist) {
            try {
                cjournalist.should.be.ok;
                cjournalist['@rid'].should.be.equal(TestData.TestJournalist5['@rid']);
                done();
            }
            catch(e) {
                done(e);
                return;
            }
        });
    })

    test('> Journalist association: Find journalist or create one - 3', function(done) {
        Journalist.FindOrCreate(TestData.TestJournalist5, TestData.TestPublisher2, function(e, cjournalist) {
            try {
                cjournalist.should.be.ok;
                cjournalist['@rid'].should.be.equal(TestData.TestJournalist5['@rid']);
                done();
            }
            catch(e) {
                done(e);
                return;
            }
        });
    })

    test('> Count number of people following this Journalist', function(done) {
        try {
            User.Find({ where: { '@rid': TestData.TestUser['@rid'] }}, function(e, user) {
                user.should.be.ok;
                user.get_feed_settings(function(e, settings) {
                    settings.should.be.ok;
                    settings.assign_journalist(TestData.TestJournalist['@rid'], function(e, status) {
                        // User is now following Journalist
                        Journalist.Find({ where: { '@rid': TestData.TestJournalist['@rid'] }}, function(e, journalist) {
                            journalist.should.be.ok;
                            journalist.get_follower_count(function(e, count) {
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

    test('> Get the Journalists\'s Publishers ', function(done) {
        Journalist.Find({ where: { '@rid': TestData.TestJournalist['@rid'] }}, function(e, journalist) {
            try {
                journalist.should.be.ok;

                var articles = {
                    three: false,
                    four: false
                };

                var publishers = {
                    three: false,
                    four: false
                };

                Async.series([
                    // Create a test Publisher
                    function(done) {
                        Publisher.Create(TestData.TestPublisher3, function(e, publisher) {
                            publisher.should.be.ok;
                            TestData.TestPublisher3['@rid'] = publisher['@rid'];
                            publishers.three = publisher;
                            done(e);
                        });
                    },

                    // Create a second Journalist
                    function(done) {
                        Publisher.Create(TestData.TestPublisher4, function(e, publisher) {
                            publisher.should.be.ok;
                            TestData.TestPublisher4['@rid'] = publisher['@rid'];
                            publishers.four = publisher;
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
                            article.assign_publisher(publishers.three['@rid'], function(e, result) {
                                result.should.be.true;

                                article.assign_journalist(journalist['@rid'], function(e, result) {
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
                            article.assign_publisher(publishers.four['@rid'], function(e, result) {
                                result.should.be.true;

                                article.assign_journalist(journalist['@rid'], function(e, result) {
                                    result.should.be.true;
                                    done(e);
                                });
                            });
                        });
                    }
                ], function(e) {
                    // Finally, get publishers of this journalist
                    journalist.get_publishers(function(e, pubs) {
                        pubs.should.be.Array;
                        pubs.length.should.be.above(1);

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
                                publishers.three.delete(function(e, result) {
                                    done();
                                });
                            },
                            function(done) {
                                publishers.four.delete(function(e, result) {
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

    // --
    // Model Integrity
    // --



    // --
    // Suite Teardown
    // --

    test('> Delete a Journalist', function(done) {
        Journalist.Find({ where: { '@rid': TestData.TestJournalist5['@rid'] }}, function(e, journalist) {
            try {
                journalist.should.be.ok;
                journalist.delete(function(e) {
                    Journalist.Find({ where: { '@rid': TestData.TestJournalist5['@rid'] }}, function(e, djournalist) {
                        djournalist.should.not.be.ok;
                        done();
                    })
                });
            }
            catch(e) {
                done(e);
                return;
            }
        });
    });

    test('> Delete a Journalist', function(done) {
        Journalist.Find({ where: { '@rid': TestData.TestJournalist['@rid'] }}, function(e, journalist) {
            try {
                journalist.should.be.ok;
                if (journalist) {
                    journalist.delete(function(e) {
                        Journalist.Find({ where: { '@rid': TestData.TestJournalist['@rid'] }}, function(e, djournalist) {
                            djournalist.should.not.be.ok;
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

    test('> Delete  Journalist with full data', function(done) {
        Journalist.Find({ where: { '@rid': TestData.TestJournalistFull['@rid'] }}, function(e, journalist) {
            try {
                journalist.should.be.ok;
                if (journalist) {
                    journalist.delete(function(e) {
                        Journalist.Find({ where: { '@rid': TestData.TestJournalistFull['@rid'] }}, function(e, djournalist) {
                            djournalist.should.not.be.ok;
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

    test('> Delete a Journalist with background', function(done) {
        Journalist.Find({ where: { '@rid': TestData.TestJournalist3['@rid'] }}, function(e, journalist) {
            try {
                journalist.should.be.ok;
                if (journalist) {
                    journalist.delete(function(e, deleted) {
                        Journalist.Find({ where: { '@rid': TestData.TestJournalist3['@rid'] }}, function(e, djournalist) {
                            JournalistBackground.Find({ where: { '@rid': TestData.TestJournalist3.journalistBackground[0]['@rid'] }}, function(e, djbackground) {
                                djbackground.should.not.be.ok;
                                done();
                            });
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

    test('> Delete a Journalist with multiple background', function(done) {
        Journalist.Find({ where: { '@rid': TestData.TestJournalist4['@rid'] }}, function(e, journalist) {
            try {
                journalist.should.be.ok;
                if (journalist) {
                    journalist.delete(function(e, deleted) {
                        Journalist.Find({ where: { '@rid': TestData.TestJournalist4['@rid'] }}, function(e, djournalist) {
                            JournalistBackground.Find({ where: { '@rid': TestData.TestJournalist4.journalistBackground[0]['@rid'] }}, function(e, djbackground) {
                                djbackground.should.not.be.ok;
                                JournalistBackground.Find({ where: { '@rid': TestData.TestJournalist4.journalistBackground[1]['@rid'] }}, function(e, djbackground2) {
                                    djbackground2.should.not.be.ok;
                                    done();
                                });
                            });
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
                        Article.Find({ where: { '@rid': TestData.TestArticle2['@rid']}}, function(e, article) {
                            article.delete(function(e) {
                                Publisher.Find({ where: { '@rid': TestData.TestPublisher['@rid']}}, function(e, publisher) {
                                    publisher.delete(function(e){
                                        Publisher.Find({ where: { '@rid': TestData.TestPublisher2['@rid']}}, function(e, publisher) {
                                            publisher.delete(function (e) {
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
        });
    });
});
