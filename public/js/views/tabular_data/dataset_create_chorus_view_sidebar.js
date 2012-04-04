chorus.views.CreateChorusViewSidebar = chorus.views.Sidebar.extend({
    className: "dataset_create_chorus_view_sidebar",

    events: {
        "click button.create": "createChorusView",
        "click a.remove": "removeColumnClicked",
        "click img.delete": "removeJoinClicked"
    },

    setup: function() {
        this.selectedHandle = chorus.PageEvents.subscribe("column:selected", this.addColumn, this);
        this.deselectedHandle = chorus.PageEvents.subscribe("column:deselected", this.removeColumn, this);
        this.chorusView = this.model.deriveChorusView()
        this.chorusView.aggregateColumnSet = this.options.aggregateColumnSet;
        this.bindings.add(this.chorusView, "change", this.render);
    },

    cleanup: function() {
        this._super("cleanup");
        chorus.PageEvents.unsubscribe(this.selectedHandle);
        chorus.PageEvents.unsubscribe(this.deselectedHandle);
        this.options.aggregateColumnSet.each(function(column) {
            delete column.selected;
        })
    },

    postRender: function() {
        this.$("a.preview, button.create").data("parent", this);
        this.$("a.add_join").data("chorusView", this.chorusView)
        this._super("postRender")
    },

    additionalContext: function(ctx) {
        return {
            columns: this.chorusView.sourceObjectColumns,
            joins: this.chorusView.joins
        }
    },

    addColumn: function(column) {
        this.chorusView.addColumn(column)

        this.$("button.create").prop("disabled", false);
    },

    removeColumn: function(column) {
        if (!column) {
            return;
        }
        this.chorusView.removeColumn(column);
    },

    removeColumnClicked: function(e) {
        e.preventDefault();
        var $li = $(e.target).closest("li");
        var column = this.chorusView.aggregateColumnSet.getByCid($li.data('cid'));
        this.removeColumn(column);
        chorus.PageEvents.broadcast("column:removed", column);
    },

    removeJoinClicked: function(e) {
        var cid = $(e.target).closest("div.join").data("cid");
        var dialog = new chorus.alerts.RemoveJoinConfirmAlert({dataset: this.chorusView.getJoinDatasetByCid(cid), chorusView: this.chorusView})
        dialog.launchModal();
    },

    createChorusView: function(e) {
        e && e.preventDefault();

        var chorusView = new chorus.models.ChorusView({
            type: "CHORUS_VIEW",
            query: this.sql(),
            instanceId: this.model.get("instance").id,
            instance: this.model.get("instance"),
            databaseName: this.model.get("databaseName"),
            schemaName: this.model.get("schemaName"),
            objectName: _.uniqueId("chorus_" + this.model.get("objectName") + "_"),
            workspace: this.model.get("workspace"),
            sourceObjectId: this.chorusView.get("sourceObjectId"),
            objectType: "QUERY"
        });

        var launchElement = $(e.target)
        var dialog = new chorus.dialogs.NameChorusView({ model : chorusView, launchElement: launchElement });
        dialog.launchModal();
    },

    whereClause: function() {
        return this.filters.whereClause();
    },

    sql: function() {
        return [this.chorusView.generateSelectClause(), this.chorusView.generateFromClause(), this.whereClause()].join("\n");
    }
});
