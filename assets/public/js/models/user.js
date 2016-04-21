angular.module('CommonModels').factory('User', function($http, RID) {

    var User = function(data) {
        angular.extend(this, data);
    }

    /**
     * Fetch a specific User
     *
     * @param   string      id      User identifier
     */
    User.get = function(id) {
        id = RID.Encode(id);
        var url = NL_API_HOST + '/user/' + id;
        return $http.get(url);
    }

    /**
     * Create a User
     *
     * @param   Obj         props   Properties to update
     */
    User.create = function(props) {
        var url = NL_API_HOST + '/user';
        return $http.post(url, props);
    }

    /**
     * Update a specific User
     *
     * @param   string      id      User identifier
     * @param   Obj         props   Properties to update
     */
    User.update = function(id, props) {
        id = RID.Encode(id);
        var url = NL_API_HOST + '/user/' + id;
        return $http.put(url, props);
    }

    /**
     * Delete a specific User
     *
     * @param   string      id      User identifier
     */
    User.delete = function(id) {
        id = RID.Encode(id);
        var url = NL_API_HOST + '/user/' + id;
        return $http.del(url);
    }

    /**
     * List Users
     */
    User.list = function() {
        var url = NL_API_HOST + '/users';
        return $http.get(url);
    }

    /**
     * List Validating Users
     */
    User.list_validating = function() {
        var url = NL_API_HOST + '/users/validating';
        return $http.get(url);
    }

    /**
     * List Active Users
     */
    User.list_active = function() {
        var url = NL_API_HOST + '/users/active';
        return $http.get(url);
    }

    /**
     * List Locked Users
     */
    User.list_locked = function() {
        var url = NL_API_HOST + '/users/locked';
        return $http.get(url);
    }

    /**
     * List Users Friends
     *
     * @param   string      id      User identifier
     */
    User.list_friends = function(id) {
        id = RID.Encode(id);
        var url = NL_API_HOST + '/user/' + id + '/friends';
        return $http.get(url);
    }

    /**
     * Toggle FeedSettings options
     *
     * @param   string  id      User identifier
     * @param   String  key     Settings Key
     * @param   mixed   val     Value to set
     */
    User.delete_feed_setting = function(id, key, val) {
        id = RID.Encode(id);

        switch (key) {
            case 'publishers':
            case 'journalists':
            case 'groups':
            case 'tags':
            case 'friends':
                var url = NL_API_HOST + '/user/' + id + '/feed/settings/' + key.slice(0, -1) + '/' + RID.Encode(val['@rid']);
                break;

            default:
                var url = NL_API_HOST + '/user/' + id + '/feed/settings';
                break;
        }

        return $http.delete(url, val);
    }

    /**
     * Update FeedSettings options
     *
     * @param   string  id      User identifier
     * @param   String  key     Settings Key
     * @param   mixed   val     Value to set
     */
    User.update_feed_setting = function(id, key, val) {
        id = RID.Encode(id);

        switch (key) {
            case 'friends':
            case 'article_filter':
            case 'track_public_ratings':
            case 'avg_article_rating':
            case 'importance_rating':
            case 'factuality_rating':
            case 'transparency_rating':
            case 'independence_rating':
                var url = NL_API_HOST + '/user/' + id + '/feed/settings';
                break;

            default:
                // ~~
                break;
        }

        return $http.put(url, val);
    }

    /**
     * Create FeedSettings options
     *
     * @param   string  id      User identifier
     * @param   String  key     Settings Key
     * @param   mixed   val     Value to set
     */
    User.create_feed_setting = function(id, key, val) {
        id = RID.Encode(id);

        switch (key) {
            case 'publishers':
            case 'journalists':
            case 'groups':
            case 'tags':
            case 'friends':
                var url = NL_API_HOST + '/user/' + id + '/feed/settings/' + key.slice(0, -1);
                break;

            default:
                // ~~
                break;
        }

        return $http.post(url, val);
    }

    /**
     * Update User Profile
     *
     * @param   string  id      User identifier
     * @param   obj     props   Properties to update, k/v pairs
     */
    User.update_profile = function(id, props) {
        id = RID.Encode(id);
        return $http.put(NL_API_HOST + '/user/' + id + '/profile', props);
    }

    /**
     * Resend Email Confirmation
     *
     * @param   string  id      User identifier
     */
    User.resend_confirmation = function(id) {
        id = RID.Encode(id);
        return $http.post(NL_API_HOST + '/user/' + id + '/confirmation');
    }

    return User;

});