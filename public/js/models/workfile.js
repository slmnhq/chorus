;(function(ns) {
    var imageRegex = /^image\//;
    var textRegex = /^text\//;

    ns.Workfile = chorus.models.Base.extend({
        entityType : "workfile",

        urlTemplate : "workspace/{{workspaceId}}/workfile/{{id}}",
        showUrlTemplate : "workspaces/{{workspaceId}}/workfiles/{{id}}",

        modifier : function() {
            return new ns.User({
                userName : this.get("modifiedBy"),
                firstName : this.get("modifiedByFirstName"),
                lastName : this.get("modifiedByLastName"),
                id: this.get("modifiedById")
            })
        },

        lastComment : function() {
            var comments = this.get("recentComments");
            return comments && comments.length > 0 &&  new ns.Comment({
                body : comments[0].text,
                author : comments[0].author,
                commentCreatedStamp : comments[0].timestamp
            });
        },

        createDraft : function() {
            var draft = new ns.Draft({workfileId: this._workfileId(), workspaceId : this.get("workspaceId"), content : this.get("content")})
            if (this.get("hasDraft")) {
                draft.id = "ForceBackboneToUsePut"
            }
            draft.bind("saved", function() {
                this.set({ hasDraft: true });
            }, this);
            return draft;
        },

        createNewVersion : function() {
            return new ns.WorkfileNewVersion({
                workspaceId : this.get("workspaceId"),
                content : this.get("content"),
                commitMessage: this.get("commitMessage"),
                "workfileId" : this._workfileId()
            })
        },

        allVersions : function() {
            return new ns.WorkfileVersionSet([], {
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
            return true;
        },

        _workfileId : function() {
            return this.get("id");
        }

    });
})(chorus.models);
