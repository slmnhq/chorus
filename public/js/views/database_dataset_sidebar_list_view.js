chorus.views.DatabaseDatasetSidebarList = chorus.views.DatabaseSidebarList.extend({
    constructorName: "DatabaseDatasetSidebarListView",
    className:"database_dataset_sidebar_list",
    useLoadingSection: true,

    events: {
        "click li a":"datasetSelected",
        "click a.more":"fetchMoreDatasets"
    },

    setup: function() {
        this._super("setup", arguments);
        this.workspaceDatasets = new chorus.collections.DatasetSet([], {workspaceId: chorus.page.workspace.id});
        this.workspaceDatasets.fetch();
        this.bindings.add(this.workspaceDatasets, "loaded", this.workspaceDatasetsLoaded);
    },

    workspaceDatasetsLoaded: function() {
        this.schemas.onLoaded(this.addThisWorkspace, this);
    },

    addThisWorkspace: function() {
        var schema = new chorus.models.Schema({id: "workspaceSchema", name: t("database.sidebar.this_workspace")});
        schema._databaseObjects = this.workspaceDatasets;
        this.schemas.add(schema, { at: 0 });
        this.render();
    },

    fetchResourceAfterSchemaSelected: function() {
        this.resource = this.collection = this.schema.databaseObjects();
        this.collection.fetchIfNotLoaded();
        this.bindings.add(this.collection, "reset", this.render);
    },

    datasetSelected: function (e) {
        e.preventDefault();
        var li = $(e.currentTarget).closest("li"),
            type = li.data("type"),
            name = li.data("name").toString();

        var dataset = this.collection.findWhere({ type:type, objectName: name });

        chorus.PageEvents.broadcast("datasetSelected", dataset);
    },

    additionalContext:function () {
        this.collection && this.collection.models.sort(function (a, b) {
            return naturalSort(a.get("objectName").toLowerCase(), b.get("objectName").toLowerCase());
        });

        var ctx = this._super("additionalContext", arguments);
        if (this.collection.pagination) {
            ctx.showMoreLink = this.collection.pagination.page < this.collection.pagination.total;
        }

        return ctx;
    },

    collectionModelContext:function (model) {
        return {
            iconUrl: model.iconUrl({size:"medium"}),
            type: model.get("type"),
            name: model.get("objectName"),
            cid: model.cid,
            fullName: model.toText()
        }
    },

    fetchMoreDatasets: function(e) {
        e && e.preventDefault();
        var next = parseInt(this.collection.pagination.page) + 1;
        this.collection.fetchPage(next, { add: true , success: _.bind(this.render, this) });
    },

    displayLoadingSection: function () {
        return this.schema && !(this.collection && (this.collection.loaded || this.collection.serverErrors));
    }
});


