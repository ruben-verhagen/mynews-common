angular.module('CommonModels').factory('Journalist', function($http, RID) {

    var Journalist = function(data) {
        angular.extend(this, data);
    }

    /**
     * Fetch a specific Journalist
     *
     * @param   string      id      Journalist identifier
     */
    Journalist.get = function(id) {
        id = RID.Encode(id);
        var url = NL_API_HOST + '/journalist/' + id;
        return $http.get(url);
    }

    /**
     * Create a Journalist
     *
     * @param   Obj         props   Properties to update
     */
    Journalist.create = function(props) {
        var url = NL_API_HOST + '/journalist';
        return $http.post(url, props);
    }

    /**
     * Update a specific Journalist
     *
     * @param   string      id      Journalist identifier
     * @param   Obj         props   Properties to update
     */
    Journalist.update = function(id, props) {
        id = RID.Encode(id);
        var url = NL_API_HOST + '/journalist/' + id;
        return $http.put(url, props);
    }

    /**
     * Delete a specific Journalist
     *
     * @param   string      id      Journalist identifier
     */
    Journalist.delete = function(id) {
        id = RID.Encode(id);
        var url = NL_API_HOST + '/journalist/' + id;
        return $http.del(url);
    }

    /**
     * List Journalists
     */
    Journalist.list = function() {
        var url = NL_API_HOST + '/journalists';
        return $http.get(url);
    }

    /**
     * List my Journalists
     */
    Journalist.list_mine = function() {
        var url = NL_API_HOST + '/journalists/mine/';
        return $http.get(url);
    }

    /**
     * List top rated journalists
     */
    Journalist.list_toprated = function() {
        var url = NL_API_HOST + '/journalists/toprated/';
        return $http.get(url);
    }

    /**
     * List recently rated journalists
     */
    Journalist.list_recent = function() {
        var url = NL_API_HOST + '/journalists/recent/';
        return $http.get(url);
    }

    /**
     * List recently rated journalists by friends
     */
    Journalist.list_recent_ratedbyfriends = function() {
        var url = NL_API_HOST + '/journalists/friends/';
        return $http.get(url);
    }


    /**
     * Search Journalists
     */
    Journalist.search = function(query, page, perpage) {
        if (!query) {
            query = '';
        }
        if (!perpage) {
            perpage = 10;
        }
        if (!page) {
            page = 1;
        }

        var url = NL_API_HOST + '/journalists/search';
        return $http.get(url, { params: {
            query: query,
            perpage: perpage,
            page: page
        }});
    }

    return Journalist;

});