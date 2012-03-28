chorus.views.TabularDataSidebar = chorus.views.Sidebar.extend({
    constructorName: "TabularDataSidebarView",
    className: "tabular_data_sidebar",

    events: {
        "click .no_credentials a.add_credentials": "launchAddCredentialsDialog",
        "click .associate": "launchAssociateWithWorkspaceDialog",
        "click .tabular_data_preview": "launchTabularDataPreviewDialog"
    },

    subviews: {
        '.activity_list': 'activityList',
        '.tab_control': 'tabControl'
    },

    setup: function() {
        chorus.PageEvents.subscribe("tabularData:selected", this.setTabularData, this);
        chorus.PageEvents.subscribe("column:selected", this.setColumn, this);
        chorus.PageEvents.subscribe("importSchedule:changed", this.updateImportSchedule, this);
        chorus.PageEvents.subscribe("workspace:associated", this.refetchModel, this);
        this.tabControl = new chorus.views.TabControl([
            {name: 'activity', selector: ".activity_list"},
            {name: 'statistics', selector: ".statistics_detail"}
        ]);
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
        } else {
            delete this.selectedColumn;
        }

        this.render();
    },

    setTabularData: function(tabularData) {
        this.resource = tabularData;
        if (tabularData) {
            this.statistics = tabularData.statistics();
            this.statistics.fetchIfNotLoaded();
            this.statistics.onLoaded(this.render, this);

            var activities = tabularData.activities();
            activities.fetch();

            this.activityList = new chorus.views.ActivityList({
                collection: activities,
                additionalClass: "sidebar",
                displayStyle: ['without_workspace'],
                type: t("database_object." + tabularData.get('objectType'))
            });

            this.activityList.bind("content:changed", this.recalculateScrolling, this)

            if (tabularData.canBeImportSourceOrDestination()) {
                this.importConfiguration = tabularData.getImport();
                this.importConfiguration.onLoaded(this.render, this);
                this.importConfiguration.fetch();
            }
        } else {
            delete this.statistics;
            delete this.activityList;
            delete this.importConfiguration;
        }

        this.render();
    },

    additionalContext: function() {
        return new chorus.presenters.TabularDataSidebar(this);
    },

    postRender: function() {
        var $importLinks = this.$("a.create_schedule, a.edit_schedule, a.import_now, a.create_database_view");
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

    updateImportSchedule: function(importConfiguration) {
        this.importConfiguration = importConfiguration;
        this.render();
    }
});
