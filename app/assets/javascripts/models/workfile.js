(function() {
    var imageRegex = /^image\//;
    var textRegex = /^text\//;
    var extensionRegex = /\.([^\.]+)$/;
    var IMAGE = 'image';
    var SQL = 'sql';
    var CODE = 'code';
    var TEXT = 'text';
    var ALPINE = 'alpine';
    var OTHER = 'other';

    chorus.models.Workfile = chorus.models.Base.extend({
        constructorName: "Workfile",
        nameAttribute: 'fileName',

        urlTemplate: function(options) {
            var method = options && options.method;

            if(this.isNew()) {
                return "workspaces/{{workspace.id}}/workfiles";
            }

            if (this.isLatestVersion()) {
                return "workfiles/{{id}}";
            } else {
                return "workfiles/{{id}}/versions/{{versionInfo.id}}";
            }
        },

        showUrlTemplate: function(options) {
            options || (options = {});
            if (this.isLatestVersion() && !options.version) {
                return "workspaces/{{workspace.id}}/workfiles/{{id}}"
            } else {
                var version = options.version || this.get('versionInfo').versionNum;
                return "workspaces/{{workspace.id}}/workfiles/{{id}}/versions/" + version;
            }
        },

        initialize: function() {
            if (this.collection && this.collection.attributes && this.collection.attributes.workspaceId) {
                this.set({workspace: { id: this.collection.attributes.workspaceId}}, {silent: true});
            }
        },

        workspace: function() {
            this._workspace = (this._workspace || new chorus.models.Workspace(this.get("workspace")));
            return this._workspace;
        },

        setWorkspace: function(workspace) {
            this.workspace().set({id: workspace.id});
        },

        sandbox: function() {
            return this.workspace().sandbox()
        },

        executionSchema: function() {
            var executionInfo = this.get("executionInfo");
            if (executionInfo && executionInfo.schemaName) {
                return new chorus.models.Schema({
                    id: executionInfo.schemaId,
                    name: executionInfo.schemaName,
                    database: {
                        id: executionInfo.databaseId,
                        name: executionInfo.databaseName,
                        instance: {
                            id: executionInfo.instanceId,
                            name: executionInfo.instanceName
                        }
                    }
                });
            } else {
                return this.sandbox() && this.sandbox().schema();
            }
        },

        modifier: function() {
            return new chorus.models.User(this.get("versionInfo") && this.get("versionInfo").modifier);
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
            var commentsJson = this.get("recentComments");
            if (commentsJson && commentsJson.length > 0) {
                var comment = new chorus.models.Comment({
                    body: commentsJson[0].text,
                    author: commentsJson[0].author,
                    commentCreatedStamp: commentsJson[0].timestamp
                });

                comment.loaded = true;
                return comment;
            }
        },

        createDraft: function() {
            var draft = new chorus.models.Draft({workfileId: this.get("id"), workspaceId: this.workspace().id, content: this.content()});
            draft.bind("saved", function() {
                this.isDraft = true;
                this.set({ hasDraft: true }, { silent: true });
            }, this);
            return draft;
        },

        allVersions: function() {
            return new chorus.collections.WorkfileVersionSet([], {
                workspaceId: this.workspace().id,
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
            return this.get("fileType") == IMAGE;
        },

        isSql: function() {
            return this.get("fileType") == SQL;
        },

        isText: function() {
            return _.include([SQL, TEXT, CODE], this.get("fileType"));
        },

        isAlpine: function() {
            return this.get("fileType") == ALPINE;
        },

        isBinary: function() {
            return this.get("fileType") == OTHER;
        },

        extension: function() {
            var fileName = this.get("fileName");
            var matches = fileName && fileName.match(extensionRegex);
            return matches && matches[1].toLowerCase();
        },

        downloadUrl: function() {
            return this.get("versionInfo").contentUrl;
        },

        workfilesUrl: function() {
            return this.workspace().workfilesUrl();
        },

        canEdit: function() {
            return this.isLatestVersion() && this.workspace().isActive();
        },

        isLatestVersion: function() {
            var versionNum = this.get('versionInfo') && this.get('versionInfo').versionNum;
            return (!versionNum || versionNum === this.get("latestVersionNum"))
        },

        save: function(attrs, options) {
            if (this.isNew() || this.canEdit()) {
                options = options || {};
                attrs = attrs || {};
                var overrides = {};

                if (this.get("versionInfo") && this.get("versionInfo").id) {
                    overrides.url = "/workfiles/" + this.get("id") + "/versions/" + this.get("versionInfo").id;
                    attrs['lastUpdatedStamp'] = this.get("versionInfo").lastUpdatedStamp;
                }

                return this._super("save", [attrs, _.extend(options, overrides)]);
            }
        },

        saveAsNewVersion: function(attrs, options) {
            options = options || {};

            var overrides = {
                method: 'create',
                url: "/workfiles/" + this.get("id") + "/versions"
            };

            return this._super("save", [attrs, _.extend(options, overrides)])
        },

        iconUrl: function(options) {
            if (this.isImage()) {
                return this.get("versionInfo").iconUrl;
            } else {
                return chorus.urlHelpers.fileIconUrl(this.extension(), options && options.size);
            }
        },

        hasOwnPage: function() {
            return true;
        },

        hasConflict: function() {
            return this.serverErrors && this.serverErrors.fields && this.serverErrors.fields.version && this.serverErrors.fields.version.INVALID;
        }
    });
})();
