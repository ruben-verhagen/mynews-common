// ----------------
//   Dependencies
// ----------------

var Util        = require('util');
var Config      = require('../config.json');
var Mynews       = require('../database/database');
var crypto      = require('crypto');
var should      = require('should');
var Async       = require('async');

var Article             = require('../models/article');
var ArticleFact         = require('../models/article_fact');
var ArticleStatement    = require('../models/article_statement');
var Article             = require('../models/article');
var Tag                 = require('../models/tag');
var User                = require('../models/user');
var Publisher           = require('../models/publisher');
var Journalist          = require('../models/journalist');

var test = it;

// ----------------
//   Test
// ----------------

var TestData = {
    TestArticle: {
        title:      "Sample article",
        body:       "Sample article body",
        imageUrl:   "http://www.sampleimage.com/1.jpg",
        url:        "http://www.samplearticle.com/sample-url",
        post_date:  1395833698,
        featured:   1
    },
    TestArticle2: {
        title:      "Sample article",
        body:       "Sample article body",
        imageUrl:   "http://www.sampleimage.com/1.jpg",
        url:        "http://www.samplearticle.com/sample-url",
        post_date:  1395833698,
        featured:   1
    },
    TestUser: {
        handle:     'testuser',
        password:   'testpass',
        first_name: 'Test',
        last_name:  'User',
        email:      'test_name@abc.com',
        status :    1
    },
    TestTag: [{
        name:       'test_tag_000001',
        type_group:  1
    }, {
        name:       'test_tag_sam',
        type_group:  1
    }],
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
    },
    TestPublisher2: {
        name:       'test publisher',
        url:        'http://sample.test.publisher',
        imageUrl:   'http://image.test.publisher',
        email:      'testpub2@mynews.com'
    },
    TestJournalist: {
        first_name: 'test',
        last_name : 'Journalist',
        email:      'ruben+mynews_tu@gmail.com',
        url:        'http://sample.journalist',
        imageUrl:   'http://sample.journalist.img',
        status:     1
    },
    TestJournalist2: {
        first_name: 'test',
        last_name:  'Journalist',
        email:      'ruben+mynews_tu2@gmail.com',
        url:        'http://sample.journalist',
        imageUrl:   'http://sample.journalist.img',
        status:      1
    },
    ArticleFact: {
        Immediate: {
            note: "Fact note #1",
            type: "immediate"
        },
        Contextual: {
            note: "Fact note #2",
            type: "contextual"
        }
    },
    ArticleStatement: {
        Immediate: {
            note: "Statement note #1",
            type: "immediate"
        },
        Contextual: {
            note: "Statement note #2",
            type: "contextual"
        }
    }
}
describe('Article :', function() {

    // --
    // Suite Setup
    // --

    before(function(done) {
        Mynews.connect(Config, function(e) {
            if (e) {
                Util.log(e);
                Util.log("No OrientDB, test shutting down...");
            }
            Tag.Create(TestData.TestTag[0], function(e, tag){
                TestData.TestTag[0]['@rid'] = tag['@rid'];
                User.Create(TestData.TestUser, function(e, user) {
                    TestData.TestUser['@rid'] = user['@rid'];
                    Publisher.Create(TestData.TestPublisher, function(e, publisher){
                        TestData.TestPublisher['@rid'] = publisher['@rid'];
                        Publisher.Create(TestData.TestPublisher2, function(e, publisher1){
                            TestData.TestPublisher2['@rid'] = publisher1['@rid'];
                            Journalist.Create(TestData.TestJournalist, function(e, journalist){
                                TestData.TestJournalist['@rid'] = journalist['@rid'];
                                Journalist.Create(TestData.TestJournalist2, function(e, journalist1){
                                    TestData.TestJournalist2['@rid'] = journalist1['@rid'];
                                    done();
                                });
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

    test('> Create an Article', function(done) {
        Article.Create(TestData.TestArticle, function(e, article) {
            try {
                article.should.be.ok;
                if (article) {
                    article['@rid'].should.be.ok;
                    article['slug'].should.be.ok;
                    TestData.TestArticle['@rid'] = article['@rid'];
                    TestData.TestArticle.slug = article['slug'];
                    article.title.should.equal(TestData.TestArticle.title);
                    article.body.should.equal(TestData.TestArticle.body);
                    article.imageUrl.should.equal(TestData.TestArticle.imageUrl);
                    article.url.should.equal(TestData.TestArticle.url);
                    article.creation_date.should.be.ok;
                    article.modification_date.should.be.ok;
                    article.creation_date.should.equal(article.modification_date);
                    article.creation_date.should.be.within(Math.round(Date.now() / 1000) - 2, Math.round(Date.now() / 1000));
                    article.featured.should.equal(TestData.TestArticle.featured);
                }
                done();
            }
            catch (e) {
                done(e);
                return;
            }
        });
    });

    test('> Create some ArticleFacts', function(done) {
        Async.parallel({
            immediate: function(finished) {
                TestData.ArticleFact.Immediate.article_id = TestData.TestArticle['@rid'];
                ArticleFact.Create(TestData.ArticleFact.Immediate, function(e, fact) {
                    try {
                        TestData.ArticleFact.Immediate['@rid'] = fact['@rid'];
                        fact.should.be.ok;
                        fact['@rid'].should.be.ok;
                        finished();
                    }
                    catch(e) {
                        finished(e);
                        return;
                    }
                });
            },
            contextual: function(finished) {
                TestData.ArticleFact.Contextual.article_id = TestData.TestArticle['@rid'];
                ArticleFact.Create(TestData.ArticleFact.Contextual, function(e, fact) {
                    try {
                        TestData.ArticleFact.Contextual['@rid'] = fact['@rid'];
                        fact.should.be.ok;
                        fact['@rid'].should.be.ok;
                        finished();
                    }
                    catch(e) {
                        finished(e);
                        return;
                    }
                });
            }
        }, function(e, results) {
            if (e) {
                done(e);
            } else {
                done();
            }
        });
    });

    test('> Create some ArticleStatements', function(done) {
        Async.parallel({
            immediate: function(finished) {
                TestData.ArticleStatement.Immediate.article_id = TestData.TestArticle['@rid'];
                ArticleStatement.Create(TestData.ArticleStatement.Immediate, function(e, stmt) {
                    try {
                        TestData.ArticleStatement.Immediate['@rid'] = stmt['@rid'];
                        stmt.should.be.ok;
                        stmt['@rid'].should.be.ok;
                        finished();
                    }
                    catch(e) {
                        finished(e);
                        return;
                    }
                });
            },
            contextual: function(finished) {
                TestData.ArticleStatement.Contextual.article_id = TestData.TestArticle['@rid'];
                ArticleStatement.Create(TestData.ArticleStatement.Contextual, function(e, stmt) {
                    try {
                        TestData.ArticleStatement.Contextual['@rid'] = stmt['@rid'];
                        stmt.should.be.ok;
                        stmt['@rid'].should.be.ok;
                        finished();
                    }
                    catch(e) {
                        finished(e);
                        return;
                    }
                });
            }
        }, function(e, results) {
            if (e) {
                done(e);
            } else {
                done();
            }
        });
    });

    test('> Create an Article with Same title - for checking slug uniqueness', function(done) {
        Article.Create(TestData.TestArticle2, function(e, article) {
            try {
                article.should.be.ok;
                if (article) {
                    article['@rid'].should.be.ok;
                    article['slug'].should.be.ok;
                    article['slug'].should.not.equal(TestData.TestArticle.slug);

                    article.delete(function(e) {
                        Article.Find({ where: { '@rid': article['@rid'] }}, function(e, darticle) {
                            darticle.should.not.be.ok;
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

    test('> Fetch a tag from the article which does not have any tags associated', function(done) {
        Article.Find({ where : {'@rid' : TestData.TestArticle['@rid']}}, function(e, article){
            try {
                article.should.be.ok;
                article.get_tags(function(e, tags){
                    tags.should.be.ok;
                    tags.should.be.Array;
                    done();
                });
            }
            catch (e) {
                done(e);
                return;
            }
        });
    });

    test('> Assign a tag to the article', function(done) {
        Article.Find({ where : {'@rid' : TestData.TestArticle['@rid']}}, function(e, article){
            try {
                article.should.be.ok;
                article.assign_tag(TestData.TestTag[0], 1.4, function(e, added) {
                    added.should.be.ok;
                    done();
                });
            }
            catch (e) {
                done(e);
                return;
            }
        })
    });

    test('> Fetch a tag from the article', function(done) {
        Article.Find({ where : {'@rid' : TestData.TestArticle['@rid']}}, function(e, article){
            try {
                article.should.be.ok;
                article.get_tags(function(e, tags) {
                    tags.should.be.ok;
                    tags.should.be.Array;
                    for (var i in tags) {
                        tags[i].name.should.equal(TestData.TestTag[i].name)
                    }
                    done();
                });
            }
            catch (e) {
                done(e);
                return;
            }
        });
    });

    test('> Rate an article', function(done) {
        Article.Find({ where : {'@rid' : TestData.TestArticle['@rid']}}, function(e, article) {
            try {
                article.should.be.ok;
                article.rate({
                    importance: 3,
                    independence: 5,
                    factuality: 4,
                    transparency: 5
                }, TestData.TestUser['@rid'], function(e, rated) {
                    rated.should.be.true;
                    done();
                });
            }
            catch (e) {
                done(e);
                return;
            }
        });
    });

    test('> Rate an article (overwrite previous rating)', function(done) {
        Article.Find({ where : {'@rid' : TestData.TestArticle['@rid']}}, function(e, article) {
            try {
                article.should.be.ok;
                article.rate({
                    importance: 1,
                    independence: 2,
                    factuality: 3,
                    transparency: 4
                }, TestData.TestUser['@rid'], function(e, rated) {
                    rated.should.be.true;
                    done();
                });
            }
            catch (e) {
                done(e);
                return;
            }
        });
    });

    test('> Get article user rating', function(done) {
        Article.Find({ where : {'@rid' : TestData.TestArticle['@rid']}}, function(e, article) {
            try {
                article.should.be.ok;
                article.get_user_rating(TestData.TestUser['@rid'], function(e, rating) {
                    rating.should.be.ok;
                    rating.importance.should.equal(1);
                    rating.independence.should.equal(2);
                    rating.factuality.should.equal(3);
                    rating.transparency.should.equal(4);
                    done();
                });
            }
            catch (e) {
                done(e);
                return;
            }
        });
    });

    test('> Retrieve an Article', function(done) {
        Article.Find({ where: { '@rid': TestData.TestArticle['@rid'] }}, function(e, article) {
            try {
                article.should.be.ok;
                if (article) {
                    article['@rid'].should.equal(TestData.TestArticle['@rid']);
                    article.title.should.equal(TestData.TestArticle.title);
                    article.body.should.equal(TestData.TestArticle.body);
                    article.imageUrl.should.equal(TestData.TestArticle.imageUrl);
                    article.url.should.equal(TestData.TestArticle.url);
                    article.creation_date.should.be.ok;
                    article.modification_date.should.be.ok;
                    article.creation_date.should.equal(article.modification_date);
                    article.creation_date.should.be.within(Math.round(Date.now() / 1000) - 2, Math.round(Date.now() / 1000))
                    article.featured.should.equal(TestData.TestArticle.featured);
                    article.slug.should.equal(TestData.TestArticle.slug);
                }
                done();
            }
            catch (e) {
                done(e);
                return;
            }
        });
    });

    test('> Update an Article - trying to change slug also', function(done) {
        Article.Find({ where: { '@rid': TestData.TestArticle['@rid'] }}, function(e, article) {
            try {
                article.should.be.ok;
                if (article) {
                    article.title = 'new article title';
                    article.slug = 'new-slug';
                    setTimeout(function(){
                        article.save(function(e) {
                            Article.Find({ where: { '@rid': TestData.TestArticle['@rid'] }}, function(e, darticle) {
                                darticle.should.be.ok;
                                if (darticle) {
                                    darticle.modification_date.should.be.above(darticle.creation_date);
                                    darticle.title.should.equal('new article title');
                                    darticle.slug.should.equal(TestData.TestArticle['slug']);
                                    darticle.slug.should.not.equal('new-slug');
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

    test('> Change Slug', function(done) {
        Article.Find({ where: { '@rid': TestData.TestArticle['@rid'] }}, function(e, article) {
            try {
                article.should.be.ok;
                if (article) {
                    article.change_slug("new-slug", function(e, newarticle) {
                        newarticle.slug.should.equal("new-slug");
                        Article.Find({ where: { '@rid': newarticle['@rid'] }}, function(e, darticle) {
                            darticle.should.be.ok;
                            if (darticle) {
                                darticle.slug.should.equal('new-slug');
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

    test('> Assign a publisher to the article', function(done) {
        Article.Find({ where : {'@rid' : TestData.TestArticle['@rid']}}, function(e, article){
            try {
                article.should.be.ok;
                article.assign_publisher(TestData.TestPublisher['@rid'], function(e, added){
                    added.should.be.true;
                    done();
                });
            }
            catch (e) {
                done(e);
                return;
            }
        })
    });

    test('> Get publishers from the article', function(done) {
        Article.Find({ where : {'@rid' : TestData.TestArticle['@rid']}}, function(e, article) {
            try {
                article.should.be.ok;
                article.get_publishers(function(e, publishers){
                    publishers.should.be.ok;
                    for (var i in publishers) {
                        publishers[i].name.should.equal(TestData.TestPublisher.name)
                    }
                    done();
                });
            }
            catch (e) {
                done(e);
                return;
            }
        });
    });

    test('> Assign another publisher to the article', function(done) {
        Article.Find({ where : {'@rid' : TestData.TestArticle['@rid']}}, function(e, article){
            try {
                article.should.be.ok;
                article.assign_publisher(TestData.TestPublisher2['@rid'], function(e, added){
                    added.should.be.true;
                    done();
                });
            }
            catch (e) {
                done(e);
                return;
            }
        })
    });

    test('> Get multiple publishers from the article', function(done) {
        Article.Find({ where : {'@rid' : TestData.TestArticle['@rid']}}, function(e, article){
            try {
                article.should.be.ok;
                article.get_publishers(function(e, publishers){
                    publishers.should.be.ok;
                    publishers.should.be.Array;
                    publishers.length.should.be.equal(2);
                    done();
                });
            }
            catch (e) {
                done(e);
                return;
            }
        });
    });

    test('> Assign a journalist to the article', function(done) {
        Article.Find({ where : {'@rid' : TestData.TestArticle['@rid']}}, function(e, article){
            try {
                article.should.be.ok;
                article.assign_journalist(TestData.TestJournalist['@rid'], function(e, added){
                    added.should.be.true;
                    done();
                });
            }
            catch (e) {
                done(e);
                return;
            }
        })
    });

    test('> Fetch  journalists from the article', function(done) {
        Article.Find({ where : {'@rid' : TestData.TestArticle['@rid']}}, function(e, article){
            try {
                 article.should.be.ok;
                 article.get_journalists(function(e, journalists){
                    journalists.should.be.ok;
                    for (var i in journalists) {
                        journalists[i].first_name.should.equal(TestData.TestJournalist.first_name)
                        journalists[i].last_name.should.equal(TestData.TestJournalist.last_name)
                    }
                    done();
                });
            }
            catch (e) {
                done(e);
                return;
            }
        });
    });

    test('> Assign another journalist to the article', function(done) {
        Article.Find({ where : {'@rid' : TestData.TestArticle['@rid']}}, function(e, article){
            try {
                article.should.be.ok;
                article.assign_journalist(TestData.TestJournalist2['@rid'], function(e, added){
                    added.should.be.true;
                    done();
                });
            }
            catch (e) {
                done(e);
                return;
            }
        })
    });

    test('> Find multiple journalists from the article', function(done) {
        Article.Find({ where : {'@rid' : TestData.TestArticle['@rid']}}, function(e, article){
            try {
                article.should.be.ok;
                article.get_journalists(function(e, journalists){
                journalists.should.be.ok;
                journalists.should.be.Array;
                journalists.length.should.be.equal(2)
                done();
                });
            }
            catch (e) {
                done(e);
                return;
            }
        });
    });

    // --
    // Integrity Tests
    // --



    // --
    // Suite Teardown
    // --

    test('> Delete an Article', function(done) {
        Article.Find({ where: { '@rid': TestData.TestArticle['@rid'] }}, function(e, article) {
            try {
                article.should.be.ok;
                if (article) {
                    article.delete(function(e) {
                        Article.Find({ where: { '@rid': TestData.TestArticle['@rid'] }}, function(e, darticle) {
                            darticle.should.not.be.ok;
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

    test('> Delete ArticleFacts', function(done) {
        Async.parallel({
            immediate: function(finished) {
                ArticleFact.Find({ where: {
                    '@rid': TestData.ArticleFact.Immediate['@rid'],
                    article_id: TestData.ArticleFact.Immediate.article_id
                }}, function(e, fact) {
                    try {
                        fact.should.be.ok;
                        if (fact) {
                            fact.delete(function(e) {
                                ArticleFact.Find({ where: { '@rid': TestData.ArticleFact.Immediate['@rid'] }}, function(e, dfact) {
                                    dfact.should.not.be.ok;
                                    finished();
                                });
                            });
                        } else {
                            finished();
                        }
                    }
                    catch(e) {
                        finished(e);
                        return;
                    }
                });
            },
            contextual: function(finished) {
                ArticleFact.Find({ where: {
                    '@rid': TestData.ArticleFact.Contextual['@rid'],
                    article_id: TestData.ArticleFact.Contextual.article_id
                }}, function(e, fact) {
                    try {
                        fact.should.be.ok;
                        if (fact) {
                            fact.delete(function(e) {
                                ArticleFact.Find({ where: { '@rid': TestData.ArticleFact.Contextual['@rid'] }}, function(e, dfact) {
                                    dfact.should.not.be.ok;
                                    finished();
                                });
                            });
                        } else {
                            finished();
                        }
                    }
                    catch(e) {
                        finished(e);
                        return;
                    }
                });
            }
        }, function(e, results) {
            if (e) {
                done(e);
            } else {
                done();
            }
        })
    });

    test('> Delete ArticleStatements', function(done) {
        Async.parallel({
            immediate: function(finished) {
                ArticleStatement.Find({ where: {
                    '@rid': TestData.ArticleStatement.Immediate['@rid'],
                    article_id: TestData.ArticleStatement.Immediate.article_id
                }}, function(e, stmt) {
                    try {
                        stmt.should.be.ok;
                        if (stmt) {
                            stmt.delete(function(e) {
                                ArticleStatement.Find({ where: { '@rid': TestData.ArticleStatement.Immediate['@rid'] }}, function(e, dstmt) {
                                    dstmt.should.not.be.ok;
                                    finished();
                                });
                            });
                        } else {
                            finished();
                        }
                    }
                    catch(e) {
                        finished(e);
                        return;
                    }
                });
            },
            contextual: function(finished) {
                ArticleStatement.Find({ where: {
                    '@rid': TestData.ArticleStatement.Contextual['@rid'],
                    article_id: TestData.ArticleStatement.Contextual.article_id
                }}, function(e, stmt) {
                    try {
                        stmt.should.be.ok;
                        if (stmt) {
                            stmt.delete(function(e) {
                                ArticleStatement.Find({ where: { '@rid': TestData.ArticleStatement.Contextual['@rid'] }}, function(e, dstmt) {
                                    dstmt.should.not.be.ok;
                                    finished();
                                });
                            });
                        } else {
                            finished();
                        }
                    }
                    catch(e) {
                        finished(e);
                        return;
                    }
                });
            }
        }, function(e, results) {
            if (e) {
                done(e);
            } else {
                done();
            }
        })
    });

    after(function(done) {
        User.Find({ where: { '@rid': TestData.TestUser['@rid']}}, function(e, user) {
            user.delete(function(e) {
                Tag.Find({ where: { '@rid': TestData.TestTag[0]['@rid']}}, function(e, tag) {
                    tag.delete(function(e) {
                        Publisher.Find({ where: { '@rid': TestData.TestPublisher['@rid']}}, function(e, publisher) {
                            publisher.delete(function(e) {
                                Publisher.Find({ where: { '@rid': TestData.TestPublisher2['@rid']}}, function(e, publisher1) {
                                    publisher1.delete(function(e) {
                                        Journalist.Find({ where: { '@rid': TestData.TestJournalist['@rid']}}, function(e, journalist) {
                                            journalist.delete(function(e) {
                                                Journalist.Find({ where: { '@rid': TestData.TestJournalist2['@rid']}}, function(e, journalist1) {
                                                    journalist1.delete(function(e) {
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
    });

});