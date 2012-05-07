chorus.views.TabularDataSidebar = chorus.views.Sidebar.extend({
    constructorName: "TabularDataSidebarView",
    templateName: "tabular_data_sidebar",

    events: {
        "click .no_credentials a.add_credentials": "launchAddCredentialsDialog",
        "click .actions .associate": "launchAssociateWithWorkspaceDialog",
        "click .multiple_selection .associate": "launchAssociateMultipleWithWorkspaceDialog",
        "click .tabular_data_preview": "launchTabularDataPreviewDialog",
        "click .actions a.analyze" : "launchAnalyzeAlert",
        "click a.duplicate": "launchDuplicateChorusView"
    },

    subviews: {
        '.tab_control': 'tabs'
    },

    setup: function() {
        this.checkedDatasetsLength = 0;
        chorus.PageEvents.subscribe("tabularData:selected", this.setTabularData, this);
        chorus.PageEvents.subscribe("tabularData:checked", this.tabularDataChecked, this);
        chorus.PageEvents.subscribe("column:selected", this.setColumn, this);
        chorus.PageEvents.subscribe("importSchedule:changed", this.updateImportSchedule, this);
        chorus.PageEvents.subscribe("workspace:associated", this.refetchModel, this);
        chorus.PageEvents.subscribe("analyze:running", this.resetStatistics, this)
        chorus.PageEvents.subscribe("start:visualization", this.enterVisualizationMode, this)
        chorus.PageEvents.subscribe("cancel:visualization", this.endVisualizationMode, this)
        this.tabs = new chorus.views.TabControl(['activity', 'statistics']);
    },

    render: function() {
        if (!this.disabled) {
            this._super("render", arguments);
        }
    },

    refetchModel: function() {
        this.resource && this.resource.fetch();
    },

    setColumn: function(column) {
        if (column) {
            this.selectedColumn = column;
            this.tabs.statistics.column = column;
        } else {
            delete this.selectedColumn;
            delete this.tabs.statistics.column;
        }

        this.render();
    },

    setTabularData: function(tabularData) {
        this.resource = tabularData;
        if (tabularData) {

            var activities = tabularData.activities();
            activities.fetch();

            this.tabs.activity = new chorus.views.ActivityList({
                collection: activities,
                additionalClass: "sidebar",
                displayStyle: ['without_workspace'],
                type: t("database_object." + tabularData.get('objectType'))
            });

            this.tabs.statistics = new chorus.views.TabularDataStatistics({
                model: tabularData,
                column: this.selectedColumn
            });

            if (tabularData.canBeImportSourceOrDestination()) {
                this.importConfiguration = tabularData.getImport();
                this.importConfiguration.onLoaded(this.render, this);
                this.importConfiguration.fetch();
            }
        } else {
            delete this.tabs.statistics;
            delete this.tabs.activity;
            delete this.importConfiguration;
        }

        this.render();
    },

    tabularDataChecked: function(checkedDatasets) {
        this.checkedDatasets = checkedDatasets;
        this.showOrHideMultipleSelectionSection();
    },

    showOrHideMultipleSelectionSection: function() {
        var multiSelectEl = this.$(".multiple_selection");
        var numChecked = this.checkedDatasets ? this.checkedDatasets.length : 0;
        multiSelectEl.toggleClass("hidden", numChecked <= 1);
        multiSelectEl.find(".count").text(t("dataset.sidebar.multiple_selection.count", { count: numChecked }))
    },

    resetStatistics: function(){
        this.resource.statistics().fetch();
    },

    additionalContext: function() {
        return new chorus.presenters.TabularDataSidebar(this);
    },

    postRender: function() {
        var $actionLinks = this.$("a.create_schedule, a.edit_schedule, a.import_now, a.download");
        $actionLinks.data("dataset", this.resource);
        $actionLinks.data("workspace", this.options.workspace);
        this.showOrHideMultipleSelectionSection();
        this._super("postRender");
    },

    launchAddCredentialsDialog: function(e) {
        e && e.preventDefault();
        new chorus.dialogs.InstanceAccount({ instance: this.resource.instance(), title: t("instances.sidebar.add_credentials"), reload: true, goBack: false }).launchModal();
    },

    launchAssociateWithWorkspaceDialog: function(e) {
        e.preventDefault();

        new chorus.dialogs.AssociateWithWorkspace({model: this.resource, activeOnly: true}).launchModal();
    },

    launchAssociateMultipleWithWorkspaceDialog: function(e) {
        e.preventDefault();

        new chorus.dialogs.AssociateMultipleWithWorkspace({databaseObjects: this.checkedDatasets, activeOnly: true}).launchModal();
    },

    launchTabularDataPreviewDialog: function(e) {
        e.preventDefault();

        new chorus.dialogs.TabularDataPreview({model: this.resource}).launchModal();
    },

    launchAnalyzeAlert: function(e) {
        e && e.preventDefault();
        new chorus.alerts.Analyze({model: this.resource}).launchModal();
    },

    launchDuplicateChorusView: function(e) {
        e.preventDefault();
        var launchElement = $(e.target)
        var dialog = new chorus.dialogs.VerifyChorusView({ model : this.resource.createDuplicateChorusView(), launchElement: launchElement });
        dialog.launchModal();
    },

    updateImportSchedule: function(importConfiguration) {
        this.importConfiguration = importConfiguration;
        this.render();
    },

    enterVisualizationMode: function() {
        $(this.el).addClass("visualizing");
    },

    endVisualizationMode: function() {
        $(this.el).removeClass("visualizing");
    }
});
