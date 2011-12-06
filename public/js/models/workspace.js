(function(ns) {
    ns.Workspace = chorus.models.Base.extend({
        urlTemplate : "workspace/{{id}}",
        showUrlTemplate : "workspaces/{{id}}",

        customIconUrl: function(options) {
            options = (options || {});
            return "/edc/workspace/" + this.get("id") + "/image?size=" + (options.size || "original");
        },

        defaultIconUrl: function() {
            if (this.get("active")) {
                return "/images/workspace-icon-large.png";
            } else {
                return "/images/workspace-archived-icon-large.png";
            }
        },

        owner: function() {
            return new ns.User({
                fullName: this.get("ownerFullName"),
                userName: this.get("owner")
            });
        },

        declareValidations : function(){
            this.require("name")
        },

        archiver: function() {
            return new ns.User({
                fullName: (this.get("archiverFirstName") + ' ' + this.get("archiverLastName")),
                userName: this.get("archiver")
            });
        },

        displayName : function() {
            return this.get("name");
        },

        imageUrl : function(options) {
            options = (options || {});
            return "/edc/workspace/" + this.get("id") + "/image?size=" + (options.size || "original");
        },

        picklistImageUrl : function() {
            return "/images/workspace-icon-small.png";
        },

        attrToLabel : {
            "name" : "workspace.validation.name"
        },

        truncatedSummary: function(length) {
            if (this.get("summary")) {
                return this.get("summary").substring(0, length);
            }
        },

        isTruncated: function() {
            return this.get("summary") ? this.get("summary").length > 100 : false;
        }
    });
})(chorus.models);
