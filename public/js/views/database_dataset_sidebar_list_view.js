chorus.views.DatabaseDatasetSidebarList = chorus.views.DatabaseSidebarList.extend({
    constructorName: "DatabaseDatasetSidebarListView",
    className:"database_dataset_sidebar_list",
    useLoadingSection: true,

    subviews: {
        ".list_contents": "listview"
    },

    setup: function() {
        this._super("setup", arguments);

        this.datasets = new chorus.collections.DatasetSet([], {workspaceId: chorus.page.workspace.id});
        this.datasets.fetch();

        this.bindings.add(this.datasets, "loaded", this.workspaceDatasetsLoaded);
    },

    postRender: function() {
        this._super("postRender", arguments);

        chorus.search({
            list: this.$('ul'),
            input: this.$('input.search'),
            onTextChange: _.debounce(_.bind(this.searchTextChanged, this), 400)
        });
    },

    workspaceDatasetsLoaded: function() {
        this.schemas.onLoaded(this.addThisWorkspace, this);
    },

    addThisWorkspace: function() {
        var schema = new chorus.models.Schema({id: "workspaceSchema", name: t("database.sidebar.this_workspace")});
        schema._databaseObjects = this.datasets;
        this.schemas.add(schema, { at: 0 });
        this.render();
    },

    fetchResourceAfterSchemaSelected: function() {
        this.resource = this.collection = this.schema.databaseObjects();
        this.collection.fetchIfNotLoaded();

        this.listview = new chorus.views.DatabaseDatasetSidebarListItem({collection: this.collection});
        this.bindings.add(this.listview, "fetch:more", this.fetchMoreDatasets);
        this.bindings.add(this.collection, "searched", this.onSearchComplete);
    },

    fetchMoreDatasets: function(e) {
        e && e.preventDefault();
        var next = parseInt(this.collection.pagination.page) + 1;
        this.collection.fetchPage(next, { add: true , success: _.bind(this.render, this) });
    },

    searchTextChanged: function(e) {
    },

    onSearchComplete: function() {
    },

    displayLoadingSection: function () {
        return this.schema && !(this.collection && (this.collection.loaded || this.collection.serverErrors));
    }
});
