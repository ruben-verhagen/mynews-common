// ----------------
//   Dependencies
// ----------------

var Util        = require('util');
var Config      = require('../config.json');
var Mynews       = require('../database/database');
var crypto      = require('crypto');
var should      = require('should');

var SourceFeed        = require('../models/source_feed');
var Publisher         = require('../models/publisher');

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
    },TestSourceFeed: {
        title: "BBC News",
        url: "http://www.bbc.co.uk/blogs/magazinemonitor/rss.xml",
        endpoint: "http://feeds.mynews.com:3069/push/http%3A%2F%2Fwww.bbc.co.uk%2Fblogs%2Fmagazinemonitor%2Frss.xml"
    }
}

describe('SourceFeed :', function() {

    // --
    // Suite Setup
    // --

    before(function(done) {
        Mynews.connect(Config, function(e) {
            if (e) {
                Util.log(e);
                Util.log("No OrientDB, test shutting down...");
            }

            Publisher.Create(TestData.TestPublisher, function(e, publisher) {

                if (e){
                    Util.log(e);
                    return done(e);
                }

                publisher.should.be.ok;
                publisher['@rid'].should.be.ok;
                TestData.TestPublisher['@rid'] = publisher['@rid'];

                done();
            });

        });
    });

    // --
    // Model CRUD
    // --

    test('> Create a Source Feed', function(done) {
        SourceFeed.Create(TestData.TestSourceFeed, function(e, sourcefeed) {
            try {
                sourcefeed.should.be.ok;
                if (sourcefeed) {
                    sourcefeed['@rid'].should.be.ok;
                    sourcefeed['slug'].should.be.ok;
                    TestData.TestSourceFeed['@rid'] = sourcefeed['@rid'];
                    TestData.TestSourceFeed.slug = sourcefeed['slug'];
                    sourcefeed.title.should.equal(TestData.TestSourceFeed.title);
                    sourcefeed.url.should.equal(TestData.TestSourceFeed.url);
                    sourcefeed.endpoint.should.equal(TestData.TestSourceFeed.endpoint);
                }
                done();
            }
            catch (e) {
                done(e);
                return;
            }
        });
    });


    test('> Set publisher for Source Feed', function(done) {
        SourceFeed.Find({ where: { '@rid': TestData.TestSourceFeed['@rid'] }}, function(e, sourcefeed) {
            try {
                sourcefeed.should.be.ok;
                if (sourcefeed) {
                    sourcefeed.set_publisher(TestData.TestPublisher, function(e, setresult) {
                        setresult.should.be.ok;
                        setresult.should.equal(true);

                        sourcefeed.get_publisher(function(e, setpublisher){

                            if (e) return done(e);

                            setpublisher.should.be.ok;
                            setpublisher['@rid'].should.equal(TestData.TestPublisher['@rid']);
                            setpublisher.name.should.equal(TestData.TestPublisher.name);

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


    test('> Delete a Source Feed', function(done) {
        SourceFeed.Find({ where: { '@rid': TestData.TestSourceFeed['@rid'] }}, function(e, sourcefeed) {
            try {
                sourcefeed.should.be.ok;
                if (sourcefeed) {
                    sourcefeed.delete(function(e) {
                        SourceFeed.Find({ where: { '@rid': TestData.TestSourceFeed['@rid'] }}, function(e, dsourcefeed) {
                            dsourcefeed.should.not.be.ok;
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

        Publisher.Find({ where: { '@rid': TestData.TestPublisher['@rid'] }}, function(e, publisher) {
            try {
                publisher.should.be.ok;
                if (publisher) {
                    publisher.delete(function(e) {
                        done(e);
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

});