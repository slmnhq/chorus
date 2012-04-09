chorus.views.TabularDataSidebar = chorus.views.Sidebar.extend({
    constructorName: "TabularDataSidebarView",
    className: "tabular_data_sidebar",

    events: {
        "click .no_credentials a.add_credentials": "launchAddCredentialsDialog",
        "click .associate": "launchAssociateWithWorkspaceDialog",
        "click .tabular_data_preview": "launchTabularDataPreviewDialog",
        "click .actions a.analyze" : "launchAnalyzeAlert"
    },

    subviews: {
        '.tab_control': 'tabs'
    },

    setup: function() {
        chorus.PageEvents.subscribe("tabularData:selected", this.setTabularData, this);
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
            this.tabs.activity.bind("content:changed", this.recalculateScrolling, this)

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

    resetStatistics: function(){
        this.resource.statistics().fetch();
    },

    additionalContext: function() {
        return new chorus.presenters.TabularDataSidebar(this);
    },

    postRender: function() {
        var $importLinks = this.$("a.create_schedule, a.edit_schedule, a.import_now");
        $importLinks.data("dataset", this.resource);
        $importLinks.data("workspace", this.options.workspace);
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

    launchTabularDataPreviewDialog: function(e) {
        e.preventDefault();

        new chorus.dialogs.TabularDataPreview({model: this.resource}).launchModal();
    },

    launchAnalyzeAlert: function(e) {
        e && e.preventDefault();

        new chorus.alerts.Analyze({model: this.resource}).launchModal();
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
