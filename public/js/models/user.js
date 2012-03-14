chorus.models.User = chorus.models.Base.extend({
    constructorName: "User",

    urlTemplate:"user/{{id}}",
    showUrlTemplate:"users/{{id}}",
    entityType:"user",
    nameFunction: 'displayName',

    workspaces:function () {
        if (!this._workspaces) {
            this._workspaces = new chorus.collections.WorkspaceSet([], { userId: this.get("id") });
            this._workspaces.bind("reset", function () {
                this.trigger("change");
            }, this);
        }
        return this._workspaces;
    },

    activeWorkspaces: function() {
        if(!this._activeWorkspaces) {
            this._activeWorkspaces = new chorus.collections.WorkspaceSet([], {userId: this.get("id"), active: true})
        }

        return this._activeWorkspaces;
    },

    declareValidations:function (newAttrs) {
        this.require('firstName', newAttrs);
        this.require('lastName', newAttrs);
        this.require('userName', newAttrs);
        this.requireValidEmailAddress('emailAddress', newAttrs);

        if(!this.ldap){
            this.requireConfirmationForChange('password', newAttrs);
        }
    },

    requireValidEmailAddress:function (name, newAttrs) {
        this.requirePattern(name, /[\w\.-]+(\+[\w-]*)?@([\w-]+\.)+[\w-]+/, newAttrs);
    },

    requireConfirmationForChange:function (name, newAttrs) {
        if (this.isNew() || (newAttrs && newAttrs.hasOwnProperty(name))) {
            this.require(name, newAttrs);
            this.requireConfirmation(name, newAttrs);
        }
    },

    hasImage:function () {
        return true;
    },

    imageUrl:function (options) {
        options = (options || {});
        return "/edc/userimage/" + this.get("id") + "?size=" + (options.size || "original");
    },

    picklistImageUrl:function () {
        return this.imageUrl();
    },

    savePassword:function (attrs) {
        var passwordUrl = this.url() + "/password";
        this.save(attrs, { url:passwordUrl });
    },

    displayName:function () {
        if (!this.get('firstName') && !this.get('lastName') && this.get('fullName')) {
            return this.get('fullName');
        }
        return [this.get("firstName"), this.get("lastName")].join(' ');
    },

    displayShortName:function (length) {
        length = length || 20;

        var name = this.displayName();
        return (name.length < length) ? name : this.get("firstName") + " " + this.get("lastName")[0] + ".";
    },

    attrToLabel:{
        "emailAddress":"users.email",
        "firstName":"users.first_name",
        "lastName":"users.last_name",
        "userName":"users.username",
        "password":"users.password",
        "title":"users.title",
        "department":"users.department",
        "admin":"users.administrator"
    }
});
