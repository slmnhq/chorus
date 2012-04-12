chorus.views.DatabaseDatasetSidebarList = chorus.views.DatabaseSidebarList.extend({
    constructorName: "DatabaseDatasetSidebarListView",
    className:"database_dataset_sidebar_list",

    subviews: {
        ".list_contents": "listview"
    },

    setup: function() {
        this._super("setup", arguments);

        this.datasets = new chorus.collections.DatasetSet([], { workspaceId: chorus.page.workspace.id });
        this.datasets.sortAsc("objectName");
        this.datasets.fetch();
    },

    postRender: function() {
        this._super("postRender", arguments);

        chorus.search({
            list: this.$('ul'),
            input: this.$('input.search'),
            onTextChange: _.debounce(_.bind(this.searchTextChanged, this), 400)
        });
    },

    additionalContext: function() {
        var ctx = this._super("additionalContext", arguments);
        ctx.isWorkspaceSchema = (this.schema && this.schema.get("id") === "workspaceSchema");
        return ctx;
    },

    fetchResourceAfterSchemaSelected: function() {
        this.collection = this.schema.databaseObjects();
        this.collection.fetchIfNotLoaded();
        this.bindings.add(this.collection, "searched", this.onSearchComplete);

        this.listview = new chorus.views.DatabaseDatasetSidebarListItem({collection: this.collection});
        this.bindings.add(this.listview, "fetch:more", this.fetchMoreDatasets);
    },

    setSchemaToCurrentWorkspace: function() {
        this.schema = new chorus.models.Schema({id: "workspaceSchema", name: t("database.sidebar.this_workspace")});
        this.schema._databaseObjects = this.datasets;
    },

    fetchMoreDatasets: function(e) {
        e && e.preventDefault();
        var next = parseInt(this.collection.pagination.page) + 1;
        this.collection.fetchPage(next, { add: true , success: _.bind(this.datasetsAdded, this) });
    },

    datasetsAdded: function() {
        this.listview.render();
        this.recalculateScrolling($("#sidebar"));
    },

    searchTextChanged: function(e) {
        this.collection.search($(e.target).val());
    },

    onSearchComplete: function() {
        this.listview.render();
    }
});
