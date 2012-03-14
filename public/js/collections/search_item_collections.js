;(function() {
    chorus.collections.Search = {};

    var searchCollectionMixins = {
        initialize: function(models, options) {
            this._super("initialize", arguments);
            this.search = options.search;
        },

        refreshFromSearch: function() {
            var entityJson = this.search.get(this.searchKey);
            this.pagination = {
                page: this.search.currentPageNumber(),
                total: this.search.numPages(entityJson.numFound),
                records: entityJson.numFound
            };
            this.reset(entityJson.docs);
        },

        fetchPage: function(pageNumber, options) {
            this.search.set({ page: pageNumber });
            this.search.fetch({ success: _.bind(this.refreshFromSearch, this) });
        }
    };

    var constructorMap = {
        workfile: chorus.models.Workfile,
        databaseObject: chorus.models.DynamicTabularData,
        chorusView: chorus.models.DynamicTabularData,
        workspace: chorus.models.Workspace
    };

    chorus.collections.Search.WorkspaceItemSet = chorus.collections.Base.extend(_.extend({}, searchCollectionMixins, {
        model: function(modelJson, options) {
            var constructor = constructorMap[modelJson.entityType];
            return new constructor(modelJson, options);
        },

        searchKey: "thisWorkspace"
    }));

    chorus.collections.Search.HdfsEntrySet = chorus.collections.HdfsEntrySet.extend(_.extend({}, searchCollectionMixins, {
        searchKey: "hdfs"
    }));

    chorus.collections.Search.InstanceSet = chorus.collections.InstanceSet.extend(_.extend({}, searchCollectionMixins, {
        searchKey: "instance"
    }));

    chorus.collections.Search.TabularDataSet = chorus.collections.TabularDataSet.extend(_.extend({}, searchCollectionMixins, {
        searchKey: "dataset"
    }));

    chorus.collections.Search.UserSet = chorus.collections.UserSet.extend(_.extend({}, searchCollectionMixins, {
        searchKey: "user"
    }));

    chorus.collections.Search.WorkspaceSet = chorus.collections.WorkspaceSet.extend(_.extend({}, searchCollectionMixins, {
        searchKey: "workspace"
    }));

    chorus.collections.Search.WorkfileSet = chorus.collections.WorkfileSet.extend(_.extend({}, searchCollectionMixins, {
        searchKey: "workfile"
    }));
})();
