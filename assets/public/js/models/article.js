angular.module('CommonModels').factory('Article', function($http, RID) {

    var Article = function(data) {
        angular.extend(this, data);
    }
    
    // --
    // Core Object
    // --

    /**
     * Fetch a specific Article
     *
     * @param   string      id      Article identifier
     */
    Article.get = function(id) {
        id = RID.Encode(id);
        var url = NL_API_HOST + '/article/' + id;
        return $http.get(url);
    }

    /**
     * Create a Article
     *
     * @param   Obj         props   Properties to update
     */
    Article.create = function(props) {
        var url = NL_API_HOST + '/article';
        return $http.post(url, props);
    }

    /**
     * Update a specific Article
     *
     * @param   string      id      Article identifier
     * @param   Obj         props   Properties to update
     */
    Article.update = function(id, props) {
        id = RID.Encode(id);
        var url = NL_API_HOST + '/article/' + id;
        return $http.put(url, props);
    }

    /**
     * Delete a specific Article
     *
     * @param   string      id      Article identifier
     */
    Article.delete = function(id) {
        id = RID.Encode(id);
        var url = NL_API_HOST + '/article/' + id;
        return $http.del(url);
    }

    /**
     * List Articles
     */
    Article.list = function() {
        var url = NL_API_HOST + '/articles';
        return $http.get(url);
    }

    /**
     * Fetch the User's Feed
     *
     * @param   string      id      User id to fetch feed for
     */
    Article.feed = function(id) {
        var url = NL_API_HOST + '/user/' + RID.Encode(id) + '/feed';
        return $http.get(url);
    }

    // --
    // Extended Object (Facts & Statements)
    // --

    /**
     * Get Article Specific Facts
     *
     * @param   string      id      Article identifier
     * @param   Obj         props   Fact properties to create
     */
    Article.get_facts = function(id, props) {
        id = RID.Encode(id);
        var url = NL_API_HOST + '/article/' + id + '/fact';
        return $http.get(url, props);
    }

    /**
     * Create a new Article Fact
     *
     * @param   string      id      Article identifier
     * @param   Obj         props   Fact properties to create
     */
    Article.create_fact = function(id, props) {
        id = RID.Encode(id);
        var url = NL_API_HOST + '/article/' + id + '/fact';
        return $http.post(url, props);
    }

    /**
     * Update an Article Fact
     *
     * @param   string      id          Article identifier
     * @param   string      fact_id     Fact identifier
     * @param   Obj         props       Fact properties to update
     */
    Article.update_fact = function(id, fact_id, props) {
        id = RID.Encode(id);
        fact_id = RID.Encode(fact_id);
        var url = NL_API_HOST + '/article/' + id + '/fact/' + fact_id;
        return $http.put(url, props);
    }

    /**
     * Delete an Article Fact
     *
     * @param   string      id          Article identifier
     * @param   string      fact_id     Fact identifier
     */
    Article.delete_fact = function(id, fact_id) {
        id = RID.Encode(id);
        fact_id = RID.Encode(fact_id);
        var url = NL_API_HOST + '/article/' + id + '/fact/' + fact_id;
        return $http.del(url);
    }

    /**
     * Get Article Specific Statements
     *
     * @param   string      id      Article identifier
     * @param   Obj         props   Fact properties to create
     */
    Article.get_statements = function(id, props) {
        id = RID.Encode(id);
        var url = NL_API_HOST + '/article/' + id + '/statement';
        return $http.get(url, props);
    }

    /**
     * Create a new Article Statement
     *
     * @param   string      id      Article identifier
     * @param   Obj         props   Statement properties to create
     */
    Article.create_statement = function(id, props) {
        id = RID.Encode(id);
        var url = NL_API_HOST + '/article/' + id + '/statement';
        return $http.post(url, props);
    }

    /**
     * Update an Article Statement
     *
     * @param   string      id          Article identifier
     * @param   string      stmt_id     Statement identifier
     * @param   Obj         props       Statement properties to update
     */
    Article.update_statement = function(id, stmt_id, props) {
        id = RID.Encode(id);
        stmt_id = RID.Encode(stmt_id);
        var url = NL_API_HOST + '/article/' + id + '/statement/' + stmt_id;
        return $http.put(url, props);
    }

    /**
     * Delete an Article Statement
     *
     * @param   string      id          Article identifier
     * @param   string      stmt_id     Fact identifier
     */
    Article.delete_statement = function(id, stmt_id) {
        id = RID.Encode(id);
        stmt_id = RID.Encode(stmt_id);
        var url = NL_API_HOST + '/article/' + id + '/statement/' + stmt_id;
        return $http.del(url);
    }

    /**
     * Rate an Article
     *
     * @param   string      id          Article identifier
     * @param   Obj      props          Ratings
     */
    Article.rate = function(id, props) {
        id = RID.Encode(id);
        var url = NL_API_HOST + '/article/' + id + '/rate';
        return $http.post(url, props);
    }

    /**
     * Get user's rating
     *
     * @param   string      id          Article identifier
     */

    Article.get_user_rating = function(id) {
        id = RID.Encode(id);
        var url = NL_API_HOST + '/article/' + id + '/rating';
        return $http.get(url);
    }

    /**
     * Get featured articles
     *
     */

    Article.get_featured = function() {
        var url = NL_API_HOST + '/articles/featured';
        return $http.get(url);
    }

    return Article;

});