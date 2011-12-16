;(function(ns) {
    ns.Activity = chorus.models.Base.extend({
        initialize : function(attrs) {
            var type = attrs.type;

            var activityProxy = ns.ActivityProxies[type] || ns.ActivityProxies.DEFAULT;

            delegate(this, activityProxy, ['objectName', 'objectUrl', 'workspaceName', 'workspaceUrl'])
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

    ns.ActivityProxies.NOTE = makeProxy({
        objectUrl : function() {
            return 'foo'
        }
    });

    ns.ActivityProxies.WORKSPACE_DELETED = makeProxy({
        objectName : getWorkspaceName
    });

    ns.ActivityProxies.WORKSPACE_CREATED = makeProxy({
        objectName : getWorkspaceName,
        objectUrl : getWorkspaceUrl
    });

    ns.ActivityProxies.WORKFILE_CREATED = makeProxy({
        objectName : function() {
            return this.get("workfile").name;
        },
        objectUrl : function() {
            return new chorus.models.Workfile({id: this.get("workfile").id, workspaceId : this.get("workspace").id}).showUrl();
        },
        workspaceName : getWorkspaceName,
        workspaceUrl : getWorkspaceUrl
    });

    function makeProxy(newMethods) {
        return _.extend({}, ns.ActivityProxies.DEFAULT, newMethods);
    }

    function getWorkspaceName() {
        return this.get("workspace").name;
    }

    function getWorkspaceUrl() {
        return new chorus.models.Workspace({id: this.get("workspace").id}).showUrl();
    }

    function delegate(context, proxy, methods){
        _.each(methods, function(method){
            context[method] =  proxy[method]
        })

        _.bindAll.call(context, methods);
    }
})(chorus.models);
