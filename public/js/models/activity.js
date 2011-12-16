;(function(ns) {
    ns.Activity = chorus.models.Base.extend({
        initialize : function(attrs) {
            var type = attrs.type;

            var methodSource = ns.ActivityProxies[type] || ns.ActivityProxies.DEFAULT;

            this.objectName = methodSource.objectName;
            this.objectUrl = methodSource.objectUrl;
            this.workspaceName = methodSource.workspaceName;
            this.workspaceUrl = methodSource.workspaceUrl;

            _.bindAll(this, 'objectName', 'objectUrl', 'workspaceName', 'workspaceUrl');
        },

        author : function() {
            this._author = this._author || new chorus.models.User(this.get("author"));
            return this._author;
        }
    });

    ns.ActivityProxies || (ns.ActivityProxies = {});

    ns.ActivityProxies.DEFAULT = {
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
    }

    ns.ActivityProxies.NOTE = _.extend({}, ns.ActivityProxies.DEFAULT, {
        objectUrl : function() {
            return 'foo'
        }
    });

    ns.ActivityProxies.WORKSPACE_DELETED = _.extend({}, ns.ActivityProxies.DEFAULT, {
        objectName : getWorkspaceName
    });

    ns.ActivityProxies.WORKSPACE_CREATED = _.extend({}, ns.ActivityProxies.DEFAULT, {
        objectName : getWorkspaceName,
        objectUrl : getWorkspaceUrl
    });

    function getWorkspaceName() {
        return this.get("workspace").name;
    }

    function getWorkspaceUrl() {
        return new chorus.models.Workspace({id: this.get("workspace").id}).showUrl();
    }

})(chorus.models);
