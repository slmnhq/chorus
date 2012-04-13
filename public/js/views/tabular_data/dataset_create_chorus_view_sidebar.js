chorus.views.CreateChorusViewSidebar = chorus.views.Sidebar.extend({
    className: "dataset_create_chorus_view_sidebar",

    events: {
        "click button.create": "createChorusView",
        "click a.remove": "removeColumnClicked",
        "click img.delete": "removeJoinClicked",
        "click a.preview": "previewSqlLinkClicked"
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

    previewSqlLinkClicked: function(e) {
        e.preventDefault();
        this.chorusView.set({ query: this.sql() });
        var dialog = new chorus.dialogs.SqlPreview({ model: this.chorusView });
        dialog.launchModal();
    },

    createChorusView: function(e) {
        e && e.preventDefault();
        this.chorusView.set({ query: this.sql(), });
        var dialog = new chorus.dialogs.NameChorusView({ model : this.chorusView });
        dialog.launchModal();
    },

    whereClause: function() {
        return this.filters.whereClause();
    },

    sql: function() {
        return [this.chorusView.generateSelectClause(), this.chorusView.generateFromClause(), this.whereClause()].join("\n");
    }
});
