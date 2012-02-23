chorus.views.DatabaseDatasetSidebarList = chorus.views.DatabaseSidebarList.extend({
    className:"database_dataset_sidebar_list",
    useLoadingSection: true,

    events:_.extend({}, chorus.views.DatabaseSidebarList.prototype.events, {
        "click li a":"datasetSelected"
    }),

    fetchResourceAfterSchemaSelected: function() {
        this.resource = this.collection = this.schema.databaseObjects();
        this.collection.fetchAllIfNotLoaded();
        this.collection.bind("reset", this.render, this);
    },

    datasetSelected: function (e) {
        e.preventDefault();
        var li = $(e.currentTarget).closest("li"),
            type = li.data("type"),
            name = li.data("name");

        var dataset = this.collection.findWhere({ type:type, objectName: name });
        this.trigger("datasetSelected", dataset);
    },

    additionalContext:function () {
        this.collection && this.collection.models.sort(function (a, b) {
            return naturalSort(a.get("objectName").toLowerCase(), b.get("objectName").toLowerCase());
        });

        return this._super("additionalContext", arguments);
    },

    collectionModelContext:function (model) {
        return {
            type:model.get("type"),
            name:model.get("objectName"),
            cid:model.cid
        }
    },

    displayLoadingSection: function () {
        return this.schema && !(this.collection && this.collection.loaded);
    }
});


