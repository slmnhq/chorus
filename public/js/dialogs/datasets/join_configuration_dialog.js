chorus.dialogs.JoinConfiguration = chorus.dialogs.Base.extend({
    className: "join_configuration",
    additionalClass: "with_sub_header",
    title: t("dataset.manage_join_tables.title"),
    useLoadingSection:true,

    subviews: {
        ".source_columns": "sourceColumnsSelect"
    },

    setup: function() {
        this.destinationObject = this.options.destinationObject;
        this.requiredResources.push(this.destinationObject.columns());
        this.destinationObject.columns().fetchIfNotLoaded();
        this.sourceColumnsSelect = new chorus.views.ColumnSelect({collection: this.model.sourceObject.columns(), showDatasetNumbers: true})
    },

    additionalContext: function() {
        var destinationColumns = this.destinationObject.columns().map(function(col) {
            return { name: col.get('name') }
        })

        return {
            destinationObjectName: this.destinationObject.get("objectName"),
            destinationColumns: destinationColumns
        }
    },

    postRender: function() {
        chorus.styleSelect(this.$("select"));
    }
});
