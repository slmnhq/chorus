chorus.views.DatasetEditChorusViewSidebar = chorus.views.Sidebar.extend({
    className: "dataset_edit_chorus_view_sidebar",
    useLoadingSection: true,

    subviews: {
        '.activity_list': 'activityList',
        '.tab_control': 'tabControl'
    },


    setup: function(options) {
        this.collection = this.model.activities();
        this.collection.fetch();
        this.collection.bind("changed", this.render, this);
        this.activityList = new chorus.views.ActivityList({
            collection: this.collection,
            suppressHeading: true,
            additionalClass: "sidebar",
            displayStyle: ['without_object', 'without_workspace']
        });
        this.requiredResources.push(this.model);
    },

    resourcesLoaded: function() {
        var tabs = [
            {name: 'activity_list'},
            {name: 'database_function_list'},
            {name: "datasets_and_columns"}
        ];

        this.schema = new chorus.models.Schema({
            instanceId: this.model.get('instance').id,
            databaseName: this.model.get('databaseName'),
            name: this.model.get('schemaName')
        })

        this.functionList = new chorus.views.DatabaseFunctionSidebarList({schema: this.schema});
        this.datasetList = new chorus.views.DatabaseDatasetSidebarList({ schema: this.schema });
        this.columnList = new chorus.views.DatabaseColumnSidebarList({ schema: this.schema });

        this.datasetList.bind("datasetSelected", function(tableOrView) {
            this.columnList.trigger("datasetSelected", tableOrView);
            this.$(".database_column_list").removeClass("hidden");
            this.$(".database_dataset_list").addClass("hidden");
        }, this);

        this.columnList.bind("back", function() {
            this.$("input.search").val("");
            this.$(".database_dataset_list").removeClass("hidden");
            this.$(".database_column_list").addClass("hidden");
        }, this);

        this.subviews[".tabbed_area .database_function_list"] = "functionList";
        this.subviews[".tabbed_area .database_dataset_list"] = "datasetList";
        this.subviews[".tabbed_area .database_column_list"] = "columnList";
        this.tabControl = new chorus.views.TabControl(tabs);
        this.tabControl.bind("selected", _.bind(this.recalculateScrolling, this))
    }
})
;
