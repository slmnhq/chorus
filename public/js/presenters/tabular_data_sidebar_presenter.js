chorus.presenters.TabularDataSidebar = function(sidebar) {
    var keys = ["resource", "statistics", "options", "selectedColumn", "importConfiguration"];
    _.each(keys, function(key) {
        this[key] = sidebar[key];
    }, this);

    return this.makeContext();
}

_.extend(chorus.presenters.TabularDataSidebar.prototype, {
    makeContext: function() {
        var ctx = this.applyInitialContext();
        this.applyResourceContext(ctx);
        this.applyImportContext(ctx);
        this.applyNextImportContext(ctx);
        this.applyLastImportContext(ctx);
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

    applyImportContext: function(ctx) {
        if (!this.resource || !this.resource.canBeImportSourceOrDestination()) { return ctx; }

        var importConfig = this.importConfiguration;
        ctx.isImportConfigLoaded = importConfig.loaded;
        ctx.hasSchedule = importConfig.hasActiveSchedule();
        ctx.hasImport = importConfig.has("id");

        return ctx;
    },

    applyNextImportContext: function(ctx) {
        var importConfig = this.importConfiguration;

        if (!ctx.hasImport || !importConfig.hasNextImport()) { return ctx; }

        var destination = importConfig.nextDestination();
        var runsAt = chorus.helpers.relativeTimestamp(importConfig.nextExecutionAt())
        ctx.nextImport = chorus.helpers.safeT("import.next_import", { nextTime: runsAt, tableLink: this._linkToModel(destination) });

        return ctx;
    },

    applyLastImportContext: function(ctx) {
        var importConfig = this.importConfiguration;

        if (!ctx.hasImport || !importConfig.hasLastImport()) { return ctx; }

        var ranAt = chorus.helpers.relativeTimestamp(importConfig.lastExecutionAt());

        if (importConfig.thisDatasetIsSource()) {
            var destination = importConfig.lastDestination();
            if (importConfig.isInProgress()) {
                ctx.lastImport = chorus.helpers.safeT("import.began", { timeAgo: ranAt });
                ctx.inProgressText = chorus.helpers.safeT("import.in_progress", { tableLink: this._linkToModel(destination) });
                ctx.importInProgress = true;
            } else {
                var importStatusKey;
                if (importConfig.wasSuccessfullyExecuted()) {
                    importStatusKey = "import.last_imported";
                } else {
                    importStatusKey = "import.last_import_failed";
                    ctx.importFailed = true;
                }

                ctx.lastImport = chorus.helpers.safeT(importStatusKey, { timeAgo: ranAt, tableLink: this._linkToModel(destination) });
            }
        } else if (importConfig.thisDatasetIsDestination()) {
            var source = importConfig.importSource();
            ctx.lastImport = chorus.helpers.safeT("import.last_imported_into", { timeAgo: ranAt, tableLink: this._linkToModel(source) });
        }

        return ctx;
    },

    applyResourceContext: function(ctx) {
        if (!this.resource) {
            return;
        }

        ctx.entityType = this.resource.entityType;

        if (this.resource.get("hasCredentials") === false) {
            ctx.noCredentials = true;
            ctx.noCredentialsWarning = chorus.helpers.safeT("dataset.credentials.missing.body", {linkText: chorus.helpers.linkTo("#", t("dataset.credentials.missing.linkText"), {'class': 'add_credentials'})})
        }

        ctx.displayEntityType = this.resource.metaType();
    },

    // TODO: This is a foreign function... belongs in helpers? or on chorus?
    _linkToModel: function (model) {
        return chorus.helpers.linkTo(model.showUrl(), ellipsize(model.name()), {title: model.name()});

        function ellipsize(name) {
            if (!name) return "";
            var length = 15;
            return (name.length < length) ? name : name.slice(0, length) + "...";
        }
    }
});
