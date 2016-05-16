// ----------------
//   Dependencies
// ----------------

var Util        = require('util');
var Config      = require('../config.json');
var Mynews       = require('../database/database');
var crypto      = require('crypto');
var should      = require('should');

var Tag        = require('../models/tag');

var test = it;

// ----------------
//   Test
// ----------------

var TestData = {
    TestTag: {
        name: 'social networking site',
        type_group: 'entities',
        type: 'IndustryTerm'
    },
    TestTag2: {
        name: 'social networking site',
        type_group: 'entities',
        type: 'SocialTerm'
    },

    TestTag3: {
        name: '',
        type_group: 'entities',
        type: 'SocialTerm'
    },

    TestTag4: {
        name: '\'escape charaters " " \' "',
        type_group: 'entities',
        type: 'EscapeCharacters'
    }
}

describe('Tags :', function() {

    // --
    // Suite Setup
    // --

    before(function(done) {
        Mynews.connect(Config, function(e) {
            if (e) {
                Util.log(e);
                Util.log("No OrientDB, test shutting down...");
            }

            done(e);

        });
    });

    // --
    // Model CRUD
    // --

    test('> Create a Tag', function(done) {
        Tag.FindOrCreate(TestData.TestTag, function(e, tag) {
            try {
                tag.should.be.ok;
                if (tag) {
                    tag['@rid'].should.be.ok;
                    tag['slug'].should.be.ok;
                    TestData.TestTag['@rid'] = tag['@rid'];
                    TestData.TestTag.slug = tag['slug'];
                    tag.name.should.equal(TestData.TestTag.name);
                    tag.type_group.should.equal(TestData.TestTag.type_group);
                    tag.type.should.equal(TestData.TestTag.type);
                }
                done();
            }
            catch (e) {
                done(e);
                return;
            }
        });
    });

    test('> Create a Tag with same name but different type & type_group - check uniqueness of slug', function(done) {
        Tag.Create(TestData.TestTag2, function(e, tag) {
            try {
                tag.should.be.ok;

                tag['@rid'].should.be.ok;
                tag['slug'].should.be.ok;
                TestData.TestTag2['@rid'] = tag['@rid'];
                TestData.TestTag2.slug = tag['slug'];

                // slug should be different
                TestData.TestTag2.slug.should.not.equal(TestData.TestTag.slug);

                tag.name.should.equal(TestData.TestTag2.name);
                tag.type_group.should.equal(TestData.TestTag2.type_group);
                tag.type.should.equal(TestData.TestTag2.type);

                done();
            }
            catch (e) {
                done(e);
                return;
            }
        });
    });

    test('> Delete a Tag - TestTag2', function(done) {
        Tag.Find({ where: { '@rid': TestData.TestTag2['@rid'] }}, function(e, tag) {
            try {
                tag.should.be.ok;
                if (tag) {
                    tag.delete(function(e) {
                        Tag.Find({ where: { '@rid': TestData.TestTag2['@rid'] }}, function(e, dtag) {
                            dtag.should.not.be.ok;
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

    test('> Find or create tag with same tag name, type, and type_group', function(done) {
        Tag.FindOrCreate(TestData.TestTag, function(e, tag) {
            try {
                tag.should.be.ok;
                if (tag) {
                    tag['@rid'].should.be.ok;
                    tag['@rid'].should.equal(TestData.TestTag['@rid']);
                    tag['slug'].should.be.ok;
                    tag.name.should.equal(TestData.TestTag.name);
                    tag.type_group.should.equal(TestData.TestTag.type_group);
                    tag.type.should.equal(TestData.TestTag.type);
                }
                done();
            }
            catch (e) {
                done(e);
                return;
            }
        });
    });

    test('> Integrity - Create a tag with empty name', function(done) {
        Tag.Create(TestData.TestTag3, function(e, tag) {
            try {
                e.should.be.ok;
                should.not.exist(tag);
                done();
            }
            catch (e) {
                done(e);
                return;
            }
        });
    });

    test('> Integrity - Create a tag with name of more than maximum characters', function(done) {

        for (var i = 0; i < 256; i++) TestData.TestTag3.name = TestData.TestTag3.name + 't';

        try{
            Tag.Create(TestData.TestTag3, function(e, tag) {
                try {
                    e.should.be.ok;
                    should.not.exist(tag);
                    done();
                }
                catch (e) {
                    done(e);
                    return;
                }
            });
        }
        catch (ex) {
            ex.should.be.ok;
            done();
            return;
        }
    });

    test('> Integrity - Create a tag with escape characters included.', function(done) {
        Tag.Create(TestData.TestTag4, function(e, tag) {
            try {
                tag.should.be.ok;
                if (tag) {
                    tag['@rid'].should.be.ok;
                    tag['slug'].should.be.ok;
                    TestData.TestTag4['@rid'] = tag['@rid'];
                    TestData.TestTag4.slug = tag['slug'];
                    tag.name.should.equal(TestData.TestTag4.name);
                    tag.type_group.should.equal(TestData.TestTag4.type_group);
                    tag.type.should.equal(TestData.TestTag4.type);
                }
                done();
            }
            catch (e) {
                done(e);
                return;
            }
        });
    });

    test('> Integrity - Find a tag with escape characters included.', function(done) {
        Tag.FindOrCreate(TestData.TestTag4, function(e, tag) {
            try {
                tag.should.be.ok;
                if (tag) {
                    tag['@rid'].should.be.ok;
                    tag['slug'].should.be.ok;
                    tag['@rid'].should.equal(TestData.TestTag4['@rid']);
                    tag['slug'].should.equal(TestData.TestTag4.slug);
                    tag.name.should.equal(TestData.TestTag4.name);
                    tag.type_group.should.equal(TestData.TestTag4.type_group);
                    tag.type.should.equal(TestData.TestTag4.type);
                }
                done();
            }
            catch (e) {
                done(e);
                return;
            }
        });
    });

    test('> Integrity - Delete a tag with escape characters included.', function(done) {
        Tag.Find({ where: { '@rid': TestData.TestTag4['@rid'] }}, function(e, tag) {
            try {
                tag.should.be.ok;
                if (tag) {
                    tag.delete(function(e) {
                        Tag.Find({ where: { '@rid': TestData.TestTag4['@rid'] }}, function(e, dtag) {
                            dtag.should.not.be.ok;
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

    test('> Update a Tag - trying to change slug also', function(done) {
        Tag.Find({ where: { '@rid': TestData.TestTag['@rid'] }}, function(e, tag) {
            try {
                tag.should.be.ok;
                if (tag) {
                    tag.name = 'new tag name';
                    tag.slug = 'new-slug';

                    // Give some delay to check whether modification_date has changed or not

                    setTimeout(function() {
                        tag.save(function (e) {
                            Tag.Find({ where: { '@rid': TestData.TestTag['@rid'] }}, function (e, dtag) {
                                try {
                                    dtag.should.be.ok;
                                    if (dtag) {
                                        dtag.modification_date.should.be.above(dtag.creation_date);
                                        dtag.name.should.equal('new tag name');
                                        dtag.slug.should.equal(TestData.TestTag['slug']);
                                        dtag.slug.should.not.equal('new-slug');
                                    }
                                    done();
                                }
                                catch(e) {
                                    done(e);
                                }
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

    test('> Change Slug of Tag', function(done) {
        Tag.Find({ where: { '@rid': TestData.TestTag['@rid'] }}, function(e, tag) {
            try {
                tag.should.be.ok;
                if (tag) {
                    tag.change_slug("new-slug", function(e, newtag) {
                        newtag.slug.should.equal("new-slug");
                        Tag.Find({ where: { '@rid': newtag['@rid'] }}, function(e, dtag) {
                            dtag.should.be.ok;
                            if (dtag) {
                                dtag.slug.should.equal('new-slug');
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

    // --
    // Suite Teardown
    // --

    test('> Delete a Tag - TestTag', function(done) {
        Tag.Find({ where: { '@rid': TestData.TestTag['@rid'] }}, function(e, tag) {
            try {
                tag.should.be.ok;
                if (tag) {
                    tag.delete(function(e) {
                        Tag.Find({ where: { '@rid': TestData.TestTag['@rid'] }}, function(e, dtag) {
                            dtag.should.not.be.ok;
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

        done();

    });

});