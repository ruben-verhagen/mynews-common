angular.module('CommonModels').factory('Publisher', function($http, RID) {

    var Publisher = function(data) {
        angular.extend(this, data);
    }

    /**
     * Fetch a specific Publisher
     *
     * @param   string      id      Publisher identifier
     */
    Publisher.get = function(id) {
        id = RID.Encode(id);
        var url = NL_API_HOST + '/publisher/' + id;
        return $http.get(url);
    }

    /**
     * Create a Publisher
     *
     * @param   Obj         props   Properties to update
     */
    Publisher.create = function(props) {
        var url = NL_API_HOST + '/publisher';
        return $http.post(url, props);
    }

    /**
     * Update a specific Publisher
     *
     * @param   string      id      Publisher identifier
     * @param   Obj         props   Properties to update
     */
    Publisher.update = function(id, props) {
        id = RID.Encode(id);
        var url = NL_API_HOST + '/publisher/' + id;
        return $http.put(url, props);
    }

    /**
     * Delete a specific Publisher
     *
     * @param   string      id      Publisher identifier
     */
    Publisher.delete = function(id) {
        id = RID.Encode(id);
        var url = NL_API_HOST + '/publisher/' + id;
        return $http.del(url);
    }

    /**
     * List Publishers
     */
    Publisher.list = function() {
        var url = NL_API_HOST + '/publishers';
        return $http.get(url);
    }

    /**
     * List my Publishers
     */
    Publisher.list_mine = function() {
        var url = NL_API_HOST + '/publishers/mine/';
        return $http.get(url);
    }

    /**
     * List top rated publishers
     */
    Publisher.list_toprated = function() {
        var url = NL_API_HOST + '/publishers/toprated/';
        return $http.get(url);
    }

    /**
     * List recently rated publishers
     */
    Publisher.list_recent = function() {
        var url = NL_API_HOST + '/publishers/recent/';
        return $http.get(url);
    }

    /**
     * List recently rated publishers by friends
     */
    Publisher.list_recent_ratedbyfriends = function() {
        var url = NL_API_HOST + '/publishers/friends/';
        return $http.get(url);
    }

    /**
     * Search Publishers
     */
    Publisher.search = function(query, page, perpage) {
        if (!query) {
            query = '';
        }
        if (!perpage) {
            perpage = 10;
        }
        if (!page) {
            page = 1;
        }

        var url = NL_API_HOST + '/publishers/search';
        return $http.get(url, { params: {
            query: query,
            perpage: perpage,
            page: page
        }});
    }

    return Publisher;

});