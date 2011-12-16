;(function(ns) {
    ns.Activity = chorus.models.Base.extend({
        author : function() {
            this._author = this._author || new chorus.models.User(this.get("author"));
            return this._author;
        },

        objectName : function() {
            return "don't know object name for activity type: " + this.get("type");
        },

        objectUrl : function() {
            return "/NEED/OBJECT/URL/FOR/TYPE/" + this.get("type");
        },

        workspaceName : function() {
            var workspace = this.get("workspace");
            if (workspace) {
                return workspace.name;
            } else {
                return "no workspace name for activity type: " + this.get("type");
            }
        },

        workspaceUrl : function() {
            var workspace = this.get("workspace");
            if (workspace) {
                return new chorus.models.Workspace({id: workspace.id}).showUrl();
            } else {
                return "no workspace URL for activity type: " + this.get("type");
            }
        }
    }, {
        build: function(attrs) {
            var subclass = ns.Activity[attrs.type] || ns.Activity;
            return new subclass(attrs)
        }
    });

    ns.Activity.NOTE = ns.Activity.extend({
        objectUrl : function() {
            return 'foo'
        }
    });

    ns.Activity.WORKSPACE_DELETED = ns.Activity.extend({
    });

    ns.Activity.WORKSPACE_CREATED = ns.Activity.extend({
        objectName : function() {
            return this.get("workspace").name;
        }
    });

})(chorus.models);
