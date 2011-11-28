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
            this.errors = {};
            this.require('firstName');
            this.require('lastName');
            this.require('userName');
            this.requirePattern('emailAddress', /[\w\.-]+(\+[\w-]*)?@([\w-]+\.)+[\w-]+/);
            this.requireConfirmation('password');
            return _(this.errors).isEmpty();
        },

        imageUrl : function(options){
            options = (options || {});
            return "/edc/userimage/" + this.get("userName") + "?size=" + (options.size || "original");
        },

        picklistImageUrl : function(){
            return this.imageUrl();
        },

        displayName : function() {
            return [this.get("firstName"), this.get("lastName")].join(' ');
        },

        attrToLabel : {
            "emailAddress" : "users.email",
            "firstName" : "users.first_name",
            "lastName" : "users.last_name",
            "userName" : "users.username",
            "password" : "users.password",
            "title" : "users.title",
            "department" : "users.department",
            "admin" : "users.administrator"
        }
    });
})(chorus.models);
