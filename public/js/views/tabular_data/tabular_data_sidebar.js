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

            if (tabularData.isImportable()) {
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
        var ctx = _.extend({ typeString: Handlebars.helpers.humanizedTabularDataType(this.resource && this.resource.attributes) },
                            this.options);

        if (this.resource) {
            ctx.entityType = this.resource.entityType;

            _.extend(ctx, this.importContext());

            if (this.resource.get("hasCredentials") === false) {
                ctx.noCredentials = true;
                ctx.noCredentialsWarning = chorus.helpers.safeT("dataset.credentials.missing.body", {linkText: chorus.helpers.linkTo("#", t("dataset.credentials.missing.linkText"), {'class': 'add_credentials'})})
            }

            ctx.displayEntityType = this.resource.metaType();
        }

        if (this.statistics) {
            ctx.statistics = this.statistics.attributes;
            if (ctx.statistics.rows === 0) {
                ctx.statistics.rows = "0"
            }

            if (ctx.statistics.columns === 0) {
                ctx.statistics.columns = "0"
            }
        }

        if (this.selectedColumn) {
            ctx.column = this.selectedColumn.attributes;
        }

        if (this.options.workspace) {
            ctx.canImport = this.options.workspace.canUpdate() && !ctx.noCredentials && ctx.isImportable;
            ctx.hasSandbox = this.options.workspace.sandbox();
            ctx.workspaceId = this.options.workspace.id;
        }

        return ctx;
    },

    importContext: function() {
        var ctx = {};
        if (this.resource.isImportable()) {
            ctx.isImportable = this.importConfiguration.loaded;
            ctx.hasSchedule = this.importConfiguration && this.importConfiguration.hasActiveSchedule();
            ctx.hasImport = this.importConfiguration && this.importConfiguration.has("id");

            var destinationTable = new chorus.models.Dataset({
                id: this.importConfiguration.get("destinationTable"),
                workspaceId: this.resource.get("workspace").id
            });

            if (this.importConfiguration.get("nextImportTime")) {
                ctx.nextImport = chorus.helpers.safeT("import.next_import", {
                    nextTime: chorus.helpers.relativeTimestamp(this.importConfiguration.get("nextImportTime")),
                    tableLink: chorus.helpers.linkTo(destinationTable.showUrl(), this.importConfiguration.get("toTable"))
                });
            }

            if (this.importConfiguration.has("executionInfo")) {
                var importStatusKey;
                if (this.importConfiguration.wasSuccessfullyExecuted()) {
                    importStatusKey = "import.last_imported";
                } else {
                    importStatusKey = "import.last_import_failed";
                    ctx.importFailed = true;
                }
                ctx.lastImport = chorus.helpers.safeT(importStatusKey, {
                    timeAgo: chorus.helpers.relativeTimestamp(this.importConfiguration.get("executionInfo").completedStamp),
                    tableLink: chorus.helpers.linkTo(destinationTable.showUrl(), this.importConfiguration.get("executionInfo").toTable)
                });
            }
        } else {
            var importInfo = this.resource.get("importInfo");
            if (importInfo && importInfo.sourceId) {
                var sourceTable = this.resource.lastImportSource();
                ctx.hasImport = true;
                ctx.lastImport = chorus.helpers.safeT("import.last_imported_into", {
                    timeAgo: chorus.helpers.relativeTimestamp(importInfo.completedStamp),
                    tableLink: chorus.helpers.linkTo(sourceTable.showUrl(), sourceTable.get("objectName"))
                });
            }
        }
        return ctx;
    },

    postRender: function() {
        this.$("a.create_schedule, a.edit_schedule, a.import_now").data("dataset", this.resource);
        this._super("postRender");
    },

    launchAddCredentialsDialog: function(e) {
        e && e.preventDefault();
        new chorus.dialogs.InstanceAccount({pageModel: this.resource.instance(), title: t("instances.sidebar.add_credentials"), reload: true}).launchModal();
    },

    launchAssociateWithWorkspaceDialog: function(e) {
        e.preventDefault();

        new chorus.dialogs.AssociateWithWorkspace({model: this.resource}).launchModal();
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
