chorus.presenters.DatasetSidebar = chorus.presenters.Base.extend({
    setup: function() {
        var keys = ["resource", "options", "importConfiguration"];
        _.each(keys, function(key) {
            this[key] = this.model[key];
        }, this);
    },

    makeContext: function() {
        var additionalContexts = ['resource', 'import', 'nextImport', 'lastImport', 'workspace']

        return _.reduce(additionalContexts,
            function(result, context) { return _.extend(result, this[context + "Context"]()) },
            this.initialContext(),
            this)
    },

    initialContext: function() {
        return _.extend({
            typeString: this.typeString()
        }, this.options);
    },

    typeString: function() {
        return Handlebars.helpers.humanizedDatasetType(this.resource && this.resource.attributes);
    },

    workspaceContext: function() {
        if (!this.resource || !this.resource.workspace()) { return {}; }

        return {
            canExport: this.canExport(),
            hasSandbox: this.hasSandbox(),
            workspaceId: this.workspaceId(),
            activeWorkspace: this.activeWorkspace(),
            isDeleteable: this.isDeleteable(),
            deleteMsgKey: this.deleteKey("deleteMsgKey"),
            deleteTextKey: this.deleteKey("deleteTextKey")
        }
    },

    deleteKey: function(target) {
        var keyTable = {
            "CHORUS_VIEW": {
                deleteMsgKey: "delete",
                deleteTextKey: "actions.delete"
            },
            "SOURCE_TABLE_VIEW":{
                deleteMsgKey: "disassociate_view",
                deleteTextKey: "actions.delete_association"
            },
            "SOURCE_TABLE":{
                deleteMsgKey: "disassociate_table",
                deleteTextKey: "actions.delete_association"
            }
        }

        var resourceType = this.resource && this.resource.get("type");
        var resourceObjectType = this.resource && this.resource.get("objectType");

        var rescue = {};
        rescue[target] = "";
        var deleteMsgKey = (keyTable[resourceType + "_" + resourceObjectType] || keyTable[resourceType] || rescue)[target]

        return deleteMsgKey || "";
    },

    isDeleteable: function() {
        return this.hasWorkspace() && this.resource.isDeleteable() && this.resource.workspace().canUpdate();
    },

    workspaceId: function() {
        return this.hasWorkspace() && this.resource.workspace().id;
    },

    hasSandbox: function() {
        return this.hasWorkspace() && this.resource.workspace().sandbox();
    },

    hasWorkspace: function() {
        return this.resource && this.resource.workspace();
    },

    activeWorkspace: function() {
        return this.hasWorkspace() && this.resource.workspace().isActive();
    },

    importContext: function() {
        var ctx = {};
        if (!this.resource || !this.resource.canBeImportSourceOrDestination()) { return ctx; }

        var importConfig = this.importConfiguration;
        ctx.isImportConfigLoaded = this.resource.isImportConfigLoaded();
        ctx.hasSchedule = importConfig.hasActiveSchedule();
        ctx.hasImport = this.hasImport();

        return ctx;
    },

    nextImportContext: function() {
        var ctx = {};
        if (!this.hasImport() || !this.importConfiguration.hasNextImport()) { return ctx; }

        var destination = this.importConfiguration.nextDestination();
        var runsAt = chorus.helpers.relativeTimestamp(this.importConfiguration.nextExecutionAt())
        ctx.nextImport = chorus.helpers.safeT("import.next_import", { nextTime: runsAt, tableLink: this._linkToModel(destination) });

        return ctx;
    },

    lastImportContext: function() {
        var ctx = {};
        var importConfig = this.importConfiguration;

        if (!importConfig || (!this.hasImport() && !importConfig.hasLastImport())) { return ctx; }

        if (importConfig.thisDatasetIsSource()) {
            var destination = importConfig.lastDestination();
            if (importConfig.isInProgress()) {
                var ranAt = chorus.helpers.relativeTimestamp(importConfig.get("executionInfo").startedStamp);
                ctx.lastImport = chorus.helpers.safeT("import.began", { timeAgo: ranAt });
                ctx.inProgressText = chorus.helpers.safeT("import.in_progress", { tableLink: this._linkToModel(destination) });
                ctx.importInProgress = true;
            } else if (importConfig.hasLastImport()) {
                var ranAt = chorus.helpers.relativeTimestamp(importConfig.lastExecutionAt());

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
            var tableLink = (importConfig.get("sourceType") === "upload_file") ?
                chorus.helpers.spanFor(this.ellipsize(source.name()), { 'class': "source_file", title: source.name() }) :
                this._linkToModel(source)

            var ranAt = chorus.helpers.relativeTimestamp(importConfig.lastExecutionAt());
            ctx.lastImport = chorus.helpers.safeT("import.last_imported_into", { timeAgo: ranAt, tableLink: tableLink });
        }

        return ctx;
    },

    resourceContext: function() {
        var ctx = {};
        if (!this.resource) { return ctx; }

        if (this.noCredentials()) {
            ctx.noCredentials = this.noCredentials();
            ctx.noCredentialsWarning = this.noCredentialsWarning();
        }

        ctx.displayEntityType = this.displayEntityType();
        ctx.isChorusView = this.isChorusView();
        ctx.canAnalyze = this.canAnalyze();
        return ctx;
    },

    noCredentialsWarning: function() {
        var addCredentialsLink = chorus.helpers.linkTo("#", t("dataset.credentials.missing.linkText"), {'class': 'add_credentials'});
        var instanceName = this.resource.instance().name();
        return  chorus.helpers.safeT("dataset.credentials.missing.body", {linkText: addCredentialsLink, instanceName: instanceName });
    },

    noCredentials: function() {
        return !this.resource.hasCredentials();
    },

    isChorusView: function() {
        return this.resource.isChorusView();
    },

    displayEntityType: function() {
        return this.resource.metaType();
    },

    workspaceArchived: function() {
        //TODO: put this on the model
        return this.resource && this.resource.workspace() && !this.resource.workspace().isActive();
    },

    canAnalyze: function() {
        //TODO: put this on the model
        return this.resource.hasCredentials() && this.resource.canAnalyze() && !this.workspaceArchived();
    },

    hasImport: function() {
        return this.resource && this.resource.hasImport();
    },

    canExport: function canExport() {
        return this.resource && this.resource.canExport();
    },

    // TODO: This is a foreign function... belongs in helpers? or on chorus?
    _linkToModel: function(model) {
        return chorus.helpers.linkTo(model.showUrl(), this.ellipsize(model.name()), {title: model.name()});
    },

    ellipsize: function (name) {
        if (!name) return "";
        var length = 15;
        return (name.length < length) ? name : name.slice(0, length-3).trim() + "...";
    }
});
