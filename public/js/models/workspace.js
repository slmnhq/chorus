(function(ns) {
    ns.Workspace = chorus.models.Base.extend({
        urlTemplate : "workspace/{{id}}",
        showUrlTemplate : "workspaces/{{id}}",
        entityType : "workspace",

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
            this._owner = this._owner || new ns.User({
                fullName: this.get("ownerFullName"),
                id: this.get("ownerId")
            });
            return this._owner;
        },

        members: function(){
            if (!this._members) {
                this._members = new chorus.models.MemberSet([], {workspaceId : this.get("id")})
                this._members.bind("saved", function() { this.trigger("change") }, this);
            }
            return this._members;
        },

        declareValidations : function(newAttrs) {
            this.require("name", newAttrs);
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

        hasImage: function() {
            return this.get("iconId") != null;
        },

        isTruncated: function() {
            return this.get("summary") ? this.get("summary").length > 100 : false;
        },

        canRead : function() {
            return this._hasPermission(['admin', 'read']);
        },

        canComment : function() {
            return this._hasPermission(['admin', 'commenting']);
        },

        canUpdate : function() {
            return this._hasPermission(['admin', 'update']);
        },

        _hasPermission : function(validPermissions) {
            return _.intersection(this.get("permission"), validPermissions).length > 0;
        }
    });
})(chorus.models);
