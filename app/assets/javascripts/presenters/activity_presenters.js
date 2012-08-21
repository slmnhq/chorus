;(function() {
    chorus.presenters.Activity = chorus.presenters.Base.extend({

        headerHtml: function() {
            var string = t(hidden.headerTranslationKey(this), hidden.headerParams(this));
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
                return this.model.actor().fetchImageUrl({ size: "icon" });
            }
        },

        iconHref: function() {
            if (this.model.isFailure()) {
                return null;
            } else if (this.model.isSuccessfulImport()) {
                return this.model.dataset().showUrl();
            } else {
                return this.model.actor().showUrl();
            }
        },

        isUserGenerated: function() {
            return this.model.isUserGenerated();
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
        }
    });

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

            FileImportSuccess: {
                links: ["workspace", "dataset"],
                attrs: ["importType"],
                computed: ["importSourceLink", "datasetType"]
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

            DatasetImportSuccess: {
                links: ["workspace", "dataset"],
                attrs: ["sourceTable"],
                computed: ["importSourceDatasetLink", "datasetType"]
            },

            DatasetImportFailed: {
                links: ["workspace"],
                attrs: ["sourceTable"],
                computed: ["importSourceDatasetLink", "datasetType", "datasetLink"]
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

        defaultStyle: function(self) {
            if (self.get("action") == "MembersAdded") {
                switch(self.get("numAdded")) {
                    case "1":
                        return 'default.one';
                    case "2":
                        return 'default.two';
                    default:
                        return 'default.many';
                }
            } else if (self.workspace().id && self.get("actionType") != "NOTE_ON_WORKSPACE") {
                return 'default';
            } else {
                return 'without_workspace';
            }
        },

        displayStyle: function(self, style) {
            if (self.get("action") == "MembersAdded") {
                switch(self.get("numAdded")) {
                    case "1":
                        return (style + '.one');
                    case "2":
                        return (style + '.two');
                    default:
                        return (style + '.many');
                }
            } else {
                return style;
            }
        },

        headerTranslationKey: function(self) {
            var mainKey = ["activity.header", self.model.get("action")].join(".");
            var possibleStyles = _.compact(_.flatten([hidden.displayStyle(self.model, self.options.displayStyle), hidden.defaultStyle(self.model), 'default']));

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

        count: function(self) {
          return self.model.get("numAdded");
        },

        noteObjectType: function(self) {
            var actionType = self.model.get("actionType");
            switch (actionType) {
                case "NOTE_ON_GREENPLUM_INSTANCE":
                    return "Greenplum instance";
                case "NOTE_ON_HADOOP_INSTANCE":
                    return "Hadoop instance";
                case "NOTE_ON_HDFS_FILE":
                    return "file";
                case "NOTE_ON_WORKSPACE":
                    return "workspace";
                case "NOTE_ON_DATASET":
                case "NOTE_ON_WORKSPACE_DATASET":
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

        datasetLink: function(self) {
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
        }
    };
})();
