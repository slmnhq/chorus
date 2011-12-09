;
(function(ns) {
    ns.User = chorus.models.Base.extend({
        urlTemplate : "user/{{id}}",
        showUrlTemplate : "users/{{id}}",

        workspaces: function() {
            if (!this._workspaces) {
                this._workspaces = new ns.WorkspaceSet();
                this._workspaces.urlTemplate = "workspace/?user=" + this.get("id");
                this._workspaces.bind("reset", function() {
                    this.trigger("change");
                }, this);
            }
            return this._workspaces;
        },

        declareValidations : function(newAttrs) {
            this.require('firstName', newAttrs);
            this.require('lastName', newAttrs);
            this.require('userName', newAttrs);
            this.requirePattern('emailAddress', /[\w\.-]+(\+[\w-]*)?@([\w-]+\.)+[\w-]+/, newAttrs);
            if(this.isNew() || (newAttrs && newAttrs.hasOwnProperty("password"))) {
                this.require("password", newAttrs);
                this.requireConfirmation('password', newAttrs);
            }
        },

        hasImage: function() {
            return true;
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
