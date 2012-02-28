(function() {
    var imageRegex = /^image\//;
    var textRegex = /^text\//;

    chorus.models.Workfile = chorus.models.Base.extend({
        constructorName: "Workfile",
        entityType:"workfile",

        urlTemplate: function() {
            if (this.isLatestVersion()) {
                return "workspace/{{workspaceId}}/workfile/{{id}}"
            } else {
                return "workspace/{{workspaceId}}/workfile/{{id}}/version/{{versionInfo.versionNum}}"
            }
        },

        showUrlTemplate: function() {
            if (this.isLatestVersion()) {
                return "workspaces/{{workspaceId}}/workfiles/{{id}}"
            } else {
                return "workspaces/{{workspaceId}}/workfiles/{{id}}/versions/{{versionInfo.versionNum}}"
            }
        },

        showUrlForVersion: function(version) {
            return "#/workspaces/" + this.get("workspaceId") + "/workfiles/" + this.get("id") + "/versions/" + version;
        },

        initialize: function() {
            if (this.collection && this.collection.attributes && this.collection.attributes.workspaceId) {
                this.set({workspaceId:this.collection.attributes.workspaceId}, {silent:true});
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

        sandbox: function() {
            return this.workspace().sandbox()
        },

        executionSchema: function() {
            var executionInfo = this.get("executionInfo");
            if (executionInfo && executionInfo.schemaName) {
                return new chorus.models.Schema({
                    instanceId:executionInfo.instanceId,
                    instanceName:executionInfo.instanceName,
                    databaseId:executionInfo.databaseId,
                    databaseName:executionInfo.databaseName,
                    id:executionInfo.schemaId,
                    name:executionInfo.schemaName
                });
            } else {
                return this.sandbox() && this.sandbox().schema();
            }
        },

        modifier: function() {
            return new chorus.models.User({
                userName:this.get("modifiedBy").userName,
                firstName:this.get("modifiedBy").firstName,
                lastName:this.get("modifiedBy").lastName,
                id:this.get("modifiedBy").id
            })
        },

        content: function(newContent, options) {
            if (arguments.length) {
                this.get("versionInfo").content = newContent;
                this.set({content:newContent}, options);
            } else {
                return this.get("versionInfo").content;
            }
        },

        lastComment: function() {
            var comments = this.get("recentComments");
            return comments && comments.length > 0 && new chorus.models.Comment({
                body:comments[0].text,
                author:comments[0].author,
                commentCreatedStamp:comments[0].timestamp
            });
        },

        createDraft: function() {
            var draft = new chorus.models.Draft({workfileId:this.get("id"), workspaceId:this.get("workspaceId"), content:this.content()});
            draft.bind("saved", function() {
                this.isDraft = true;
                this.set({ hasDraft:true }, { silent:true });
            }, this);
            return draft;
        },

        allVersions: function() {
            return new chorus.collections.WorkfileVersionSet([], {
                workspaceId:this.get("workspaceId"),
                workfileId:this.get("id")
            });
        },

        declareValidations: function(newAttrs) {
            this.require("fileName", newAttrs);
        },

        attrToLabel:{
            "fileName":"workfiles.validation.name"
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

        downloadUrl: function() {
            var url = URI(this.url())
            var path = url.path() + "/file/";
            if (this.get("hasDraft")) {
                path += this.get("draftInfo").draftFileId;
            } else if (this.get("versionInfo")) {
                path += this.get("versionInfo").versionFileId;
            }
            url.path(path)
            url.addSearch({ download: "true" })
            return url.toString();
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
                method:'create',
                url:"/edc/workspace/" + this.get("workspaceId") + "/workfile/" + this.get("id") + "/version"
            };

            return this._super("save", [attrs, _.extend(options, overrides)])
        },

        linkUrl: function(options) {
            if (this.isText() || this.isImage()) {
                if (options && options.version) {
                    return this.showUrlForVersion(options.version);
                } else {
                    return this.showUrl();
                }
            } else {
                return this.downloadUrl();
            }
        },

        iconUrl: function(options) {
            var fileExtension = this.get("fileType") || this.get('type');
            return chorus.urlHelpers.fileIconUrl(fileExtension, options && options.size);
        },

        hasOwnPage: function() {
            if(this.isImage() || this.isText()) {
                return true;
            }
            return false;
        }
    });
})();
