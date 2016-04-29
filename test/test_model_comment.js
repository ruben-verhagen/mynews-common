// ----------------
//   Dependencies
// ----------------

var Util        = require('util');
var Config      = require('../config.json');
var Mynews       = require('../database/database');
var crypto      = require('crypto');
var should      = require('should');

var Comment     = require('../models/comment');
var Publisher   = require('../models/publisher');
var User        = require('../models/user');
var Article     = require('../models/article');

var test = it;

// ----------------
//   Test Data
// ----------------

var TestData = {
    TestComment: {
        body: "Bla Blla Comment",
        type: 1
    },
    TestComment2: {
        body: "waka waka comment: child of bla blla",
        type: 1
    },
    TestComment3: {
        body: "la la la comment : child for bla blla",
        type: 1
    },
    TestComment4: {
        body: "tadaa~~~:  child of la la la",
        type: 1
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
            },{
                organization : 'Indian Institute of Technology, Delhi',
                title : 'Computer Science',
                year_start : '2003',
                year_end : '2007',
                description: 'B. Tech in Computer Science',
            }]
        }
    },
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
    TestArticle: {
        title:      "Sample article",
        body:       "Sample article body",
        imageUrl:   "http://www.sampleimage.com/1.jpg",
        url:        "http://www.samplearticle.com/sample-url",
        post_date:  1395833698,
        featured:   1
    }
}

describe('Comment :', function() {

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
                TestData.TestComment.user_id = TestData.TestUser['@rid'];
                TestData.TestComment2.user_id = TestData.TestUser['@rid'];
                TestData.TestComment3.user_id = TestData.TestUser['@rid'];
                TestData.TestComment4.user_id = TestData.TestUser['@rid'];
                Publisher.Create(TestData.TestPublisher, function(e, publisher) {
                    TestData.TestPublisher['@rid'] = publisher['@rid'];
                    TestData.TestComment.owner_id = TestData.TestPublisher['@rid'];
                    TestData.TestComment2.owner_id = TestData.TestPublisher['@rid'];
                    TestData.TestComment3.owner_id = TestData.TestPublisher['@rid'];
                    TestData.TestComment4.owner_id = TestData.TestPublisher['@rid'];
                    done();
                })
            })
        });
    });

    // --
    // Model CRUD
    // --
    
    test('> Create an Comment', function(done) {
        Comment.Create(TestData.TestComment, function(e, comment) {
            try {
                comment.should.be.ok;
                if (comment) {
                    comment['@rid'].should.be.ok;
                    TestData.TestComment['@rid'] = comment['@rid'];
                    comment.type.should.equal(TestData.TestComment.type);
                    comment.body.should.equal(TestData.TestComment.body);
                    comment.creation_date.should.be.ok;
                    comment.modification_date.should.be.ok;
                    comment.creation_date.should.equal(comment.modification_date);
                    comment.creation_date.should.be.within(Math.round(Date.now() / 1000) - 2, Math.round(Date.now() / 1000));
                    
                    TestData.TestComment2.parent_id = TestData.TestComment['@rid'];
                    TestData.TestComment3.parent_id = TestData.TestComment['@rid'];
                }
                done();
            }
            catch (e) {
                done(e);
                return;
            }
        });
    });
    
    test('> Retrieve an Comment', function(done) {
        Comment.Find({ where: { '@rid': TestData.TestComment['@rid'] }}, function(e, comment) {
            try {
                comment.should.be.ok;
                if (comment) {
                    comment['@rid'].should.equal(TestData.TestComment['@rid']);
                    comment.type.should.equal(TestData.TestComment.type);
                    comment.body.should.equal(TestData.TestComment.body);
                    comment.creation_date.should.be.ok;
                    comment.modification_date.should.be.ok;
                    comment.creation_date.should.equal(comment.modification_date);
                    comment.creation_date.should.be.within(Math.round(Date.now() / 1000) - 2, Math.round(Date.now() / 1000))
                }
                done();
            }
            catch (e) {
                done(e);
                return;
            }
        });
    });

    // TODO: Finish testing comments from Article, Publisher, Journalists

    /*test('> Retrieve Comments via Article', function(done) {
        Article.Create(TestData.TestArticle, function(e, article) {
            try {
                article.should.be.ok;


            }
            catch(e) {
                done(e);
            }
        });
    });*/

    test('> Update an Comment - change body', function(done) {
        Comment.Find({ where: { '@rid': TestData.TestComment['@rid'] }}, function(e, comment) {
            try {
                comment.should.be.ok;
                if (comment) {
                    comment.body = 'changeed type';                    
                    comment.save(function(e) {
                        Comment.Find({ where: { '@rid': TestData.TestComment['@rid'] }}, function(e, dcomment) {
                        	dcomment.should.be.ok;
                            if (dcomment) {
                            	dcomment.type.should.equal(1);    
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
   
    // Child Comment
    test('> Create an TestComment2', function(done) {
        Comment.Create(TestData.TestComment2, function(e, comment) {
            try {
                comment.should.be.ok;
                if (comment) {
                    comment['@rid'].should.be.ok;
                    TestData.TestComment2['@rid'] = comment['@rid'];
                    comment.type.should.equal(TestData.TestComment2.type);
                    comment.body.should.equal(TestData.TestComment2.body);
                    comment.creation_date.should.be.ok;
                    comment.modification_date.should.be.ok;
                    comment.creation_date.should.equal(comment.modification_date);
                    comment.creation_date.should.be.within(Math.round(Date.now() / 1000) - 2, Math.round(Date.now() / 1000));
                }
                done();
            }
            catch (e) {
                done(e);
                return;
            }
        });
    });
    
    test('> Create an TestComment3', function(done) {
        Comment.Create(TestData.TestComment3, function(e, comment) {
            try {
                comment.should.be.ok;
                if (comment) {
                    comment['@rid'].should.be.ok;
                    TestData.TestComment3['@rid'] = comment['@rid'];
                    comment.type.should.equal(TestData.TestComment3.type);
                    comment.body.should.equal(TestData.TestComment3.body);
                    comment.creation_date.should.be.ok;
                    comment.modification_date.should.be.ok;
                    comment.creation_date.should.equal(comment.modification_date);
                    comment.creation_date.should.be.within(Math.round(Date.now() / 1000) - 2, Math.round(Date.now() / 1000));
                    
                    TestData.TestComment4.parent_id = TestData.TestComment3['@rid'];
                }
                done();
            }
            catch (e) {
                done(e);
                return;
            }
        });
    });
    
    test('> Create an TestComment4', function(done) {
        Comment.Create(TestData.TestComment4, function(e, comment) {
            try {
                comment.should.be.ok;
                if (comment) {
                    comment['@rid'].should.be.ok;
                    TestData.TestComment4['@rid'] = comment['@rid'];
                    comment.type.should.equal(TestData.TestComment4.type);
                    comment.body.should.equal(TestData.TestComment4.body);
                    comment.creation_date.should.be.ok;
                    comment.modification_date.should.be.ok;
                    comment.creation_date.should.equal(comment.modification_date);
                    comment.creation_date.should.be.within(Math.round(Date.now() / 1000) - 2, Math.round(Date.now() / 1000));
                }
                done();
            }
            catch (e) {
                done(e);
                return;
            }
        });
    });
    
    test('> Retrieve full Comment', function(done) {
        Comment.Find({ where: { '@rid': TestData.TestComment['@rid'] }, filter_all: true }, function(e, comment) {
            try {
                comment.should.be.ok;
                if (comment) {
                    comment['@rid'].should.equal(TestData.TestComment['@rid']);
                    comment.owner_id.should.equal(TestData.TestPublisher['@rid']);
                }
                done();
            }
            catch (e) {
                done(e);
                return;
            }
        })
    });

    test('> Get parent for testcomment2', function(done) {
        Comment.Find({ where: { '@rid': TestData.TestComment2['@rid'] }}, function(e, comment) {
            try {
                comment.should.be.ok;
                if (comment) {
                    comment.get_parent_comment(function (e, parent) {
                        parent.should.be.ok;
                        parent['@rid'].should.equal(TestData.TestComment['@rid']);
                        done();
                    });
                }
            }
            catch(e) {
                done(e);
                return;
            }
        });
    });

    test('> Get parent for testcomment3', function(done) {
        Comment.Find({ where: { '@rid': TestData.TestComment3['@rid'] }}, function(e, comment) {
            try {
                comment.should.be.ok;
                if (comment) {
                    comment.get_parent_comment(function (e, parent) {
                        parent.should.be.ok;
                        parent['@rid'].should.equal(TestData.TestComment['@rid']);
                        done();
                    });
                }
            }
            catch(e) {
                done(e);
                return;
            }
        });
    });

    test('> Get parent for testcomment4', function(done) {
        Comment.Find({ where: { '@rid': TestData.TestComment4['@rid'] }}, function(e, comment) {
            try {
                comment.should.be.ok;
                if (comment) {
                    comment.get_parent_comment(function (e, parent) {
                        parent.should.be.ok;
                        parent['@rid'].should.equal(TestData.TestComment3['@rid']);
                        done();
                    });
                }
            }
            catch(e) {
                done(e);
                return;
            }
        });
    });

    test('> Get MetaData for testcomment4', function(done) {
        Comment.Find({ where: { '@rid': TestData.TestComment4['@rid'] }}, function(e, comment) {
            try {
                comment.should.be.ok;
                if (comment) {
                    comment.fetch_meta(function (e, fetched) {
                        if (e) {
                            done(e);
                        } else {
                            fetched.should.be.ok;
                            //fetched.owner.should.be.ok;
                            fetched.owner['@rid'] = TestData.TestPublisher['@rid'];
                            done();
                        }
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

    test('> Vote Up a comment', function(done) {
        Comment.Find({ where: { '@rid': TestData.TestComment['@rid']}}, function(e, comment) {
            comment.vote(1, TestData.TestUser['@rid'], function(e, vote) {
                try {
                    vote.should.be.ok;

                    comment.get_votes(function(e, votes) {
                        votes.should.be.ok;
                        votes.effective.should.equal(1);
                        votes.total.should.equal(1);
                        votes.downVotes.should.equal(0);
                        votes.upVotes.should.equal(1);

                        TestData.TestComment.votes = votes;

                        done();
                    });
                } catch(e){
                    done(e);
                }
            });
        });
    });

    test('> Integrity : Vote Up again should not update the score', function(done) {
        Comment.Find({ where: { '@rid': TestData.TestComment['@rid']}}, function(e, comment) {
            comment.vote(1, TestData.TestUser['@rid'], function(e, vote) {
                try {
                    vote.should.be.ok;

                    comment.get_votes(function(e, votes) {
                        votes.should.be.ok;
                        votes.effective.should.equal(1);
                        votes.total.should.equal(1);
                        votes.downVotes.should.equal(0);
                        votes.upVotes.should.equal(1);

                        TestData.TestComment.votes.effective.should.equal( votes.effective );
                        TestData.TestComment.votes.total.should.equal( votes.total );
                        TestData.TestComment.votes.downVotes.should.equal( votes.downVotes );
                        TestData.TestComment.votes.upVotes.should.equal( votes.upVotes );

                        done();
                    });
                }
                catch(error) {
                    done(error);
                }

            })
        })
    });
    
    test('> Delete a Comment', function(done) {
        Comment.Find({ where: { '@rid': TestData.TestComment['@rid'] }}, function(e, comment) {
            try {
                comment.should.be.ok;

                comment.delete(function(e) {
                    should(e).not.be.ok;

                    Comment.Find({ where: { '@rid': TestData.TestComment['@rid'] }}, function(e, dcomment) {
                        dcomment.body.should.equal( 'deleted' );
                        done();
                    });
                });
            }
            catch(e) {
                done(e);
            }
        });
    });

    // --
    // Suite Teardown
    // --
    
    after(function(done) {
        User.Find({ where: { '@rid': TestData.TestUser['@rid']}}, function(e, user) {
            user.delete(function(e) {
                Publisher.Find({ where: { '@rid': TestData.TestPublisher['@rid']}}, function(e, publisher) {
                    publisher.delete(function(e) {
                        done();
                    })
                })
            });
        });
    });

});

