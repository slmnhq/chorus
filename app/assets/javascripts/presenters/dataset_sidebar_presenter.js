chorus.presenters.DatasetSidebar = chorus.presenters.Base.extend({
    setup: function() {
        _.each(this.options, function(value, key) {
           this[key] = value;
        }, this);
    },

    typeString: function() {
        return Handlebars.helpers.humanizedDatasetType(this.resource && this.resource.attributes, this.resource && this.resource.statistics().attributes);
    },

    deleteMsgKey: function() {
        return this.deleteKey("deleteMsgKey");
    },

    deleteTextKey: function() {
        return this.deleteKey("deleteTextKey");
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

    isImportConfigLoaded: function() {
        return this.resource && this.resource.isImportConfigLoaded();
    },

    hasSchedule: function() {
        return this.resource && this.resource.canBeImportSourceOrDestination() && this.resource.getImport().hasActiveSchedule();
    },

    nextImport: function() {
        if(!this.resource || !this.resource.nextImportDestination()) return "";

        next_time = this.resource.importRunsAt();
        if(this.resource.nextImportDestination().get("id") == null) {
            return chorus.helpers.safeT("import.next_import", {
                nextTime: next_time,
                tableRef: this.ellipsize(this.resource.nextImportDestination().get("objectName"))
            });
        }

        return chorus.helpers.safeT("import.next_import", {
            nextTime: next_time,
            tableRef: this._linkToModel(this.resource.nextImportDestination())
        });
    },

    inProgressText: function() {
        var lastDestination = this.resource && this.resource.lastImportDestination();

        if(!lastDestination) return "";

        return chorus.helpers.safeT("import.in_progress", { tableLink: this._linkToModel(lastDestination) });
    },

    importInProgress: function() {
        var importConfig = this.resource && this.resource.getImport();

        return importConfig && importConfig.thisDatasetIsSource() && importConfig.isInProgress();
    },

    importFailed: function() {
        var importConfig = this.resource && this.resource.getImport();

        return importConfig && importConfig.hasLastImport() && !this.importInProgress() && !importConfig.wasSuccessfullyExecuted();
    },

    lastImport: function() {
        var importConfig = this.resource && this.resource.getImport();

        if (!importConfig || (!this.hasImport() && !importConfig.hasLastImport())) return "";

        var lastImport;
        if (importConfig.thisDatasetIsSource()) {
            var destination = importConfig.lastDestination();
            if (importConfig.isInProgress()) {
                var ranAt = chorus.helpers.relativeTimestamp(importConfig.get("executionInfo").startedStamp);
                lastImport = chorus.helpers.safeT("import.began", { timeAgo: ranAt });
            } else if (importConfig.hasLastImport()) {
                var ranAt = chorus.helpers.relativeTimestamp(importConfig.lastExecutionAt());

                var importStatusKey;
                if (importConfig.wasSuccessfullyExecuted()) {
                    importStatusKey = "import.last_imported";
                } else {
                    importStatusKey = "import.last_import_failed";
                }

                lastImport = chorus.helpers.safeT(importStatusKey, { timeAgo: ranAt, tableLink: this._linkToModel(destination) });
            }
        } else if (importConfig.thisDatasetIsDestination()) {
            var source = importConfig.importSource();
            var tableLink = (importConfig.get("sourceType") === "upload_file") ?
                chorus.helpers.spanFor(this.ellipsize(source.name()), { 'class': "source_file", title: source.name() }) :
                this._linkToModel(source)

            var ranAt = chorus.helpers.relativeTimestamp(importConfig.lastExecutionAt());
            lastImport = chorus.helpers.safeT("import.last_imported_into", { timeAgo: ranAt, tableLink: tableLink });
        }

        return lastImport;
    },

    noCredentialsWarning: function() {
        if(!this.resource) {
            return ""
        }

        var addCredentialsLink = chorus.helpers.linkTo("#", t("dataset.credentials.missing.linkText"), {'class': 'add_credentials'});
        var instanceName = this.resource.instance().name();
        return chorus.helpers.safeT("dataset.credentials.missing.body", {linkText: addCredentialsLink, instanceName: instanceName });
    },

    noCredentials: function() {
        return this.resource ? !this.resource.hasCredentials() : "";
    },

    isChorusView: function() {
        return this.resource ? this.resource.isChorusView() : "";
    },

    displayEntityType: function() {
        return this.resource ? this.resource.metaType() : "";
    },

    workspaceArchived: function() {
        return this.resource && this.resource.workspaceArchived();
    },

    canAnalyze: function() {
        return this.resource && this.resource.canAnalyze();
    },

    hasImport: function() {
        return this.resource && this.resource.hasImport();
    },

    canExport: function canExport() {
        return this.resource && this.resource.canExport();
    },

    _linkToModel: function(model) {
        return chorus.helpers.linkTo(model.showUrl(), this.ellipsize(model.name()), {title: model.name()});
    },

    ellipsize: function (name) {
        if (!name) return "";
        var length = 15;
        return (name.length < length) ? name : name.slice(0, length-3).trim() + "...";
    }
});
