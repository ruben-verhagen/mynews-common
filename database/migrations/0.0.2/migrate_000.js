'use strict';

// ----------------
//   Dependencies
// ----------------

var Util        = require('util');
var Async       = require('async');
var crypto      = require('crypto');

var Mynews       = require('../../database.js');
var Config      = require('../../../config.json');

// ----------------
//   Migration
// ----------------

var commands = [
    'TRUNCATE CLASS OUser',
    'TRUNCATE CLASS ORole',

    // User
    'DROP CLASS User',
    'CREATE CLASS User EXTENDS V',
    'CREATE PROPERTY User.password STRING',
    'CREATE PROPERTY User.handle STRING',
    'CREATE PROPERTY User.first_name String',
    'CREATE PROPERTY User.last_name String',
    'CREATE PROPERTY User.email STRING',
    'CREATE PROPERTY User.last_login LONG',
    'CREATE PROPERTY User.creation_date LONG',
    'CREATE PROPERTY User.modification_date LONG',
    'CREATE PROPERTY User.status SHORT',
    'CREATE INDEX User.email ON User (email) UNIQUE',
    'CREATE INDEX User.handle ON User (handle) UNIQUE',
    'INSERT INTO User SET handle = "admin", password = "' + crypto.createHash('sha1').update('administrator').digest('hex') + '", first_name="Super", last_name="Admin", email="ruben+mynews_sa@gmail.com", status = 1, imageUrl = "http://placehold.it/320x150"',

    //UserProfile Class
    'DROP CLASS UserProfile',
    'CREATE CLASS UserProfile EXTENDS V',
    'CREATE PROPERTY UserProfile.street1 STRING',
    'CREATE PROPERTY UserProfile.street2 STRING',
    'CREATE PROPERTY UserProfile.city STRING',
    'CREATE PROPERTY UserProfile.state STRING',
    'CREATE PROPERTY UserProfile.country STRING',
    'CREATE PROPERTY UserProfile.zip STRING',
    'CREATE PROPERTY UserProfile.website_url STRING',
    'CREATE PROPERTY UserProfile.phone_home STRING',
    'CREATE PROPERTY UserProfile.phone_mobile STRING',
    'CREATE PROPERTY UserProfile.about_me String',
    'CREATE PROPERTY UserProfile.modification_date LONG',
    'CREATE PROPERTY UserProfile.creation_date LONG',

    //UserHasProfile
    'DROP CLASS UserHasProfile',
    'CREATE CLASS UserHasProfile EXTENDS E',

    //UserBackground
    'DROP CLASS UserBackground',
    'CREATE CLASS UserBackground EXTENDS V',
    'CREATE PROPERTY UserBackground.organization STRING',
    'CREATE PROPERTY UserBackground.title STRING',
    'CREATE PROPERTY UserBackground.year_start STRING',
    'CREATE PROPERTY UserBackground.year_end STRING',
    'CREATE PROPERTY UserBackground.description STRING',
    'CREATE PROPERTY UserBackground.creation_date LONG',
    'CREATE PROPERTY UserBackground.modification_date LONG',

    //UserLinkBackground
    'DROP CLASS UserLinkBackground',
    'CREATE CLASS UserLinkBackground EXTENDS E',

    // Admin Profile
    'INSERT INTO UserProfile SET street1="", street2="", city="Vancouver", state="British Columbia", country="Canada", zip="", website_url="http://mynews.com", phone_home="", phone_mobile="", about_me="I\'m  the mynews.com site administrator.", modification_date="1407504288", creation_date="1407504288"',
    'CREATE EDGE UserHasProfile FROM (SELECT FROM User WHERE handle="admin") TO (SELECT FROM UserProfile WHERE creation_date="1407504288")',

    // Admin Background
    'INSERT INTO UserBackground SET title="Product Manager", description="Product management for Mynews.com", organization="Mynews.com", year_start="2013", year_end="2014", creation_date="1407504288", modification_date="1407504288"',
    'CREATE EDGE UserLinkBackground FROM (SELECT FROM UserBackground WHERE title="Product Manager") TO (SELECT FROM UserProfile WHERE creation_date="1407504288")',

    //UserFollow
    'DROP CLASS UserFollow',
    'CREATE CLASS UserFollow EXTENDS E',

    // Role
    'DROP CLASS Role',
    'CREATE CLASS Role EXTENDS V',
    'CREATE PROPERTY Role.name STRING',
    'CREATE INDEX Role.name ON Role (name) UNIQUE',
    'INSERT INTO Role SET name = "Administrator"',
    'INSERT INTO Role SET name = "Senior Editor"',
    'INSERT INTO Role SET name = "Editor"',
    'INSERT INTO Role SET name = "Moderator"',
    'INSERT INTO Role SET name = "Registered User"',
    'INSERT INTO Role SET name = "Anonymous User"',
    'INSERT INTO Role SET name = "API User"',

    // Permission
    'DROP CLASS Permission',
    'CREATE CLASS Permission EXTENDS V',
    'CREATE PROPERTY Permission.name STRING',
    'CREATE INDEX Permission.name ON Permission (name) UNIQUE',
    // Article Permission Types
    'INSERT INTO Permission SET name = "article.admin"',
    'INSERT INTO Permission SET name = "article.edit"',
    'INSERT INTO Permission SET name = "article.delete"',
    'INSERT INTO Permission SET name = "article.api_get"',
    'INSERT INTO Permission SET name = "article.rate"',
    // Journalist Permission Types
    'INSERT INTO Permission SET name = "journalist.admin"',
    'INSERT INTO Permission SET name = "journalist.edit"',
    'INSERT INTO Permission SET name = "journalist.delete"',
    'INSERT INTO Permission SET name = "journalist.api_get"',
    // Publisher Permission Types
    'INSERT INTO Permission SET name = "publisher.admin"',
    'INSERT INTO Permission SET name = "publisher.edit"',
    'INSERT INTO Permission SET name = "publisher.delete"',
    'INSERT INTO Permission SET name = "publisher.api_get"',
    // Comment Permission Types
    'INSERT INTO Permission SET name = "comment.admin"',
    'INSERT INTO Permission SET name = "comment.edit"',
    'INSERT INTO Permission SET name = "comment.delete"',
    'INSERT INTO Permission SET name = "comment.api_get"',
    'INSERT INTO Permission SET name = "comment.vote"',
    // User Permission Types
    'INSERT INTO Permission SET name = "user.admin"',
    'INSERT INTO Permission SET name = "user.edit"',
    'INSERT INTO Permission SET name = "user.delete"',
    'INSERT INTO Permission SET name = "user.api_get"',
    'INSERT INTO Permission SET name = "user.api_self"',
    // Feeds System Permission Types
    'INSERT INTO Permission SET name = "feeds.admin"',
    // Tags Permission Types
    'INSERT INTO Permission SET name = "tag.admin"',
    'INSERT INTO Permission SET name = "tag.edit"',
    'INSERT INTO Permission SET name = "tag.delete"',
    'INSERT INTO Permission SET name = "tag.api_get"',

    // UserHasRole
    'DROP CLASS UserHasRole',
    'CREATE CLASS UserHasRole EXTENDS E',
    'CREATE EDGE UserHasRole FROM (SELECT FROM User WHERE handle = "admin") TO (SELECT FROM Role WHERE name = "Administrator")',
    'CREATE EDGE UserHasRole FROM (SELECT FROM User WHERE handle = "admin") TO (SELECT FROM Role WHERE name = "Senior Editor")',
    'CREATE EDGE UserHasRole FROM (SELECT FROM User WHERE handle = "admin") TO (SELECT FROM Role WHERE name = "Editor")',
    'CREATE EDGE UserHasRole FROM (SELECT FROM User WHERE handle = "admin") TO (SELECT FROM Role WHERE name = "Moderator")',
    'CREATE EDGE UserHasRole FROM (SELECT FROM User WHERE handle = "admin") TO (SELECT FROM Role WHERE name = "Registered User")',
    'CREATE EDGE UserHasRole FROM (SELECT FROM User WHERE handle = "admin") TO (SELECT FROM Role WHERE name = "API User")',

    // RoleHasPermission
    'DROP CLASS RoleHasPermission',
    'CREATE CLASS RoleHasPermission EXTENDS E',

    // --
    // Permissions by Role
    // --

    // Anonymous User - Not logged in web user
    'CREATE EDGE RoleHasPermission FROM (SELECT FROM Role WHERE name = "Anonymous User") TO (SELECT FROM Permission WHERE name = "article.api_get")',
    'CREATE EDGE RoleHasPermission FROM (SELECT FROM Role WHERE name = "Anonymous User") TO (SELECT FROM Permission WHERE name = "tag.api_get")',
    'CREATE EDGE RoleHasPermission FROM (SELECT FROM Role WHERE name = "Anonymous User") TO (SELECT FROM Permission WHERE name = "publisher.api_get")',
    'CREATE EDGE RoleHasPermission FROM (SELECT FROM Role WHERE name = "Anonymous User") TO (SELECT FROM Permission WHERE name = "journalist.api_get")',

    // Registered User - Logged in User
    'CREATE EDGE RoleHasPermission FROM (SELECT FROM Role WHERE name = "Registered User") TO (SELECT FROM Permission WHERE name = "tag.api_get")',
    'CREATE EDGE RoleHasPermission FROM (SELECT FROM Role WHERE name = "Registered User") TO (SELECT FROM Permission WHERE name = "article.api_get")',
    'CREATE EDGE RoleHasPermission FROM (SELECT FROM Role WHERE name = "Registered User") TO (SELECT FROM Permission WHERE name = "user.api_self")',
    'CREATE EDGE RoleHasPermission FROM (SELECT FROM Role WHERE name = "Registered User") TO (SELECT FROM Permission WHERE name = "comment.vote")',
    'CREATE EDGE RoleHasPermission FROM (SELECT FROM Role WHERE name = "Registered User") TO (SELECT FROM Permission WHERE name = "article.rate")',

    // Administrator - Site Administrator AKA Super User
    'CREATE EDGE RoleHasPermission FROM (SELECT FROM Role WHERE name = "Administrator") TO (SELECT FROM Permission WHERE name = "article.delete")',
    'CREATE EDGE RoleHasPermission FROM (SELECT FROM Role WHERE name = "Administrator") TO (SELECT FROM Permission WHERE name = "journalist.admin")',
    'CREATE EDGE RoleHasPermission FROM (SELECT FROM Role WHERE name = "Administrator") TO (SELECT FROM Permission WHERE name = "journalist.delete")',
    'CREATE EDGE RoleHasPermission FROM (SELECT FROM Role WHERE name = "Administrator") TO (SELECT FROM Permission WHERE name = "publisher.admin")',
    'CREATE EDGE RoleHasPermission FROM (SELECT FROM Role WHERE name = "Administrator") TO (SELECT FROM Permission WHERE name = "publisher.delete")',
    'CREATE EDGE RoleHasPermission FROM (SELECT FROM Role WHERE name = "Administrator") TO (SELECT FROM Permission WHERE name = "comment.admin")',
    'CREATE EDGE RoleHasPermission FROM (SELECT FROM Role WHERE name = "Administrator") TO (SELECT FROM Permission WHERE name = "comment.delete")',
    'CREATE EDGE RoleHasPermission FROM (SELECT FROM Role WHERE name = "Administrator") TO (SELECT FROM Permission WHERE name = "user.admin")',
    'CREATE EDGE RoleHasPermission FROM (SELECT FROM Role WHERE name = "Administrator") TO (SELECT FROM Permission WHERE name = "user.delete")',
    'CREATE EDGE RoleHasPermission FROM (SELECT FROM Role WHERE name = "Administrator") TO (SELECT FROM Permission WHERE name = "feeds.admin")',
    'CREATE EDGE RoleHasPermission FROM (SELECT FROM Role WHERE name = "Administrator") TO (SELECT FROM Permission WHERE name = "tag.delete")',

    // Senior Editor - Full Power Editor
    'CREATE EDGE RoleHasPermission FROM (SELECT FROM Role WHERE name = "Senior Editor") TO (SELECT FROM Permission WHERE name = "article.admin")',
    'CREATE EDGE RoleHasPermission FROM (SELECT FROM Role WHERE name = "Senior Editor") TO (SELECT FROM Permission WHERE name = "tag.admin")',

    // Editor - Limited Power Editor
    'CREATE EDGE RoleHasPermission FROM (SELECT FROM Role WHERE name = "Editor") TO (SELECT FROM Permission WHERE name = "article.edit")',
    'CREATE EDGE RoleHasPermission FROM (SELECT FROM Role WHERE name = "Editor") TO (SELECT FROM Permission WHERE name = "journalist.edit")',
    'CREATE EDGE RoleHasPermission FROM (SELECT FROM Role WHERE name = "Editor") TO (SELECT FROM Permission WHERE name = "publisher.edit")',
    'CREATE EDGE RoleHasPermission FROM (SELECT FROM Role WHERE name = "Editor") TO (SELECT FROM Permission WHERE name = "comment.edit")',
    'CREATE EDGE RoleHasPermission FROM (SELECT FROM Role WHERE name = "Editor") TO (SELECT FROM Permission WHERE name = "tag.edit")',

    // Moderator - Community Moderator
    'CREATE EDGE RoleHasPermission FROM (SELECT FROM Role WHERE name = "Moderator") TO (SELECT FROM Permission WHERE name = "user.edit")',

    // API User - Allowed to use the API for more then basic operations
    'CREATE EDGE RoleHasPermission FROM (SELECT FROM Role WHERE name = "API User") TO (SELECT FROM Permission WHERE name = "article.api_get")',
    'CREATE EDGE RoleHasPermission FROM (SELECT FROM Role WHERE name = "API User") TO (SELECT FROM Permission WHERE name = "journalist.api_get")',
    'CREATE EDGE RoleHasPermission FROM (SELECT FROM Role WHERE name = "API User") TO (SELECT FROM Permission WHERE name = "publisher.api_get")',
    'CREATE EDGE RoleHasPermission FROM (SELECT FROM Role WHERE name = "API User") TO (SELECT FROM Permission WHERE name = "comment.api_get")',
    'CREATE EDGE RoleHasPermission FROM (SELECT FROM Role WHERE name = "API User") TO (SELECT FROM Permission WHERE name = "user.api_get")',

    // Article
    'DROP CLASS Article',
    'CREATE CLASS Article EXTENDS V',
    'CREATE PROPERTY Article.featured SHORT',
    'CREATE PROPERTY Article.title STRING',
    'CREATE PROPERTY Article.url STRING',
    'CREATE PROPERTY Article.body STRING',
    'CREATE PROPERTY Article.post_date LONG',
    'CREATE PROPERTY Article.creation_date LONG',
    'CREATE PROPERTY Article.modification_date LONG',
    'CREATE PROPERTY Article.imageUrl STRING',
    'CREATE PROPERTY Article.slug STRING',
    'CREATE PROPERTY Article.point STRING',
    'CREATE INDEX Article.featured ON Article (featured) NOTUNIQUE',
    'CREATE INDEX Article.title ON Article (title) NOTUNIQUE',
    'CREATE INDEX Article.slug ON Article (slug) UNIQUE',

    // ArticleFact
    'DROP CLASS ArticleFact',
    'CREATE CLASS ArticleFact EXTENDS V',
    'CREATE PROPERTY ArticleFact.note STRING',
    //'CREATE PROPERTY ArticleFact.quote STRING',
    'CREATE PROPERTY ArticleFact.type STRING',
    'CREATE PROPERTY ArticleFact.creation_date LONG',
    'CREATE PROPERTY ArticleFact.modification_date LONG',
    'CREATE INDEX ArticleFact.type ON ArticleFact (type) NOTUNIQUE',

    // ArticleStatement
    'DROP CLASS ArticleStatement',
    'CREATE CLASS ArticleStatement EXTENDS V',
    'CREATE PROPERTY ArticleStatement.note STRING',
    //'CREATE PROPERTY ArticleStatement.quote STRING',
    'CREATE PROPERTY ArticleStatement.type STRING',
    'CREATE PROPERTY ArticleStatement.creation_date LONG',
    'CREATE PROPERTY ArticleStatement.modification_date LONG',
    'CREATE INDEX ArticleStatement.type ON ArticleStatement (type) NOTUNIQUE',

    // ArticleHasFact
    'DROP CLASS ArticleHasFact',
    'CREATE CLASS ArticleHasFact EXTENDS E',

    // ArticleHasStatement
    'DROP CLASS ArticleHasStatement',
    'CREATE CLASS ArticleHasStatement EXTENDS E',

    // Publisher
    'DROP CLASS Publisher',
    'CREATE CLASS Publisher EXTENDS V',
    'CREATE PROPERTY Publisher.name STRING',
    'CREATE PROPERTY Publisher.url STRING',
    'CREATE PROPERTY Publisher.imageUrl STRING',
    'CREATE PROPERTY Publisher.slug STRING',
    'CREATE PROPERTY Publisher.creation_date LONG',
    'CREATE PROPERTY Publisher.modification_date LONG',
    'CREATE PROPERTY Publisher.email STRING',
    'CREATE PROPERTY Publisher.summary STRING',
    'CREATE PROPERTY Publisher.about STRING',
    'CREATE PROPERTY Publisher.owner STRING',
    'CREATE PROPERTY Publisher.owner_url STRING',
    'CREATE PROPERTY Publisher.twitter STRING',
    'CREATE PROPERTY Publisher.facebook STRING',
    'CREATE INDEX Publisher.slug ON Publisher (slug) UNIQUE',
    'CREATE INDEX Publisher.name ON Publisher (name) NOTUNIQUE',

    // Journalist
    'DROP CLASS Journalist',
    'CREATE CLASS Journalist EXTENDS V',
    'CREATE PROPERTY Journalist.first_name STRING',
    'CREATE PROPERTY Journalist.last_name STRING',
    'CREATE PROPERTY Journalist.email STRING',
    'CREATE PROPERTY Journalist.creation_date LONG',
    'CREATE PROPERTY Journalist.modification_date LONG',
    'CREATE PROPERTY Journalist.status SHORT',
    'CREATE PROPERTY Journalist.imageUrl STRING',
    'CREATE PROPERTY Journalist.url STRING',
    'CREATE PROPERTY Journalist.slug STRING',
    'CREATE PROPERTY Journalist.summary STRING',
    'CREATE PROPERTY Journalist.interest STRING',
    'CREATE PROPERTY Journalist.contact_url STRING',
    'CREATE PROPERTY Journalist.contact_email STRING',
    'CREATE PROPERTY Journalist.contact_twitter STRING',
    'CREATE PROPERTY Journalist.contact_fb STRING',
    'CREATE PROPERTY Journalist.contact_linkedin STRING',
    'CREATE INDEX Journalist.slug ON Journalist (slug) UNIQUE',
    'CREATE INDEX Journalist.email ON Journalist (email) UNIQUE',
    'INSERT INTO Journalist SET first_name = "Unknown", last_name = "Journalist", email = "unknown@gmail.com", status = 1',


    //JournalistBackground
    'DROP CLASS JournalistBackground',
    'CREATE CLASS JournalistBackground EXTENDS V',
    'CREATE PROPERTY JournalistBackground.organization STRING',
    'CREATE PROPERTY JournalistBackground.title STRING',
    'CREATE PROPERTY JournalistBackground.year_start STRING',
    'CREATE PROPERTY JournalistBackground.year_end STRING',
    'CREATE PROPERTY JournalistBackground.description STRING',
    'CREATE PROPERTY JournalistBackground.creation_date LONG',
    'CREATE PROPERTY JournalistBackground.modification_date LONG',

    //JournalistLinkBackground
    'DROP CLASS JournalistLinkBackground',
    'CREATE CLASS JournalistLinkBackground EXTENDS E',

    // ArticleHasPublisher
    'DROP CLASS ArticleHasPublisher',
    'CREATE CLASS ArticleHasPublisher EXTENDS E',
    'CREATE PROPERTY ArticleHasPublisher.out LINK Article',
    'CREATE PROPERTY ArticleHasPublisher.in LINK Publisher',
    'ALTER PROPERTY ArticleHasPublisher.out MANDATORY=true',
    'ALTER PROPERTY ArticleHasPublisher.in MANDATORY=true',
    'CREATE INDEX UniqueArticleHasPublisher on ArticleHasPublisher (out, in) UNIQUE',

    // ArticleHasJournalist
    'DROP CLASS ArticleHasJournalist',
    'CREATE CLASS ArticleHasJournalist EXTENDS E',
    'CREATE PROPERTY ArticleHasJournalist.out LINK Article',
    'CREATE PROPERTY ArticleHasJournalist.in LINK Journalist',
    'ALTER PROPERTY ArticleHasJournalist.out MANDATORY=true',
    'ALTER PROPERTY ArticleHasJournalist.in MANDATORY=true',
    'CREATE INDEX UniqueArticleHasJournalist on ArticleHasJournalist (out, in) UNIQUE',

    // Tag
    'DROP CLASS Tag',
    'CREATE CLASS Tag EXTENDS V',
    'CREATE PROPERTY Tag.name STRING',
    'CREATE PROPERTY Tag.type_group STRING',
    'CREATE PROPERTY Tag.type STRING',
    'CREATE PROPERTY Tag.slug STRING',
    'CREATE PROPERTY Tag.creation_date LONG',
    'CREATE PROPERTY Tag.modification_date LONG',
    'CREATE INDEX Tag.slug ON Tag (slug) UNIQUE',
    'CREATE INDEX Tag.name ON Tag (name) NOTUNIQUE',

    // Group
    'DROP CLASS Group',
    'CREATE CLASS Group EXTENDS V',
    'CREATE PROPERTY Group.name STRING',
    'CREATE PROPERTY Group.description STRING',
    'CREATE PROPERTY Group.imageUrl STRING',
    'CREATE PROPERTY Group.type SHORT',
    'CREATE PROPERTY Group.url STRING',
    'CREATE PROPERTY Group.creation_date LONG',
    'CREATE PROPERTY Group.modification_date LONG',
    'CREATE PROPERTY Group.status SHORT',
    'CREATE PROPERTY Group.slug STRING',
    'CREATE PROPERTY Group.contact_email STRING',
    'CREATE PROPERTY Group.contact_twitter STRING',
    'CREATE PROPERTY Group.contact_url STRING',
    'CREATE PROPERTY Group.contact_fb STRING',
    'CREATE PROPERTY Group.contact_linkedin STRING',
    'CREATE INDEX Group.slug ON Group (slug) UNIQUE',
    'CREATE INDEX Group.name ON Group (name) NOTUNIQUE',

    // FeedSettings
    'DROP CLASS UserFeedSettings',
    'CREATE CLASS UserFeedSettings EXTENDS V',
    'CREATE PROPERTY UserFeedSettings.article_filter SHORT',
    'CREATE PROPERTY UserFeedSettings.track_public_ratings SHORT',
    'CREATE PROPERTY UserFeedSettings.avg_article_rating SHORT',
    'CREATE PROPERTY UserFeedSettings.importance_rating SHORT',
    'CREATE PROPERTY UserFeedSettings.factuality_rating SHORT',
    'CREATE PROPERTY UserFeedSettings.transparency_rating SHORT',
    'CREATE PROPERTY UserFeedSettings.independence_rating SHORT',
    'CREATE PROPERTY UserFeedSettings.creation_date LONG',
    'CREATE PROPERTY UserFeedSettings.modification_date LONG',

    // ArticleHasTag
    'DROP CLASS ArticleHasTag',
    'CREATE CLASS ArticleHasTag EXTENDS E',
    'CREATE PROPERTY ArticleHasTag.out LINK Article',
    'CREATE PROPERTY ArticleHasTag.in LINK Tag',
    'CREATE PROPERTY ArticleHasTag.relevance DECIMAL',
    'ALTER PROPERTY ArticleHasTag.out MANDATORY=true',
    'ALTER PROPERTY ArticleHasTag.in MANDATORY=true',
    'CREATE INDEX UniqueArticleHasTag on ArticleHasTag (out, in) UNIQUE',

    // UserRateArticle
    'DROP CLASS UserRateArticle',
    'CREATE CLASS UserRateArticle EXTENDS E',
    'CREATE PROPERTY UserRateArticle.in LINK Article',
    'CREATE PROPERTY UserRateArticle.out LINK User',
    'ALTER PROPERTY UserRateArticle.out MANDATORY=true',
    'ALTER PROPERTY UserRateArticle.in MANDATORY=true',
    'CREATE PROPERTY UserRateArticle.value DECIMAL',
    'CREATE PROPERTY UserRateArticle.creation_date LONG',
    'CREATE PROPERTY UserRateArticle.type STRING',
    'ALTER PROPERTY UserRateArticle.value MANDATORY=true',
    'ALTER PROPERTY UserRateArticle.type MANDATORY=true',
    'ALTER PROPERTY UserRateArticle.creation_date MANDATORY=true',
    'CREATE INDEX UniqueUserRateArticle on UserRateArticle (out, in, type) UNIQUE',

    // UserRateJournalist
    'DROP CLASS UserRateJournalist',
    'CREATE CLASS UserRateJournalist EXTENDS E',
    'CREATE PROPERTY UserRateJournalist.type SHORT',
    'CREATE PROPERTY UserRateJournalist.value DECIMAL',
    'CREATE INDEX UserRateJournalist.type ON UserRateJournalist (type) NOTUNIQUE',
    'CREATE INDEX UserRateJournalist.value ON UserRateJournalist (value) NOTUNIQUE',

    // UserFriendUser
    'DROP CLASS UserFriendUser',
    'CREATE CLASS UserFriendUser EXTENDS E',
    'CREATE PROPERTY UserFriendUser.in LINK User',
    'CREATE PROPERTY UserFriendUser.out LINK User',
    'ALTER PROPERTY UserFriendUser.out MANDATORY=true',
    'ALTER PROPERTY UserFriendUser.in MANDATORY=true',
    'CREATE INDEX UniqueUserFriendUser ON UserFriendUser (out, in) UNIQUE',

    // UserInGroup
    'DROP CLASS UserInGroup',
    'CREATE CLASS UserInGroup EXTENDS E',
    'CREATE PROPERTY UserInGroup.in LINK Group',
    'CREATE PROPERTY UserInGroup.out LINK User',
    'ALTER PROPERTY UserInGroup.out MANDATORY=true',
    'ALTER PROPERTY UserInGroup.in MANDATORY=true',
    'CREATE PROPERTY UserInGroup.Administrator SHORT',
    'CREATE PROPERTY UserInGroup.Moderator SHORT',
    'CREATE INDEX UniqueUserInGroup on UserInGroup(out, in) UNIQUE',

    // UserHasFeedSettings
    'DROP CLASS UserHasFeedSettings',
    'CREATE CLASS UserHasFeedSettings EXTENDS E',

    // UserFeedSettingsHasPublisher
    'DROP CLASS UserFeedSettingsHasPublisher',
    'CREATE CLASS UserFeedSettingsHasPublisher EXTENDS E',
    'CREATE PROPERTY UserFeedSettingsHasPublisher.out LINK UserFeedSettings',
    'CREATE PROPERTY UserFeedSettingsHasPublisher.in LINK Publisher',
    'ALTER PROPERTY UserFeedSettingsHasPublisher.out MANDATORY=true',
    'ALTER PROPERTY UserFeedSettingsHasPublisher.in MANDATORY=true',
    'CREATE INDEX UniqueUserFeedSettingsHasPublisher on UserFeedSettingsHasPublisher(out, in) UNIQUE',

    // UserFeedSettingsHasJournalist
    'DROP CLASS UserFeedSettingsHasJournalist',
    'CREATE CLASS UserFeedSettingsHasJournalist EXTENDS E',
    'CREATE PROPERTY UserFeedSettingsHasJournalist.out LINK UserFeedSettings',
    'CREATE PROPERTY UserFeedSettingsHasJournalist.in LINK Journalist',
    'ALTER PROPERTY UserFeedSettingsHasJournalist.out MANDATORY=true',
    'ALTER PROPERTY UserFeedSettingsHasJournalist.in MANDATORY=true',
    'CREATE INDEX UniqueUserFeedSettingsHasJournalist on UserFeedSettingsHasJournalist(out, in) UNIQUE',

    // UserFeedSettingsHasTag
    'DROP CLASS UserFeedSettingsHasTag',
    'CREATE CLASS UserFeedSettingsHasTag EXTENDS E',
    'CREATE PROPERTY UserFeedSettingsHasTag.out LINK UserFeedSettings',
    'CREATE PROPERTY UserFeedSettingsHasTag.in LINK Tag',
    'ALTER PROPERTY UserFeedSettingsHasTag.out MANDATORY=true',
    'ALTER PROPERTY UserFeedSettingsHasTag.in MANDATORY=true',
    'CREATE INDEX UniqueUserFeedSettingsHasTag on UserFeedSettingsHasTag(out, in) UNIQUE',

    // UserFeedSettingsHasFriend
    'DROP CLASS UserFeedSettingsHasFriend',
    'CREATE CLASS UserFeedSettingsHasFriend EXTENDS E',
    'CREATE PROPERTY UserFeedSettingsHasFriend.out LINK UserFeedSettings',
    'CREATE PROPERTY UserFeedSettingsHasFriend.in LINK User',
    'ALTER PROPERTY UserFeedSettingsHasFriend.out MANDATORY=true',
    'ALTER PROPERTY UserFeedSettingsHasFriend.in MANDATORY=true',
    'CREATE INDEX UniqueUserFeedSettingsHasFriend on UserFeedSettingsHasFriend(out, in) UNIQUE',

    // UserFeedSettingsHasGroup
    'DROP CLASS UserFeedSettingsHasGroup',
    'CREATE CLASS UserFeedSettingsHasGroup EXTENDS E',
    'CREATE PROPERTY UserFeedSettingsHasGroup.out LINK UserFeedSettings',
    'CREATE PROPERTY UserFeedSettingsHasGroup.in LINK Group',
    'ALTER PROPERTY UserFeedSettingsHasGroup.out MANDATORY=true',
    'ALTER PROPERTY UserFeedSettingsHasGroup.in MANDATORY=true',
    'CREATE INDEX UniqueUserFeedSettingsHasGroup on UserFeedSettingsHasGroup(out, in) UNIQUE',

    // JournalistHasPublisher
    'DROP CLASS JournalistHasPublisher',
    'CREATE CLASS JournalistHasPublisher EXTENDS E',

    // SourceFeed
    'DROP CLASS SourceFeed',
    'CREATE CLASS SourceFeed EXTENDS V',
    'CREATE PROPERTY SourceFeed.title STRING',
    'CREATE PROPERTY SourceFeed.url STRING',
    'CREATE PROPERTY SourceFeed.endpoint STRING',
    'CREATE PROPERTY SourceFeed.slug STRING',
    'CREATE PROPERTY SourceFeed.creation_date LONG',
    'CREATE PROPERTY SourceFeed.modification_date LONG',
    'CREATE INDEX SourceFeed.url ON SourceFeed (url) NOTUNIQUE',
    'CREATE INDEX SourceFeed.slug ON SourceFeed (slug) UNIQUE',

    // SourceFeedOfPublisher
    'DROP CLASS SourceFeedOfPublisher',
    'CREATE CLASS SourceFeedOfPublisher EXTENDS E',

    //Comment
    'DROP CLASS Comment',
    'CREATE CLASS Comment EXTENDS V',
    'CREATE PROPERTY Comment.body STRING',
    'CREATE PROPERTY Comment.type SHORT',
    'CREATE PROPERTY Comment.creation_date LONG',
    'CREATE PROPERTY Comment.modification_date LONG',
    'CREATE INDEX Comment.type ON Comment (type) NOTUNIQUE',

    //PublisherHasComment
    'DROP CLASS PublisherHasComment',
    'CREATE CLASS PublisherHasComment EXTENDS E',
    //ArticleHasComment
    'DROP CLASS ArticleHasComment',
    'CREATE CLASS ArticleHasComment EXTENDS E',
    //JournalistHasComment
    'DROP CLASS JournalistHasComment',
    'CREATE CLASS JournalistHasComment EXTENDS E',
    //UserHasComment
    'DROP CLASS UserHasComment',
    'CREATE CLASS UserHasComment EXTENDS E',
    //Comment
    'DROP CLASS CommentHasChildComments',
    'CREATE CLASS CommentHasChildComments EXTENDS E',
    //UserVoteComment
    'DROP CLASS UserVoteComment',
    'CREATE CLASS UserVoteComment EXTENDS E',
    'CREATE PROPERTY UserVoteComment.out LINK User',
    'CREATE PROPERTY UserVoteComment.in LINK Comment',
    'CREATE PROPERTY UserVoteComment.vote SHORT',
    'ALTER PROPERTY UserVoteComment.out MANDATORY=true',
    'ALTER PROPERTY UserVoteComment.in MANDATORY=true',
    'CREATE INDEX UniqueUserVoteComment on UserVoteComment(out, in) UNIQUE',

    // --
    // Temporary Fixtures
    // --

    'CREATE INDEX ArticleFact.note ON ArticleFact (note) NOTUNIQUE',
    'CREATE INDEX ArticleStatement.note ON ArticleStatement (note) NOTUNIQUE',
    'INSERT INTO Article SET title="Some Great Test Article", body="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam bibendum convallis lectus, eu scelerisque dolor ornare non. Vestibulum feugiat blandit lacus eu eleifend. Aenean consectetur felis sed massa vestibulum ornare. Morbi sit amet luctus turpis, ut accumsan arcu. Suspendisse bibendum justo ut interdum tempor. Ut in mollis purus, quis sodales felis. Vivamus non malesuada risus, quis lobortis diam.\n\nProin sit amet erat porttitor eros elementum adipiscing. Vivamus vel vulputate mauris. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Suspendisse potenti. Phasellus feugiat volutpat nibh ut lacinia. Praesent lacinia est a justo eleifend, sit amet porttitor eros laoreet. Mauris rutrum velit metus, id consectetur nisi congue gravida. Mauris aliquet ligula tempus mauris mollis luctus.\n\nEtiam posuere, magna vitae pharetra euismod, mi tellus bibendum nibh, varius venenatis sapien mi in libero. Maecenas turpis tortor, mollis vel lacinia et, dignissim in turpis. Pellentesque posuere est in varius pharetra. Duis eros dui, lobortis rhoncus bibendum eu, molestie ac mi. Phasellus volutpat magna quis nulla feugiat consequat. Etiam pulvinar, turpis nec malesuada lacinia, ipsum quam posuere felis, vel mattis justo nisl in nunc. Donec a mattis lectus. Integer in mi eu tortor pharetra interdum a vel tortor. Praesent mollis ante mollis, vehicula nisi sit amet, consequat nisi. Curabitur vel nibh quis ligula accumsan facilisis sed sed massa. Etiam ornare sagittis elit quis condimentum. Ut rutrum massa non urna condimentum cursus. Maecenas sit amet consequat massa, id pellentesque mi. Vivamus ullamcorper risus non dolor lobortis sodales. Etiam ultrices varius ultrices. Integer egestas, dui a ornare tempus, lorem nulla rutrum nulla, in elementum lacus nibh a tortor.\n\nAliquam erat volutpat. Curabitur neque nunc, vulputate eu fringilla vel, fermentum quis justo. Interdum et malesuada fames ac ante ipsum primis in faucibus. Cras ut tempus nulla, vitae vehicula massa. Mauris laoreet elit lorem, ac bibendum neque interdum eu. Proin arcu ante, ultricies id ligula eu, ornare semper purus. Etiam lobortis erat vel urna consequat varius. Maecenas vestibulum rhoncus cursus.\n\nDuis eu varius orci. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus condimentum a leo id cursus. Vestibulum ut odio sed est elementum viverra ac sit amet risus. Vestibulum in dolor neque. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec commodo mauris aliquam, lobortis ipsum non, sagittis lorem. Morbi nibh nibh, faucibus in pellentesque vitae, posuere eu erat. Sed tortor sem, scelerisque ut molestie ut, iaculis sed velit. Aenean eu dolor consectetur, mollis nulla eu, ornare elit. Mauris posuere tellus libero, ut viverra urna tempus quis. Nunc vehicula dui eu neque rhoncus, ac euismod velit ullamcorper. Sed in massa lacinia, semper nisi a, hendrerit lacus.", featured=0, imageUrl="http://google.com", url="http://google.com/glass", post_date=1397573350, creation_date =1397573350, modification_date=1397573350, slug="best-article-ever"',
    'INSERT INTO Article SET title="Test Article 2", body="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam bibendum convallis lectus, eu scelerisque dolor ornare non. Vestibulum feugiat blandit lacus eu eleifend. Aenean consectetur felis sed massa vestibulum ornare. Morbi sit amet luctus turpis, ut accumsan arcu. Suspendisse bibendum justo ut interdum tempor. Ut in mollis purus, quis sodales felis. Vivamus non malesuada risus, quis lobortis diam.\n\nProin sit amet erat porttitor eros elementum adipiscing. Vivamus vel vulputate mauris. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Suspendisse potenti. Phasellus feugiat volutpat nibh ut lacinia. Praesent lacinia est a justo eleifend, sit amet porttitor eros laoreet. Mauris rutrum velit metus, id consectetur nisi congue gravida. Mauris aliquet ligula tempus mauris mollis luctus.\n\nEtiam posuere, magna vitae pharetra euismod, mi tellus bibendum nibh, varius venenatis sapien mi in libero. Maecenas turpis tortor, mollis vel lacinia et, dignissim in turpis. Pellentesque posuere est in varius pharetra. Duis eros dui, lobortis rhoncus bibendum eu, molestie ac mi. Phasellus volutpat magna quis nulla feugiat consequat. Etiam pulvinar, turpis nec malesuada lacinia, ipsum quam posuere felis, vel mattis justo nisl in nunc. Donec a mattis lectus. Integer in mi eu tortor pharetra interdum a vel tortor. Praesent mollis ante mollis, vehicula nisi sit amet, consequat nisi. Curabitur vel nibh quis ligula accumsan facilisis sed sed massa. Etiam ornare sagittis elit quis condimentum. Ut rutrum massa non urna condimentum cursus. Maecenas sit amet consequat massa, id pellentesque mi. Vivamus ullamcorper risus non dolor lobortis sodales. Etiam ultrices varius ultrices. Integer egestas, dui a ornare tempus, lorem nulla rutrum nulla, in elementum lacus nibh a tortor.\n\nAliquam erat volutpat. Curabitur neque nunc, vulputate eu fringilla vel, fermentum quis justo. Interdum et malesuada fames ac ante ipsum primis in faucibus. Cras ut tempus nulla, vitae vehicula massa. Mauris laoreet elit lorem, ac bibendum neque interdum eu. Proin arcu ante, ultricies id ligula eu, ornare semper purus. Etiam lobortis erat vel urna consequat varius. Maecenas vestibulum rhoncus cursus.\n\nDuis eu varius orci. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus condimentum a leo id cursus. Vestibulum ut odio sed est elementum viverra ac sit amet risus. Vestibulum in dolor neque. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec commodo mauris aliquam, lobortis ipsum non, sagittis lorem. Morbi nibh nibh, faucibus in pellentesque vitae, posuere eu erat. Sed tortor sem, scelerisque ut molestie ut, iaculis sed velit. Aenean eu dolor consectetur, mollis nulla eu, ornare elit. Mauris posuere tellus libero, ut viverra urna tempus quis. Nunc vehicula dui eu neque rhoncus, ac euismod velit ullamcorper. Sed in massa lacinia, semper nisi a, hendrerit lacus.", featured=0, imageUrl="http://google.com", url="http://google.com/glass", post_date=1397573351, creation_date =1397573351, modification_date=1397573351, slug="test-article-2"',
    'INSERT INTO Article SET title="Test Article 3", body="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam bibendum convallis lectus, eu scelerisque dolor ornare non. Vestibulum feugiat blandit lacus eu eleifend. Aenean consectetur felis sed massa vestibulum ornare. Morbi sit amet luctus turpis, ut accumsan arcu. Suspendisse bibendum justo ut interdum tempor. Ut in mollis purus, quis sodales felis. Vivamus non malesuada risus, quis lobortis diam.\n\nProin sit amet erat porttitor eros elementum adipiscing. Vivamus vel vulputate mauris. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Suspendisse potenti. Phasellus feugiat volutpat nibh ut lacinia. Praesent lacinia est a justo eleifend, sit amet porttitor eros laoreet. Mauris rutrum velit metus, id consectetur nisi congue gravida. Mauris aliquet ligula tempus mauris mollis luctus.\n\nEtiam posuere, magna vitae pharetra euismod, mi tellus bibendum nibh, varius venenatis sapien mi in libero. Maecenas turpis tortor, mollis vel lacinia et, dignissim in turpis. Pellentesque posuere est in varius pharetra. Duis eros dui, lobortis rhoncus bibendum eu, molestie ac mi. Phasellus volutpat magna quis nulla feugiat consequat. Etiam pulvinar, turpis nec malesuada lacinia, ipsum quam posuere felis, vel mattis justo nisl in nunc. Donec a mattis lectus. Integer in mi eu tortor pharetra interdum a vel tortor. Praesent mollis ante mollis, vehicula nisi sit amet, consequat nisi. Curabitur vel nibh quis ligula accumsan facilisis sed sed massa. Etiam ornare sagittis elit quis condimentum. Ut rutrum massa non urna condimentum cursus. Maecenas sit amet consequat massa, id pellentesque mi. Vivamus ullamcorper risus non dolor lobortis sodales. Etiam ultrices varius ultrices. Integer egestas, dui a ornare tempus, lorem nulla rutrum nulla, in elementum lacus nibh a tortor.\n\nAliquam erat volutpat. Curabitur neque nunc, vulputate eu fringilla vel, fermentum quis justo. Interdum et malesuada fames ac ante ipsum primis in faucibus. Cras ut tempus nulla, vitae vehicula massa. Mauris laoreet elit lorem, ac bibendum neque interdum eu. Proin arcu ante, ultricies id ligula eu, ornare semper purus. Etiam lobortis erat vel urna consequat varius. Maecenas vestibulum rhoncus cursus.\n\nDuis eu varius orci. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus condimentum a leo id cursus. Vestibulum ut odio sed est elementum viverra ac sit amet risus. Vestibulum in dolor neque. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec commodo mauris aliquam, lobortis ipsum non, sagittis lorem. Morbi nibh nibh, faucibus in pellentesque vitae, posuere eu erat. Sed tortor sem, scelerisque ut molestie ut, iaculis sed velit. Aenean eu dolor consectetur, mollis nulla eu, ornare elit. Mauris posuere tellus libero, ut viverra urna tempus quis. Nunc vehicula dui eu neque rhoncus, ac euismod velit ullamcorper. Sed in massa lacinia, semper nisi a, hendrerit lacus.", featured=0, imageUrl="http://google.com", url="http://google.com/glass", post_date=1397573352, creation_date =1397573352, modification_date=1397573352, slug="test-article-3"',
    'INSERT INTO Article SET title="Test Article 4", body="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam bibendum convallis lectus, eu scelerisque dolor ornare non. Vestibulum feugiat blandit lacus eu eleifend. Aenean consectetur felis sed massa vestibulum ornare. Morbi sit amet luctus turpis, ut accumsan arcu. Suspendisse bibendum justo ut interdum tempor. Ut in mollis purus, quis sodales felis. Vivamus non malesuada risus, quis lobortis diam.\n\nProin sit amet erat porttitor eros elementum adipiscing. Vivamus vel vulputate mauris. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Suspendisse potenti. Phasellus feugiat volutpat nibh ut lacinia. Praesent lacinia est a justo eleifend, sit amet porttitor eros laoreet. Mauris rutrum velit metus, id consectetur nisi congue gravida. Mauris aliquet ligula tempus mauris mollis luctus.\n\nEtiam posuere, magna vitae pharetra euismod, mi tellus bibendum nibh, varius venenatis sapien mi in libero. Maecenas turpis tortor, mollis vel lacinia et, dignissim in turpis. Pellentesque posuere est in varius pharetra. Duis eros dui, lobortis rhoncus bibendum eu, molestie ac mi. Phasellus volutpat magna quis nulla feugiat consequat. Etiam pulvinar, turpis nec malesuada lacinia, ipsum quam posuere felis, vel mattis justo nisl in nunc. Donec a mattis lectus. Integer in mi eu tortor pharetra interdum a vel tortor. Praesent mollis ante mollis, vehicula nisi sit amet, consequat nisi. Curabitur vel nibh quis ligula accumsan facilisis sed sed massa. Etiam ornare sagittis elit quis condimentum. Ut rutrum massa non urna condimentum cursus. Maecenas sit amet consequat massa, id pellentesque mi. Vivamus ullamcorper risus non dolor lobortis sodales. Etiam ultrices varius ultrices. Integer egestas, dui a ornare tempus, lorem nulla rutrum nulla, in elementum lacus nibh a tortor.\n\nAliquam erat volutpat. Curabitur neque nunc, vulputate eu fringilla vel, fermentum quis justo. Interdum et malesuada fames ac ante ipsum primis in faucibus. Cras ut tempus nulla, vitae vehicula massa. Mauris laoreet elit lorem, ac bibendum neque interdum eu. Proin arcu ante, ultricies id ligula eu, ornare semper purus. Etiam lobortis erat vel urna consequat varius. Maecenas vestibulum rhoncus cursus.\n\nDuis eu varius orci. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus condimentum a leo id cursus. Vestibulum ut odio sed est elementum viverra ac sit amet risus. Vestibulum in dolor neque. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec commodo mauris aliquam, lobortis ipsum non, sagittis lorem. Morbi nibh nibh, faucibus in pellentesque vitae, posuere eu erat. Sed tortor sem, scelerisque ut molestie ut, iaculis sed velit. Aenean eu dolor consectetur, mollis nulla eu, ornare elit. Mauris posuere tellus libero, ut viverra urna tempus quis. Nunc vehicula dui eu neque rhoncus, ac euismod velit ullamcorper. Sed in massa lacinia, semper nisi a, hendrerit lacus.", featured=0, imageUrl="http://google.com", url="http://google.com/glass", post_date=1397573353, creation_date =1397573353, modification_date=1397573353, slug="test-article-4"',
    'INSERT INTO ArticleFact SET note="Fact: This is the best article ever!", type="immediate"',
    'INSERT INTO ArticleFact SET note="Fact: It\'s possible this isn\'t the best article ever.", type="contextual"',
    'INSERT INTO ArticleStatement SET note="asdasdsadsa", type="immediate"',
    'INSERT INTO ArticleStatement SET note="asdasdsadsa 2", type="contextual"',
    'CREATE EDGE ArticleHasFact FROM (SELECT FROM Article WHERE slug="best-article-ever") TO (SELECT FROM ArticleFact WHERE note = "Fact: This is the best article ever!")',
    'CREATE EDGE ArticleHasFact FROM (SELECT FROM Article WHERE slug="best-article-ever") TO (SELECT FROM ArticleFact WHERE note = "Fact: It\'s possible this isn\'t the best article ever.")',
    'CREATE EDGE ArticleHasStatement FROM (SELECT FROM Article WHERE slug="best-article-ever") TO (SELECT FROM ArticleStatement WHERE note = "asdasdsadsa")',
    'CREATE EDGE ArticleHasStatement FROM (SELECT FROM Article WHERE slug="best-article-ever") TO (SELECT FROM ArticleStatement WHERE note = "asdasdsadsa 2")',

    'INSERT INTO Publisher SET name="The Boston Herald", slug="boston-herald", url="http://bostonherald.com/", imageUrl="http://bostonherald.com/sites/all/themes/ike_omega/images/taxonomy/news_opinion/logo_news.gif", summary="Lorem ipsum dolor sit amet, consectetur adipiscing elit.", about="Lorem ipsum dolor sit amet, consectetur adipiscing elit.", specialty="Lorem ipsum dolor sit amet, consectetur adipiscing elit.", owner="Unknown"',
    'INSERT INTO Publisher SET name="The Toronto Sun", slug="toronto-sun", url="http://www.torontosun.com/", imageUrl="http://www.torontosun.com/assets/img/interface/sun.png", summary="Lorem ipsum dolor sit amet, consectetur adipiscing elit.", about="Lorem ipsum dolor sit amet, consectetur adipiscing elit.", specialty="Lorem ipsum dolor sit amet, consectetur adipiscing elit.", owner="Sun Media"',
    'INSERT INTO Publisher SET name="The Vancouver Sun", slug="vancouver-sun", url="http://www.vancouversun.com/", imageUrl="http://www.vancouversun.com/images/logo_vancouversun.gif", summary="Lorem ipsum dolor sit amet, consectetur adipiscing elit.", about="Lorem ipsum dolor sit amet, consectetur adipiscing elit.", specialty="Lorem ipsum dolor sit amet, consectetur adipiscing elit.", owner="Sun Media"',
    'INSERT INTO Publisher SET name="The Wall Street Journal", slug="wall-street-journal", url="http://online.wsj.com/", summary="Lorem ipsum dolor sit amet, consectetur adipiscing elit.", about="Lorem ipsum dolor sit amet, consectetur adipiscing elit.", specialty="Lorem ipsum dolor sit amet, consectetur adipiscing elit.", owner="Amazon"',

    'INSERT INTO Journalist SET first_name="Rebecca", last_name="Grant", email="rebeccagrant@bostonherald.com", status="1", slug="rebecca-grant", summary="Lorem ipsum dolor sit amet, consectetur adipiscing elit.", interest="Lorem ipsum dolor sit amet, consectetur adipiscing elit."',
    'INSERT INTO Journalist SET first_name="Bruce", last_name="Garrioch", email="bruce@ottawasun.com", status="1", slug="bruce-garrioch", summary="Lorem ipsum dolor sit amet, consectetur adipiscing elit.", interest="Lorem ipsum dolor sit amet, consectetur adipiscing elit."',
    'INSERT INTO Journalist SET first_name="Cam", last_name="Cole", email="cam@vancouversun.com", status="1", slug="cam-cole", summary="Lorem ipsum dolor sit amet, consectetur adipiscing elit.", interest="Lorem ipsum dolor sit amet, consectetur adipiscing elit."',
    'INSERT INTO Journalist SET first_name="Douglas", last_name="Belkin", email="douglas@wsj.com", status="1", slug="douglas-belkin", summary="Lorem ipsum dolor sit amet, consectetur adipiscing elit.", interest="Lorem ipsum dolor sit amet, consectetur adipiscing elit."',

    'CREATE EDGE ArticleHasPublisher FROM (SELECT FROM Article WHERE slug="best-article-ever") TO (SELECT FROM Publisher WHERE slug="boston-herald")',
    'CREATE EDGE ArticleHasJournalist FROM (SELECT FROM Article WHERE slug="best-article-ever") TO (SELECT FROM Journalist WHERE slug="rebecca-grant")',
    'CREATE EDGE ArticleHasPublisher FROM (SELECT FROM Article WHERE slug="test-article-2") TO (SELECT FROM Publisher WHERE slug="boston-herald")',
    'CREATE EDGE ArticleHasJournalist FROM (SELECT FROM Article WHERE slug="test-article-2") TO (SELECT FROM Journalist WHERE slug="rebecca-grant")',
    'CREATE EDGE ArticleHasPublisher FROM (SELECT FROM Article WHERE slug="test-article-3") TO (SELECT FROM Publisher WHERE slug="boston-herald")',
    'CREATE EDGE ArticleHasJournalist FROM (SELECT FROM Article WHERE slug="test-article-3") TO (SELECT FROM Journalist WHERE slug="cam-cole")',
    'CREATE EDGE ArticleHasPublisher FROM (SELECT FROM Article WHERE slug="test-article-4") TO (SELECT FROM Publisher WHERE slug="boston-herald")',
    'CREATE EDGE ArticleHasJournalist FROM (SELECT FROM Article WHERE slug="test-article-4") TO (SELECT FROM Journalist WHERE slug="rebecca-grant")',

    'INSERT INTO Tag SET name="politics", slug="politics", type_group="socialTag"',
    'INSERT INTO Tag SET name="sports", slug="sports", type_group="socialTag"',
    'INSERT INTO Tag SET name="money", slug="money", type_group="socialTag"',
    'INSERT INTO Tag SET name="entertainment", slug="entertainment", type_group="socialTag"',
    'INSERT INTO Tag SET name="technology", slug="technology", type_group="socialTag"',
    'INSERT INTO Tag SET name="science", slug="science", type_group="socialTag"',
    'CREATE EDGE ArticleHasTag FROM (SELECT FROM Article WHERE slug="best-article-ever") TO (SELECT FROM Tag WHERE name = "politics") SET relevance = 1',
    'CREATE EDGE ArticleHasTag FROM (SELECT FROM Article WHERE slug="best-article-ever") TO (SELECT FROM Tag WHERE name = "sports") SET relevance = 1',

    'INSERT INTO Group SET name="The Test Group", slug="test-group", type=0, status=0',
    'INSERT INTO Group SET name="Canadians", slug="canadians", type=0, status=0',
    'INSERT INTO Group SET name="The Test Group 2", slug="test-group-2", type=0, status=0',
    'INSERT INTO Group SET name="The Test Group 3", slug="test-group-3", type=0, status=0',
    'INSERT INTO Group SET name="The Test Group 4", slug="test-group-4", type=0, status=0',
    'INSERT INTO Group SET name="The Test Group 5", slug="test-group-5", type=0, status=0',

    'INSERT INTO Comment SET type=1, body="Comment1", creation_date =1397573360, modification_date=1397573360',
    'INSERT INTO Comment SET type=1, body="Comment1-Comment1", creation_date =1397573363, modification_date=1397573350',
    'INSERT INTO Comment SET type=1, body="Comment1-Comment2", creation_date =1397573363, modification_date=1397573350',
    'INSERT INTO Comment SET type=1, body="Comment1-Comment1-Comment1", creation_date =1397573363, modification_date=1397573350',
    'INSERT INTO Comment SET type=1, body="Comment1-Comment1-Comment1-Comment1", creation_date =1397573363, modification_date=1397573350',
    'INSERT INTO Comment SET type=1, body="Comment1-Comment1-Comment1-Comment1-Comment1", creation_date =1397573363, modification_date=1397573350',

    'CREATE EDGE UserHasComment FROM (SELECT FROM User WHERE handle="admin") TO (SELECT FROM Comment WHERE body="Comment1")',
    'CREATE EDGE UserHasComment FROM (SELECT FROM User WHERE handle="admin") TO (SELECT FROM Comment WHERE body="Comment1-Comment1")',
    'CREATE EDGE UserHasComment FROM (SELECT FROM User WHERE handle="admin") TO (SELECT FROM Comment WHERE body="Comment1-Comment2")',
    'CREATE EDGE UserHasComment FROM (SELECT FROM User WHERE handle="admin") TO (SELECT FROM Comment WHERE body="Comment1-Comment1-Comment1")',
    'CREATE EDGE UserHasComment FROM (SELECT FROM User WHERE handle="admin") TO (SELECT FROM Comment WHERE body="Comment1-Comment1-Comment1-Comment1")',
    'CREATE EDGE UserHasComment FROM (SELECT FROM User WHERE handle="admin") TO (SELECT FROM Comment WHERE body="Comment1-Comment1-Comment1-Comment1-Comment1")',
    'CREATE EDGE ArticleHasComment FROM (SELECT FROM Article WHERE slug="best-article-ever") TO (SELECT FROM Comment WHERE body="Comment1")',
    'CREATE EDGE ArticleHasComment FROM (SELECT FROM Article WHERE slug="best-article-ever") TO (SELECT FROM Comment WHERE body="Comment1-Comment1")',
    'CREATE EDGE ArticleHasComment FROM (SELECT FROM Article WHERE slug="best-article-ever") TO (SELECT FROM Comment WHERE body="Comment1-Comment2")',
    'CREATE EDGE ArticleHasComment FROM (SELECT FROM Article WHERE slug="best-article-ever") TO (SELECT FROM Comment WHERE body="Comment1-Comment1-Comment1")',
    'CREATE EDGE ArticleHasComment FROM (SELECT FROM Article WHERE slug="best-article-ever") TO (SELECT FROM Comment WHERE body="Comment1-Comment1-Comment1-Comment1")',
    'CREATE EDGE ArticleHasComment FROM (SELECT FROM Article WHERE slug="best-article-ever") TO (SELECT FROM Comment WHERE body="Comment1-Comment1-Comment1-Comment1-Comment1")',
    'CREATE EDGE CommentHasChildComments FROM (SELECT FROM Comment WHERE body="Comment1") TO (SELECT FROM Comment WHERE body="Comment1-Comment1")',
    'CREATE EDGE CommentHasChildComments FROM (SELECT FROM Comment WHERE body="Comment1") TO (SELECT FROM Comment WHERE body="Comment1-Comment2")',
    'CREATE EDGE CommentHasChildComments FROM (SELECT FROM Comment WHERE body="Comment1-Comment1") TO (SELECT FROM Comment WHERE body="Comment1-Comment1-Comment1")',
    'CREATE EDGE CommentHasChildComments FROM (SELECT FROM Comment WHERE body="Comment1-Comment1-Comment1") TO (SELECT FROM Comment WHERE body="Comment1-Comment1-Comment1-Comment1")',
    'CREATE EDGE CommentHasChildComments FROM (SELECT FROM Comment WHERE body="Comment1-Comment1-Comment1-Comment1") TO (SELECT FROM Comment WHERE body="Comment1-Comment1-Comment1-Comment1-Comment1")',

    // Test Ratings
    'CREATE EDGE UserRateArticle FROM (SELECT FROM User WHERE handle = "editor") TO (SELECT FROM Article WHERE slug="best-article-ever") SET value = 30, type="importance", creation_date = 1397573350',
    'CREATE EDGE UserRateArticle FROM (SELECT FROM User WHERE handle = "editor") TO (SELECT FROM Article WHERE slug="best-article-ever") SET value = 40, type="independence", creation_date = 1397573350',
    'CREATE EDGE UserRateArticle FROM (SELECT FROM User WHERE handle = "editor") TO (SELECT FROM Article WHERE slug="best-article-ever") SET value = 50, type="factuality", creation_date = 1397573350',
    'CREATE EDGE UserRateArticle FROM (SELECT FROM User WHERE handle = "editor") TO (SELECT FROM Article WHERE slug="best-article-ever") SET value = 40, type="transparency", creation_date = 1397573350',
    'CREATE EDGE UserRateArticle FROM (SELECT FROM User WHERE handle = "admin") TO (SELECT FROM Article WHERE slug="best-article-ever") SET value = 40, type="importance", creation_date = 1397573350',
    'CREATE EDGE UserRateArticle FROM (SELECT FROM User WHERE handle = "admin") TO (SELECT FROM Article WHERE slug="best-article-ever") SET value = 40, type="independence", creation_date = 1397573350',
    'CREATE EDGE UserRateArticle FROM (SELECT FROM User WHERE handle = "admin") TO (SELECT FROM Article WHERE slug="best-article-ever") SET value = 10, type="factuality", creation_date = 1397573350',
    'CREATE EDGE UserRateArticle FROM (SELECT FROM User WHERE handle = "admin") TO (SELECT FROM Article WHERE slug="best-article-ever") SET value = 20, type="transparency", creation_date = 1397573350',

    // Testing Editor
    'INSERT INTO User SET handle = "editor", password = "' + crypto.createHash('sha1').update('testeditor').digest('hex') + '", first_name="Test", last_name="Editor", email="ruben+mynews_testeditor@gmail.com", status = 1',
    'CREATE EDGE UserHasRole FROM (SELECT FROM User WHERE handle = "editor") TO (SELECT FROM Role WHERE name = "Editor")',
    'CREATE EDGE UserHasRole FROM (SELECT FROM User WHERE handle = "editor") TO (SELECT FROM Role WHERE name = "Registered User")',
    'INSERT INTO UserFeedSettings SET track_public_ratings=0, article_filter=0, avg_article_rating=40',
    'CREATE EDGE UserHasFeedSettings FROM (SELECT FROM UserFeedSettings WHERE track_public_ratings=0) TO (SELECT FROM User WHERE handle="admin")',
    'INSERT INTO UserFeedSettings SET track_public_ratings=10, article_filter=0, avg_article_rating=40',
    'CREATE EDGE UserHasFeedSettings FROM (SELECT FROM UserFeedSettings WHERE track_public_ratings=10) TO (SELECT FROM User WHERE handle="editor")',

    'CREATE EDGE UserFriendUser FROM (SELECT FROM User WHERE handle = "admin") TO (SELECT FROM User WHERE handle="editor")',
    'CREATE EDGE UserFriendUser FROM (SELECT FROM User WHERE handle = "editor") TO (SELECT FROM User WHERE handle="admin")',

    'CREATE EDGE UserFeedSettingsHasPublisher FROM (SELECT expand(in(\'UserHasFeedSettings\')) FROM User WHERE handle = \'admin\') TO (SELECT FROM Publisher WHERE slug="boston-herald")'
];

Mynews.connect(Config, function(e) {
    if (e) {
        Util.log(e);
        Util.log("Migration shutting down...");
    } else {
        Util.log("OrientDB connection available. Starting migration...");

        try {
            Async.forEachSeries(commands, function(query, next) {
                Util.log(query);
                Mynews.odb.query(query)
                    .then(
                        function() {
                            next(null);
                        }
                    );
            }, function(errors) {
                if (errors) {
                    Util.log(errors);
                } else {
                    Util.log('Migration tasks complete.');
                    process.exit(1);
                }
            });
        }
        catch(e) {
            console.log(e);
        }

    }
})
