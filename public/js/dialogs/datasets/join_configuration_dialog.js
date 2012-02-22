chorus.dialogs.JoinConfiguration = chorus.dialogs.Base.extend({
    className: "join_configuration",
    additionalClass: "with_sub_header",
    title: t("dataset.manage_join_tables.title"),
    useLoadingSection:true,

    subviews: {
        ".source_columns": "sourceColumnsSelect",
        ".destination_columns": "destinationColumnsSelect"
    },

    events: {
        "click button.submit": "addJoin"
    },

    setup: function() {
        this.destinationObject = this.options.destinationObject;
        var destinationColumns = this.destinationObject.columns()
        this.requiredResources.push(destinationColumns);
        destinationColumns.fetchIfNotLoaded();
        this.sourceColumnsSelect = new chorus.views.ColumnSelect({collection: this.model.sourceObject.columns(), showAliasedName: true})
        this.destinationColumnsSelect = new chorus.views.ColumnSelect({collection: destinationColumns})
    },

    additionalContext: function() {
        return {
            destinationObjectName: this.destinationObject.get("objectName"),
            joinMap: chorus.models.ChorusView.joinMap
        }
    },

    postRender: function() {
        _.defer(_.bind(function() {
            chorus.styleSelect(this.$("select.join_type"));
        }, this));
    },

    addJoin: function() {
        this.model.addJoin(
            this.sourceColumnsSelect.getSelectedColumn(),
            this.destinationColumnsSelect.getSelectedColumn(),
            this.$('select.join_type').val()
        )
        this.closeModal()
    }
});
