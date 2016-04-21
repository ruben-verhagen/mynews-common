angular.module('CommonModels').factory('Comment', function($http, RID) {

    var Comment = function(data) {
        angular.extend(this, data);
    }

    // --
    // Core Object
    // --

    /**
     * Fetch a specific Comment
     *
     * @param   string      id      Comment identifier
     */
    Comment.get = function(id) {
        id = RID.Encode(id);
        var url = NL_API_HOST + '/article/' + id;
        return $http.get(url);
    }

    /**
     * Create a Comment
     *
     * @param   string      type    Comment type
     * @param   Obj         props   Properties to update
     */
    Comment.create = function(type, props) {
        var url = NL_API_HOST + '/' + type + '/' + RID.Encode(props.owner_id) + '/comment';
        return $http.post(url, props);
    }

    /**
     * Update a specific Comment
     *
     * @param   string      id      Comment identifier
     * @param   Obj         props   Properties to update
     */
    Comment.update = function(id, props) {
        id = RID.Encode(id);
        var url = NL_API_HOST + '/article/' + id;
        return $http.put(url, props);
    }

    /**
     * Delete a specific Comment
     *
     * @param   string      id      Comment identifier
     */
    Comment.delete = function(id) {
        id = RID.Encode(id);
        var url = NL_API_HOST + '/article/' + id;
        return $http.del(url);
    }

    /**
     * List Comments
     *
     * @param   string      id      Comment identifier
     * @param   string      type    Comment type
     */
    Comment.list = function(id, type) {
        var url = NL_API_HOST + '/' + type + '/' + RID.Encode(id) + '/comment';
        return $http.get(url);
    }

    /**
     * Vote on a Comment
     *
     * @param   string      id      Comment identifier
     * @param   string      vote    a
     */
    Comment.vote = function(id, vote) {
        var url = NL_API_HOST + '/comment/' + RID.Encode(id) + '/vote/' + vote;
        return $http.post(url);
    }

    return Comment;

});