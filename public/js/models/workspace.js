(function(ns) {
    ns.Workspace = chorus.models.Base.extend({
        urlTemplate : "workspace/{{id}}",
        showUrlTemplate : "workspaces/{{id}}",

        performValidation : function(){
            this.errors = {}
            this.require("name")
            return _(this.errors).isEmpty();
        },

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
        }
    });
})(chorus.models);
