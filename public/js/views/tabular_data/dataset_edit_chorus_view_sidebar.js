chorus.views.DatasetEditChorusViewSidebar = chorus.views.Sidebar.extend({
    className: "dataset_edit_chorus_view_sidebar",
    useLoadingSection: true,

    subviews: {
        '.tab_control': 'tabs'
    },

    setup: function(options) {
        this.collection = this.model.activities();
        this.collection.fetch();

        this.bindings.add(this.collection, "changed", this.render);
        this.requiredResources.push(this.model);
    },

    resourcesLoaded: function() {
        this.tabs = new chorus.views.TabControl(["activity", "database_function_list", "datasets_and_columns"]);
        this.schema = this.model.schema();

        this.tabs.database_function_list = new chorus.views.DatabaseFunctionSidebarList({schema: this.schema});
        this.tabs.datasets_and_columns = new chorus.views.DatasetAndColumnList({model: this.schema})
        this.tabs.activity = new chorus.views.ActivityList({
            collection: this.collection,
            additionalClass: "sidebar",
            displayStyle: ['without_object', 'without_workspace']
        });

        this.tabs.bind("selected", _.bind(this.recalculateScrolling, this))
    }
});
