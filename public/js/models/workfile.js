;(function(ns) {
    var imageRegex = /^image\//;
    var textRegex = /^text\//;

    ns.Workfile = chorus.models.Base.extend({
        entityType : "workfile",
        
        initialize : function() {
            this.workspace = new chorus.models.Workspace({id: this.get("workspaceId")})
            this.urlTemplate = this.workspace.url(true) + "/workfile/{{id}}"
            this.showUrlTemplate = this.workspace.showUrl(true) + "/workfiles/{{id}}"
        },

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

        isText: function() {
            var type = this.get("mimeType");
            return type && type.match(textRegex);
        },

        downloadUrl : function() {
            return this.url() + "/file/" + this.get("versionFileId") + "?download=true";
        }
    });
})(chorus.models);
