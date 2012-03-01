chorus.views.TabularDataListSidebar = chorus.views.Sidebar.extend({
    constructorName: "TabularDataListSidebarView",
    className: "tabular_data_list_sidebar",

    events: {
        "click .no_credentials a.add_credentials": "launchAddCredentialsDialog"
    },

    subviews: {
        '.activity_list': 'activityList',
        '.tab_control': 'tabControl'
    },

    setup: function() {
        chorus.PageEvents.subscribe("tabularData:selected", this.setTabularData, this);
        chorus.PageEvents.subscribe("column:selected", this.setColumn, this);
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
                displayStyle: this.options.browsingSchema ? ['default'] : ['without_workspace']
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
        var ctx = {
            typeString: this.datasetType(this.resource),
            browsingSchema: this.options.browsingSchema
        }

        if (this.resource) {
            ctx.entityType = this.resource.entityType;

            if (this.resource.isImportable()) {
                ctx.isImportable = this.importConfiguration.loaded;
                ctx.hasImport = this.importConfiguration.has("id");
                if (ctx.hasImport) {
                    var destinationTable = new chorus.models.Dataset({
                        id: this.importConfiguration.get("destinationTable"),
                        workspaceId: this.resource.get("workspace").id
                    });
                    var tableLink = "<a href='" + destinationTable.showUrl() + "'>" + this.importConfiguration.get("toTable") + "</a>";
                    ctx.lastImport = t("import.last_imported", {
                        timeAgo: chorus.helpers.relativeTimestamp(this.importConfiguration.get("executionInfo").completedStamp),
                        tableLink: tableLink
                    });
                }
            }

            if (this.resource.get("hasCredentials") === false) {
                ctx.isImportable = false;
                ctx.noCredentials = true;
                ctx.noCredentialsWarning = t("dataset.credentials.missing.body", {linkText: chorus.helpers.linkTo("#", t("dataset.credentials.missing.linkText"), {'class': 'add_credentials'})})
            }

            if (this.resource.get("workspace")) {
                ctx.workspaceId = this.resource.get("workspace").id;
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

        return ctx;
    },

    postRender: function() {
        this.$("a.create_schedule, a.edit_schedule, a.import_now").data("dataset", this.resource);
        this.$("a.edit_schedule").data("import", this.importConfiguration);
        this._super("postRender");
    },

    launchAddCredentialsDialog: function(e) {
        e && e.preventDefault();
        new chorus.dialogs.InstanceAccount({pageModel: this.resource.instance(), title: t("instances.sidebar.add_credentials"), reload: true}).launchModal();
    },

    datasetType: function(tabularData) {
        if (!tabularData) { return ""; }

        var keys = ["dataset.types", tabularData.get("type")];
        if (tabularData.get("objectType")) { keys.push(tabularData.get("objectType")); }
        var key = keys.join(".");
        return t(key);
    }
});
