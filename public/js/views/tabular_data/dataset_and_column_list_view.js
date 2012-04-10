chorus.views.DatasetAndColumnList = chorus.views.Base.extend({
    className: "dataset_and_column_list",

    subviews: {
        ".database_dataset_list": "datasetList",
        ".database_column_list": "columnList"
    },

    setup: function() {
        this.datasetList = new chorus.views.DatabaseDatasetSidebarList({ schema: this.model });
        this.columnList = new chorus.views.DatabaseColumnSidebarList({ schema: this.model });

        chorus.PageEvents.subscribe("datasetSelected", function(tableOrView) {
            this.$(".database_column_list").removeClass("hidden");
            this.$(".database_dataset_list").addClass("hidden");
        }, this);

        this.columnList.bind("back", function() {
            this.$("input.search").val("");
            this.$(".database_dataset_list").removeClass("hidden");
            this.$(".database_column_list").addClass("hidden");
        }, this);
    }
});
