angular.module('CommonModels').factory('Group', function($http, RID) {

    var Group = function(data) {
        angular.extend(this, data);
    }

    /**
     * Fetch a specific Group
     *
     * @param   string      id      Group identifier
     */
    Group.get = function(id) {
        id = RID.Encode(id);
        var url = NL_API_HOST + '/group/' + id;
        return $http.get(url);
    }

    /**
     * Create a Group
     *
     * @param   Obj         props   Properties to update
     */
    Group.create = function(props) {
        var url = NL_API_HOST + '/group';
        return $http.post(url, props);
    }

    /**
     * Update a specific Group
     *
     * @param   string      id      Group identifier
     * @param   Obj         props   Properties to update
     */
    Group.update = function(id, props) {
        id = RID.Encode(id);
        var url = NL_API_HOST + '/group/' + id;
        return $http.put(url, props);
    }

    /**
     * Delete a specific Group
     *
     * @param   string      id      Group identifier
     */
    Group.delete = function(id) {
        id = RID.Encode(id);
        var url = NL_API_HOST + '/group/' + id;
        return $http.del(url);
    }

    /**
     * List Groups
     */
    Group.list = function() {
        var url = NL_API_HOST + '/groups';
        return $http.get(url);
    }

    /**
     * Join Group
     *
     * @param   string  userId  New Member Identifier/User Id
     * @param   string  groupId Group-to-Join's Identifier
     */
    Group.join = function(userId,groupId){
        var url = NL_API_HOST + '/group/' + RID.Encode(groupId) + '/member';
        return $http.post(url,{member_id:userId});
    };

    /**
     * Leave Group
     *
     * @param   string  userId  Leaving Member's Identifier/User Id
     * @param   string  groupId Group-to-Leave's Identifier
     */
    Group.leave = function(userId,groupId){
        var url = NL_API_HOST + '/group/' + RID.Encode(groupId) + '/member/' + RID.Encode(userId);
        return $http.delete(url);
    };
    return Group;
});