chorus.dialogs.JoinConfiguration = chorus.dialogs.Base.extend({
    className: "join_configuration",
    additionalClass: "with_sub_header",
    title: t("dataset.manage_join_tables.title"),
    useLoadingSection:true,

    setup: function() {
        this.destinationObject = this.options.destinationObject;
        this.requiredResources.push(this.destinationObject.columns());
        this.destinationObject.columns().fetchIfNotLoaded();
    },

    additionalContext: function() {
        var sourceColumns = this.model.sourceObject.columns().map(function(col) {
            return { name: col.get('name') }
        })

        var destinationColumns = this.destinationObject.columns().map(function(col) {
            return { name: col.get('name') }
        })

        return {
            destinationObjectName: this.destinationObject.get("objectName"),
            destinationColumns: destinationColumns,
            sourceColumns: sourceColumns
        }
    },

    postRender: function() {
        chorus.styleSelect(this.$("select"));
    }
});
