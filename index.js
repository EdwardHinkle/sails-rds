var AWS = require('aws-sdk'),
    _ = require('underscore');

module.exports = (function() {

    var getMatchIndices = require('waterline-criteria');

    //Tell me what environment variables exist
    console.log("AWS environment variables available:")
    _.each(process.env, function (item, key) {
        if (key.indexOf('AWS') > -1) {
            console.log("\t", key, '\t', item);
        }
    })

    //For some reason, AWS is not detecting my env variables.
    AWS.config.update({accessKeyId:process.env.AWS_ACCESS_KEY, secretAccessKey:process.env.AWS_SECRET_ACCESS_KEY});
    AWS.config.update({region:process.env.AWS_REGION});

    var rds = new AWS.RDS();

    /**
     * Gernric find function
     * @param options
     */
    function find (options, cb) {
        var params = {};
        if (options.where && options.where.id) {
            params.DBInstanceIdentifier = options.where.id;
        }
        if (options.limit) {
            params.MaxRecords = options.limit;
        }
        rds.describeDBInstances(params, function (err, data) {
            var instances;

            if (data && data.DBInstances) {
                instances = data.DBInstances;
                //filter out unwanted keys with waterline criteria
                _.each(instances, function (instance) {
                    instance.id = instance.DBInstanceIdentifier;
                });

                var matchIndices = getMatchIndices(instances, options);
                instances = _.select(instances, function (model, i) {
                    return _.contains(matchIndices, i);
                });
            }
            cb(err, instances);
        });
    }

    var adapter = {
        syncable: true, // to track schema internally
        collections: {},

        defaults: {
            schema: true,
            nativeParser: false,
            safe: true
        },

        /**
         *  These aren't needed.
         */
        registerCollection: function(collection, cb) { return cb(); },
        teardown: function(cb) { cb(); },
        define: function(collectionName, definition, cb) { cb(); },
        describe: function(collectionName, cb) { cb(null, {}); },
        drop: function(collectionName, relations, cb) { cb(); },

        /**
         *
         * @param  {string} collectionName
         * @param  {{}} options
         * @param  {Function} cb callback
         */
        find: function(collectionName, options, cb) {
            find(options, cb);
        },

        /**
         *
         * REQUIRED method if users expect to call Model.destroy()
         *
         * @param  {[type]}   collectionName [description]
         * @param  {[type]}   options        [description]
         * @param  {Function} cb             [description]
         * @return {[type]}                  [description]
         */
        destroy: function(collectionName, options, cb) {
            cb(new Error("Not supported yet."));
        },

        /**
         *
         * REQUIRED method if users expect to call Model.create() or any methods
         *
         * @param  {string}   collectionName
         * @param  {{}}   values
         * @param  {Function} cb callback
         */
        create: function(collectionName, values, cb) {
            cb(new Error("Not supported yet."));
        },

        /**
         *
         *
         * REQUIRED method if users expect to call Model.update()
         *
         * @param  {[type]}   collectionName [description]
         * @param  {[type]}   options        [description]
         * @param  {[type]}   values         [description]
         * @param  {Function} cb             [description]
         * @return {[type]}                  [description]
         */
        update: function(collectionName, options, values, cb) {
            cb(new Error("Not supported yet."));
        }
    };

    return adapter;

})();