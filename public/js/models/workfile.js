(function() {
    var imageRegex = /^image\//;
    var textRegex = /^text\//;

    chorus.models.Workfile = chorus.models.Base.extend({
        constructorName: "Workfile",
        entityType: "workfile",
        nameAttribute: 'fileName',

        urlTemplate: function() {
            if(this.isNew()) {
                return "workspace/{{workspaceId}}/workfile";
            }
            if (this.isLatestVersion()) {
                return "workspace/{{workspaceId}}/workfile/{{id}}"
            } else {
                return "workspace/{{workspaceId}}/workfile/{{id}}/version/{{versionInfo.versionNum}}"
            }
        },

        showUrlTemplate: function(options) {
            options || (options = {});
            if (this.isLatestVersion() && !options.version) {
                return "workspaces/{{workspaceId}}/workfiles/{{id}}"
            } else {
                var version = options.version || this.get('versionInfo').versionNum;
                return "workspaces/{{workspaceId}}/workfiles/{{id}}/versions/" + version;
            }
        },

        showUrl: function() {
           if (this.hasOwnPage()) {
               return this._super("showUrl", arguments);
           } else {
               return this.downloadUrl();
           }
        },

        initialize: function() {
            if (this.collection && this.collection.attributes && this.collection.attributes.workspaceId) {
                this.set({workspaceId: this.collection.attributes.workspaceId}, {silent: true});
            }

            if (!this.get("workspaceId") && this.get("workspace") && this.get("workspace").id) {
                this.set({workspaceId: this.get("workspace").id})
            }
        },

        workspace: function() {
            var workspaceAttrs = this.get("workspace") || { id: this.get("workspaceId") };
            this._workspace = (this._workspace || new chorus.models.Workspace(workspaceAttrs));
            return this._workspace;
        },

        setWorkspace: function(workspace) {
            this.set({workspaceId: workspace.get("id")});
        },

        sandbox: function() {
            return this.workspace().sandbox()
        },

        executionSchema: function() {
            var executionInfo = this.get("executionInfo");
            if (executionInfo && executionInfo.schemaName) {
                return new chorus.models.Schema({
                    instanceId: executionInfo.instanceId,
                    instanceName: executionInfo.instanceName,
                    databaseId: executionInfo.databaseId,
                    databaseName: executionInfo.databaseName,
                    id: executionInfo.schemaId,
                    name: executionInfo.schemaName
                });
            } else {
                return this.sandbox() && this.sandbox().schema();
            }
        },

        modifier: function() {
            return new chorus.models.User({
                firstName: this.get("modifiedBy").firstName,
                lastName: this.get("modifiedBy").lastName,
                id: this.get("modifiedBy").id
            })
        },

        content: function(newContent, options) {
            if (arguments.length) {
                this.get("versionInfo").content = newContent;
                this.set({content: newContent}, options);
            } else {
                return this.get("versionInfo").content;
            }
        },

        lastComment: function() {
            var comments = this.get("recentComments");
            return comments && comments.length > 0 && new chorus.models.Comment({
                body: comments[0].text,
                author: comments[0].author,
                commentCreatedStamp: comments[0].timestamp
            });
        },

        createDraft: function() {
            var draft = new chorus.models.Draft({workfileId: this.get("id"), workspaceId: this.get("workspaceId"), content: this.content()});
            draft.bind("saved", function() {
                this.isDraft = true;
                this.set({ hasDraft: true }, { silent: true });
            }, this);
            return draft;
        },

        allVersions: function() {
            return new chorus.collections.WorkfileVersionSet([], {
                workspaceId: this.get("workspaceId"),
                workfileId: this.get("id")
            });
        },

        declareValidations: function(newAttrs) {
            this.require("fileName", newAttrs);
        },

        attrToLabel: {
            "fileName": "workfiles.validation.name"
        },

        isImage: function() {
            var type = this.get("mimeType");
            return type && type.match(imageRegex);
        },

        isSql: function() {
            var type = this.get("fileType");
            return type == "SQL";
        },

        isText: function() {
            var type = this.get("mimeType");
            return type && type.match(textRegex);
        },

        isAlpine: function() {
            var fileName = this.get("fileName") || this.get("name")
            return fileName && _.str.endsWith(fileName.toLowerCase(), ".afm")
        },

        downloadUrl: function() {
            var url = URI(this.url())
            var path = url.path() + "/file/";

            if (this.get("hasDraft")) {
                path += this.get("draftInfo").draftFileId;
                url.path(path)
            } else if (this.get("versionInfo")) {
                url = URI("/edc/workspace/" + this.get("workspaceId") + "/workfile/" + this.id + "/file/" + this.get("versionInfo").versionFileId);
            } else {
                url.path(path)
            }

            url.addSearch({ download: "true" })
            url.addSearch({iebuster: window.jasmine ? 12345 : new Date().getTime()});

            return url.normalizeSearch().toString();
        },

        workfilesUrl: function() {
            return "#/workspaces/" + this.get("workspaceId") + "/workfiles";
        },

        canEdit: function() {
            return this.isLatestVersion();
        },

        isLatestVersion: function() {
            var versionNum = this.get('versionInfo') && this.get('versionInfo').versionNum;
            return (!versionNum || versionNum === this.get("latestVersionNum"))
        },

        save: function(attrs, options) {
            if (this.canEdit()) {
                options = options || {};
                attrs = attrs || {};
                var overrides = {};

                if (this.get("versionInfo") && this.get("versionInfo").versionNum) {
                    overrides.url = "/edc/workspace/" + this.get("workspaceId") + "/workfile/" + this.get("id") + "/version/" + this.get("versionInfo").versionNum;
                    attrs['lastUpdatedStamp'] = this.get("versionInfo").lastUpdatedStamp;
                }

                return this._super("save", [attrs, _.extend(options, overrides)]);
            }
        },

        saveAsNewVersion: function(attrs, options) {
            options = options || {};

            var overrides = {
                method: 'create',
                url: "/edc/workspace/" + this.get("workspaceId") + "/workfile/" + this.get("id") + "/version"
            };

            return this._super("save", [attrs, _.extend(options, overrides)])
        },

        iconUrl: function(options) {
            return chorus.urlHelpers.fileIconUrl(this.fileExtension(), options && options.size);
        },

        fileExtension: function () {
            if (this.isAlpine()) { return 'afm'; }
            return this.get("fileType") || this.get('type');
        },

        hasOwnPage: function() {
            return (this.isText() || this.isImage() || this.isAlpine())
        },

        diskPath: function() {
            return chorus.workfileDir + "/" +  this.workspace().id + "/" + this.get("versionInfo").versionFileId;
        }
    });
})();
