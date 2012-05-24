(function() {
    var imageRegex = /^image\//;
    var textRegex = /^text\//;
    var IMAGE = 'IMAGE';
    var SQL = 'SQL';
    var TEXT = 'TEXT';
    var ALPINE = 'ALPINE';
    var BINARY = 'BINARY';

    chorus.models.Workfile = chorus.models.Base.extend({
        constructorName: "Workfile",
        entityType: "workfile",
        nameAttribute: 'fileName',

        urlTemplate: function(options) {
            var method = options && options.method;

            if(this.isNew()) {
                return "workspaces/{{workspace.id}}/workfiles";
            }

            if (this.isLatestVersion()) {
                return "workfiles/{{id}}";
            } else {
                return "workfiles/{{id}}/versions/{{versionInfo.versionNum}}";
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
            return new chorus.models.User(this.get("versionInfo").modifier);
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
            return this.workfileType() == IMAGE;
        },

        isSql: function() {
            return this.workfileType() == SQL;
        },

        isText: function() {
            return _.include([SQL, TEXT], this.workfileType());
        },

        isAlpine: function() {
            return this.workfileType() == ALPINE;
        },

        isBinary: function() {
            return this.workfileType() == BINARY;
        },

        workfileType: function () {
            // This function ensures a file has one and only one type
            var mimeType = this.get("mimeType");
            var fileType = this.get("fileType");
            var fileName = this.get("fileName") || this.get("name");

            // Check most specific cases first, with more general cases later so
            // we are sure to see the unusual ones.
            if (fileType == "AFM") {
                return ALPINE;
            }

            if (fileType == "SQL") {
                return SQL;
            }

            if (mimeType && !!mimeType.match(imageRegex)) {
                return IMAGE;
            }

            if (mimeType && !!mimeType.match(textRegex)) {
                return TEXT;
            }

            return BINARY;
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

                if (this.get("versionInfo") && this.get("versionInfo").versionNum) {
                    overrides.url = "/workfiles/" + this.get("id") + "/versions/" + this.get("versionInfo").versionNum;
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
                return chorus.urlHelpers.fileIconUrl(this.get("fileType"), options && options.size);
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
