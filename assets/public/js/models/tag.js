angular.module('CommonModels').factory('Tag', function($http, RID) {

    var Tag = function(data) {
        angular.extend(this, data);
    }

    /**
     * Fetch a specific Tag
     *
     * @param   string      id      Tag identifier
     */
    Tag.get = function(id) {
        id = RID.Encode(id);
        var url = NL_API_HOST + '/tag/' + id;
        return $http.get(url);
    }

    /**
     * Create a Tag
     *
     * @param   Obj         props   Properties to update
     */
    Tag.create = function(props) {
        var url = NL_API_HOST + '/tag';
        return $http.post(url, props);
    }

    /**
     * Update a specific Tag
     *
     * @param   string      id      Tag identifier
     * @param   Obj         props   Properties to update
     */
    Tag.update = function(id, props) {
        id = RID.Encode(id);
        var url = NL_API_HOST + '/tag/' + id;
        return $http.put(url, props);
    }

    /**
     * Delete a specific Tag
     *
     * @param   string      id      Tag identifier
     */
    Tag.delete = function(id) {
        id = RID.Encode(id);
        var url = NL_API_HOST + '/tag/' + id;
        return $http.del(url);
    }

    /**
     * List Tags
     */
    Tag.list = function() {
        var url = NL_API_HOST + '/tags';
        return $http.get(url);
    }

    /**
     * Search Tags
     */
    Tag.search = function(query, page, perpage) {
        if (!query) {
            query = '';
        }
        if (!perpage) {
            perpage = 10;
        }
        if (!page) {
            page = 1;
        }

        var url = NL_API_HOST + '/tags/search';
        return $http.get(url, { params: {
            query: query,
            perpage: perpage,
            page: page
        }});
    }

    return Tag;

});