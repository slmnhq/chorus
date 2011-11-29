;(function(ns) {
    ns.Workfile = chorus.models.Base.extend({
        initialize : function() {
            this.workspace = new chorus.models.Workspace({id: this.get("workspaceId")})
            this.urlTemplate = this.workspace.url(true) + "/workfile/{{id}}"
            this.showUrlTemplate = this.workspace.showUrl(true) + "/workfiles/{{id}}"
        },

        modifier : function() {
            return new ns.User({
                userName : this.get("modifiedBy"),
                firstName : this.get("modifierFirstName"),
                lastName : this.get("modifierLastName")
            })
        },

        performValidation : function(){
            this.errors = {}
            this.require("fileName")
            return _(this.errors).isEmpty();
        },

        attrToLabel : {
            "fileName" : "workfiles.validation.name"
        },

        isImage: function() {
            return this.get("mimeType").indexOf("image/") == 0;
        }
    });
})(chorus.models);
