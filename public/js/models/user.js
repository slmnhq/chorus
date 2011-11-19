;
(function(ns) {
    ns.User = chorus.models.Base.extend({
        urlTemplate : "user/{{userName}}",
        showUrlTemplate : "users/{{userName}}",

        workspaces: function() {
            if (!this._workspaces) {
                this._workspaces = new ns.WorkspaceSet();
                this._workspaces.urlTemplate = "workspace/?user=" + this.get("userName");
                this._workspaces.bind("reset", function() {
                    this.trigger("change");
                }, this);
            }
            return this._workspaces;
        },

        performValidation: function() {
            var fields = ["firstName", "lastName", "userName", "emailAddress", "password",
                "passwordConfirmation", "title", "department"];
            this.errors = {};
            this.require('firstName');
            this.require('lastName');
            this.require('userName');
            this.requirePattern('emailAddress', /[\w\.-]+(\+[\w-]*)?@([\w-]+\.)+[\w-]+/);
            this.requireConfirmation('password');
            var self = this
            _.each(fields, function(attr) {
                self.setMaxLength(attr, 255);
            });
            return _(this.errors).isEmpty();
        },

        imageUrl : function(options){
            options = (options || {});
            return "/edc/userimage/" + this.get("userName") + "?size=" + (options.size || "original");
        }
    });
})(chorus.models);
