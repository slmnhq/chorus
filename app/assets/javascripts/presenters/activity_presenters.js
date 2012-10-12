;(function() {
    chorus.presenters.Activity = chorus.presenters.Base.extend({

        headerHtml: function() {
            var string = t(hidden.headerTranslationKey(this, this.isNotification()), hidden.headerParams(this));
            return new Handlebars.SafeString(string);
        },

        timestamp: function() {
            return chorus.helpers.relativeTimestamp(this.model.get("timestamp"));
        },

        iconSrc: function() {
            if (this.model.isFailure()) {
                return "/images/message_error.png";
            } else if (this.model.isSuccessfulImport()) {
                return "/images/import_icon.png";
            } else {
                return this.model.author().fetchImageUrl({ size: "icon" });
            }
        },

        iconHref: function() {
            if (this.model.isFailure()) {
                return null;
            } else if (this.model.isSuccessfulImport()) {
                return this.model.dataset().showUrl();
            } else {
                return this.model.author().showUrl();
            }
        },

        canBePromotedToInsight: function() {
            return this.model.canBePromotedToInsight();
        },

        isInsight: function() {
            return this.model.isInsight();
        },

        isUserGenerated: function() {
            return this.model.isUserGenerated();
        },

        hasCommitMessage: function() {
            return this.model.hasCommitMessage();
        },

        attachments: function() {
            return this.model.attachments().map(function (attachment) { return new chorus.presenters.Attachment(attachment); });
        },

        canEdit: function() {
            return this.model.isOwner();
        },

        isNote: function() {
            return this.model.get("action") == "NOTE";
        },

        canDelete: function() {
            return this.model.isOwner() || chorus.session.user().isAdmin();
        },

        canPublish: function() {
            return this.canDelete();
        },

        iconClass: function() {
            if (this.model.isFailure()) {
                return "error";
            } else if (this.model.isSuccessfulImport()) {
                return "icon";
            } else {
                return "profile";
            }
        },

        isNotification: function() {
            return this.options.isNotification || false;
        },

        isReadOnly: function() {
            return this.options.isReadOnly || false;
        },

        isFailure: function() {
            return this.model.isFailure();
        },

        id: function() {
            return this.model.id;
        },

        promotionDetails: function() {
            return chorus.helpers.safeT("insight.promoted_by", {
                promoterLink: this.model.promoterLink(),
                relativeTimestamp: this.model.promotionTimestamp()
            });
        }
    });

    function chorusViewSourceModel(self) {
        var object = self.model.get("sourceObject");
        var model;
        if (object.fileName) {
            model = new chorus.models.Workfile(object);
        } else {
            model = new chorus.models.WorkspaceDataset(object);
            var workspace = self.model.workspace();
            model.set({workspace: workspace});
        }
        return model;
    };

    var hidden = {

        headerParamOptions: {
            GreenplumInstanceChangedName: {
                links: [ "actor", "greenplumInstance" ],
                attrs: [ "newName", "oldName" ]
            },

            HadoopInstanceChangedName: {
                links: [ "actor", "hadoopInstance" ],
                attrs: [ "newName", "oldName" ]
            },

            GreenplumInstanceCreated: {
                links: [ "actor", "greenplumInstance" ]
            },

            GnipInstanceCreated: {
                links: [ "actor", "gnipInstance" ]
            },

            ProvisioningSuccess: {
                links: ["greenplumInstance"],
                computed: ["instanceAddress"]
            },

            ProvisioningFail: {
                computed: ["greenplumInstanceName"]
            },

            HadoopInstanceCreated: {
                links: [ "actor", "hadoopInstance" ]
            },

            GreenplumInstanceChangedOwner: {
                links: [ "actor", "greenplumInstance", "newOwner" ]
            },

            PublicWorkspaceCreated: {
                links: [ "actor", "workspace" ]
            },

            PrivateWorkspaceCreated: {
                links: [ "actor", "workspace" ]
            },

            WorkspaceMakePublic: {
                links: [ "actor", "workspace" ]
            },

            WorkspaceMakePrivate: {
                links: [ "actor", "workspace" ]
            },

            WorkspaceArchived: {
                links: [ "actor", "workspace" ]
            },

            WorkspaceUnarchived: {
                links: [ "actor", "workspace" ]
            },

            WorkfileCreated: {
                links: [ "actor", "workfile", "workspace" ]
            },

            WorkspaceAddSandbox: {
                links: [ "actor", "workspace" ]
            },

            SourceTableCreated: {
                links: [ "actor", "dataset", "workspace" ],
                computed: [ "datasetType" ]
            },

            UserAdded: {
                links: [ "newUser"]
            },

            WorkspaceAddHdfsAsExtTable: {
                links: [ "actor", "hdfsEntry", "workspace", "dataset"]
            },

            NOTE: {
                links: [ "actor", "noteObject", "workspace" ],
                computed: [ "noteObjectType" ]
            },

            FileImportCreated: {
                links: ["actor", "workspace", "dataset"],
                attrs: ["importType"],
                computed: ["importSourceLink", "datasetType", "destObjectOrName"]
            },

            FileImportSuccess: {
                links: ["workspace", "dataset"],
                attrs: ["importType"],
                computed: ["importSourceLink", "datasetType", "destObjectOrName"]
            },

            FileImportFailed: {
                links: ["workspace"],
                attrs: ["importType", "destinationTable"],
                computed: ["importSourceLink", "datasetType", "datasetLink"]
            },

            MembersAdded: {
                links: ["actor", "workspace", "member"],
                computed: ["count"]
            },

            DatasetImportCreated: {
                links: ["actor", "workspace", "dataset"],
                attrs: ["sourceTable"],
                computed: ["importSourceDatasetLink", "datasetType", "destObjectOrName"]
            },

            DatasetImportSuccess: {
                links: ["workspace", "dataset"],
                attrs: ["sourceTable"],
                computed: ["importSourceDatasetLink", "datasetType"]
            },

            DatasetImportFailed: {
                links: ["workspace"],
                attrs: ["sourceDataset"],
                computed: ["importSourceDatasetLink", "datasetType", "datasetLink"]
            },

            WorkfileUpgradedVersion: {
                links: [ "actor", "workfile", "workspace" ],
                computed: ["versionLink"]
            },

            ChorusViewCreated: {
                links: [ "actor", "workspace", "dataset"],
                computed: [ "chorusViewSourceLink", "chorusViewSourceType" ]
            },

            ChorusViewChanged: {
                links: ["actor", "workspace", "dataset"]
            },

            WorkspaceChangeName: {
                links: ["actor", "workspace"],
                computed: ["workspaceOldName"]
            },

            TableauWorkbookPublished: {
                links: ["actor", "dataset"],
                computed: ["datasetType", "tableauWorkbookLink", "tableauProjectLink"]
            },

            TableauWorkfileCreated: {
                links: ["actor", "workspace", "dataset", "workfile"],
                computed: ["datasetType"]
            },

            SUB_COMMENT: {
                links: ["author"]
            }

        },

        headerParams: function(self) {
            var model = self.model;
            var action = model.get("action");

            var params = {};
            var options = hidden.headerParamOptions[action];
            _.each(options.links, function(name) {
                var associatedModel = model[name]();
                params[name + "Link"] = hidden.modelLink(associatedModel);
            });

            _.each(options.attrs, function(name) {
                params[name] = model.get(name);
            });

            _.each(options.computed, function(name) {
                params[name] = hidden[name](self);
            });

            return params;
        },

        defaultStyle: function(self, isNotification) {
            if (self.get("action") == "MembersAdded") {
                if (isNotification == true) return "notification.default";

                switch(self.get("numAdded")) {
                    case "1":
                        return 'one.default';
                    case "2":
                        return 'two.default';
                    default:
                        return 'many.default';
                }
            } else if (self.workspace().id && self.get("actionType") != "NoteOnWorkspace") {
                return 'default';
            } else {
                return 'without_workspace';
            }
        },

        displayStyle: function(self, style, isNotification) {
            if (self.get("action") == "MembersAdded") {
                if (isNotification == true) return ("notification." + style);

                switch(self.get("numAdded")) {
                    case "1":
                        return ('one.' + style);
                    case "2":
                        return ('two.' + style);
                    default:
                        return ('many.' + style);
                }
            } else if (self.get("action").lastIndexOf("FileImport", 0) === 0 ||
                       self.get("action").lastIndexOf("DatasetImport", 0) === 0) {
                return "";
            } else {
                return style;
            }
        },

        headerTranslationKey: function(self, isNotification) {
            var mainKey = ["activity.header", self.model.get("action")].join(".");
            if (isNotification) {
                mainKey += ".notification";
            }
            var possibleStyles = _.compact(_.flatten([hidden.displayStyle(self.model, self.options.displayStyle, isNotification), hidden.defaultStyle(self.model, isNotification), 'default']));
            var key, n = possibleStyles.length;
                 for (var i = 0; i < n; i++) {
                     key = [mainKey, possibleStyles[i]].join(".");
                     if (I18n.lookup(key)) return key;
                 }
        },

        datasetType: function(self) {
            var type = self.model.dataset().metaType();
            return t("dataset.types." + type);
        },

        tableauWorkbookLink: function(self) {
            var workbookName = self.model.get("workbookName");
            var workbookUrl = self.model.get("workbookUrl");
           return "<a href='" + workbookUrl  + "' target='_blank'>" + workbookName + "</a>";
        },

        tableauProjectLink: function(self) {
            var projectName = self.model.get("projectName");
            var projectUrl = self.model.get("projectUrl");
            return "<a href='" + projectUrl  + "' target='_blank'>" + projectName + "</a>";
        },

        count: function(self)    {
          return self.model.get("numAdded");
        },

        noteObjectType: function(self) {
            var actionType = self.model.get("actionType");
            switch (actionType) {
                case "NoteOnGreenplumInstance":
                    return "Greenplum instance";
                case "NoteOnHadoopInstance":
                    return "Hadoop instance";
                case "NoteOnGnipInstance":
                    return "Gnip instance";
                case "NoteOnHdfsFile":
                    return "file";
                case "NoteOnWorkspace":
                    return "workspace";
                case "NoteOnDataset":
                case "NoteOnWorkspaceDataset":
                    return hidden.datasetType(self);
                default:
                    return "";
            }
        },

        importSourceLink: function(self) {
            return self.model.get("fileName");
        },

        importSourceDatasetLink: function(self) {
            var workspace = self.model.get("workspace")
            var dataset = self.model.get("sourceDataset");
            dataset.workspace = workspace;
            var dataset_model = new chorus.models.WorkspaceDataset(dataset);
            return dataset_model.showLink();
        },

        chorusViewSourceLink: function(self) {
            return chorusViewSourceModel(self).showLink();
        },

        chorusViewSourceType: function(self) {
            var model = chorusViewSourceModel(self);
            return model.get("fileName") ? "workfile" : chorusViewSourceModel(self).metaType();
        },

        versionLink: function(self) {
            var version_num = self.model.get("versionNum");
            var version_id = self.model.get("versionId");
            var workfile = self.model.get("workfile");
            var workfile_version = new chorus.models.Workfile({
                versionInfo: { id : version_id },
                id : workfile.id,
                workspace: workfile.workspace
            });
            return workfile_version.showLink(t("workfile.version_title", { versionNum: version_num }));
        },

        datasetLink: function(self) {
            return self.model.get("destinationTable");
        },

        destObjectOrName: function(self) {
            dataset = self.model["dataset"]();
            if (dataset.get("id")){
                return hidden.modelLink(dataset);
            }
            return self.model.get("destinationTable");
        },

        modelLink: function(model) {
            return chorus.helpers.linkTo(model.showUrl(), model.name());
        },

        instanceAddress: function(self) {
            return self.model.greenplumInstance().get("host")
        },

        greenplumInstanceName: function(self) {
            return self.model.greenplumInstance().get("name")
        },

        workspaceOldName: function(self) {
            return self.model.get("workspaceOldName")
        }
    };
})();
