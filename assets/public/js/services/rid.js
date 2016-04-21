angular.module('CommonServices')
    .service('RID', function ($rootScope) {

        return {

            /**
             * Encodes an OrientDB @rid for use in urls.
             *
             * @param   String    rid     RID Value (Eg. #30:1)
             * @returns String
             */
            Encode: function(rid) {
                return rid.replace('#', '').replace(':', '.');
            },

            /**
             * Decodes an OrientDB @rid from use in urls.
             *
             * @param   String    rid     RID Value in URL format (Eg. 30.1)
             * @returns String
             */
            Decode: function(rid) {
                return '#' + rid.replace('.', ':');
            }

        }
    });