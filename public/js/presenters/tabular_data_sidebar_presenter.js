chorus.presenters.TabularDataSidebar = function(sidebar) {
    var keys = ["resource", "statistics", "options", "selectedColumn", "importConfiguration"];
    _.each(keys, function(key){
        this[key] = sidebar[key];
    }, this);

    return this.makeContext();
}

_.extend(chorus.presenters.TabularDataSidebar.prototype, {
    makeContext: function() {
        var ctx = this.applyInitialContext();
        this.applyResourceContext(ctx);
        this.applyStatisticsContext(ctx);
        this.applyColumnContext(ctx);
        this.applyWorkspaceContext(ctx);

        return ctx;
    },

    applyInitialContext: function() {
        return _.extend({
            typeString: Handlebars.helpers.humanizedTabularDataType(this.resource && this.resource.attributes)
        }, this.options);
    },

    applyStatisticsContext: function(ctx) {
        if (this.statistics) {
            ctx.statistics = this.statistics.attributes;
            if (ctx.statistics.rows === 0) {
                ctx.statistics.rows = "0"
            }

            if (ctx.statistics.columns === 0) {
                ctx.statistics.columns = "0"
            }
        }
    },

    applyColumnContext: function(ctx) {
        if (this.selectedColumn) {
            ctx.column = this.selectedColumn.attributes;
        }
    },

    applyWorkspaceContext: function(ctx) {
        if (this.options.workspace) {
            ctx.canExport = this.options.workspace.canUpdate() && !ctx.noCredentials && ctx.isImportConfigLoaded && this.resource.canBeImportSource();
            ctx.hasSandbox = this.options.workspace.sandbox();
            ctx.workspaceId = this.options.workspace.id;
            ctx.isDeleteable = this.resource && this.resource.isDeleteable() && this.options.workspace.canUpdate();

            ctx.activeWorkspace = this.options.workspace.get("active");

            if (this.resource) {
                if (this.resource.get("type") == "CHORUS_VIEW") {
                    ctx.deleteMsgKey = "delete";
                    ctx.deleteTextKey = "actions.delete";
                } else if (this.resource.get("type") == "SOURCE_TABLE") {
                    if (this.resource.get("objectType") == "VIEW") {
                        ctx.deleteMsgKey = "disassociate_view";
                        ctx.deleteTextKey = "actions.delete_association";
                    } else {
                        ctx.deleteMsgKey = "disassociate_table";
                        ctx.deleteTextKey = "actions.delete_association";
                    }
                }
            }
        }
    },

    applyResourceContext: function(ctx) {
        if (!this.resource) {
            return;
        }

        ctx.entityType = this.resource.entityType;

        if (this.resource.canBeImportSourceOrDestination()) {
            ctx.isImportConfigLoaded = this.importConfiguration.loaded;
            ctx.hasSchedule = this.importConfiguration.hasActiveSchedule();
            ctx.hasImport = this.importConfiguration.has("id");

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

            if (this.resource.id == this.importConfiguration.get("sourceId")) {
                if (this.importConfiguration.has("executionInfo")) {
                    var importStatusKey;
                    var toTable = this.importConfiguration.get("executionInfo").toTable;
                    if (this.importConfiguration.wasSuccessfullyExecuted()) {
                        importStatusKey = "import.last_imported";
                    } else {
                        importStatusKey = "import.last_import_failed";
                        ctx.importFailed = true;
                    }

                    ctx.lastImport = chorus.helpers.safeT(importStatusKey, {
                        timeAgo: chorus.helpers.relativeTimestamp(this.importConfiguration.get("executionInfo").completedStamp),
                        tableLink: chorus.helpers.linkTo(destinationTable.showUrl(), ellipsize(toTable), {title: toTable})
                    });

                    if (this.importConfiguration.isInProgress()) {
                        ctx.lastImport = chorus.helpers.safeT("import.began", {
                            timeAgo: chorus.helpers.relativeTimestamp(this.importConfiguration.get("executionInfo").completedStamp)
                        });
                        ctx.inProgressText = chorus.helpers.safeT("import.in_progress", {
                            tableLink: chorus.helpers.linkTo(destinationTable.showUrl(),
                                ellipsize(toTable), {title: toTable})
                        });
                        ctx.importInProgress = true;
                    }
                }
            } else {
                if (this.importConfiguration && this.importConfiguration.get("sourceId")) {
                    var sourceTable = new chorus.models.Dataset({id: this.importConfiguration.get("sourceId"), workspaceId: this.importConfiguration.get("workspaceId")});
                    var tableName = this.importConfiguration.get("sourceTable");
                    ctx.lastImport = chorus.helpers.safeT("import.last_imported_into", {
                        timeAgo: chorus.helpers.relativeTimestamp(this.importConfiguration.get("executionInfo").completedStamp),
                        tableLink: chorus.helpers.linkTo(sourceTable.showUrl(), ellipsize(tableName), {title: tableName})
                    });
                }
            }
        }

        if (this.resource.get("hasCredentials") === false) {
            ctx.noCredentials = true;
            ctx.noCredentialsWarning = chorus.helpers.safeT("dataset.credentials.missing.body", {linkText: chorus.helpers.linkTo("#", t("dataset.credentials.missing.linkText"), {'class': 'add_credentials'})})
        }

        ctx.displayEntityType = this.resource.metaType();

        function ellipsize(name) {
            if (!name) return "";
            var length = 15;
            return (name.length < length) ? name : name.slice(0, length) + "...";
        }
    }
});
