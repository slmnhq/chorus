;(function(ns) {
    var imageRegex = /^image\//;
    var textRegex = /^text\//;

    ns.models.Workfile = chorus.models.Base.extend({
        entityType : "workfile",
        showUrlTemplate: "workspaces/{{workspaceId}}/workfiles/{{id}}",

        urlTemplate : function() {
            if (this.has("versionNum") && (parseInt(this.get("versionNum")) !== parseInt(this.get("latestVersionNum")))) {
                return "workspace/{{workspaceId}}/workfile/{{id}}/version/{{versionNum}}"
            } else {
                return "workspace/{{workspaceId}}/workfile/{{id}}"
            }
        },

        initialize : function() {
            if (this.collection && this.collection.attributes.workspaceId) {
                this.set({workspaceId: this.collection.attributes.workspaceId}, {silent : true});
            }
        },

        modifier : function() {
            return new ns.models.User({
                userName : this.get("modifiedBy"),
                firstName : this.get("modifiedByFirstName"),
                lastName : this.get("modifiedByLastName"),
                id: this.get("modifiedById")
            })
        },

        sandbox: function() {
            this._sandbox || (this._sandbox = new ns.models.Sandbox({ id: this.get("sandboxId"), workspaceId: this.get("workspaceId") }));
            return this._sandbox;
        },

        lastComment : function() {
            var comments = this.get("recentComments");
            return comments && comments.length > 0 &&  new ns.models.Comment({
                body : comments[0].text,
                author : comments[0].author,
                commentCreatedStamp : comments[0].timestamp
            });
        },

        createDraft : function() {
            var draft = new ns.models.Draft({workfileId: this._workfileId(), workspaceId : this.get("workspaceId"), content : this.get("content")})
            if (this.get("hasDraft")) {
                draft.id = "ForceBackboneToUsePut"
            }
            draft.bind("saved", function() {
                this.set({ hasDraft: true });
            }, this);
            return draft;
        },

        allVersions : function() {
            return new ns.models.WorkfileVersionSet([], {
                workspaceId : this.get("workspaceId"),
                workfileId : this._workfileId()
            });
        },

        declareValidations : function(newAttrs){
            this.require("fileName", newAttrs);
        },

        attrToLabel : {
            "fileName" : "workfiles.validation.name"
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

        downloadUrl : function() {
            return this.url() + "/file/" + this.get("versionFileId") + "?download=true";
        },

        workfilesUrl : function() {
            return "#/workspaces/"+ this.get("workspaceId") +"/workfiles";
        },

        canEdit : function() {
            return this.get("latestVersionNum") == this.get("versionNum");
        },

        _workfileId : function() {
            return this.get("id");
        },

        save : function(attrs, options) {
            if (this.canEdit()) {
                options = options || {};
                var overrides = {};

                if (this.has("versionNum")) {
                    overrides.url = "/edc/workspace/" + this.get("workspaceId") + "/workfile/" + this.get("id") + "/version/" + this.get("versionNum");
                }

                return this._super("save", [attrs, _.extend(options, overrides)]);
            }
        },

        saveAsNewVersion: function(attrs, options) {
            options = options || {};

            var overrides = {
                method : 'create',
                url : "/edc/workspace/" + this.get("workspaceId") + "/workfile/" + this.get("id") + "/version"
            };

            return this._super("save", [attrs, _.extend(options, overrides)])
        }
    });
})(chorus);
