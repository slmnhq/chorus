;(function(ns) {
    ns.Activity = chorus.models.Base.extend({
        author : function() {
            this._author = this._author || new chorus.models.User(this.get("author"));
            return this._author;
        },

        objectName : function() {
            return "NEED_OBJECT_FROM_API";
        },

        objectUrl : function() {
            return "/NEED/OBJECT/FROM/API"
        },

        workspaceName : function() {
            return "NEED_WORKSPACE_FROM_API";
        },

        workspaceUrl : function() {
            return "/NEED/WORKSPACE/FROM/API"
        }
    });
})(chorus.models);
