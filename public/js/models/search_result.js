chorus.models.SearchResult = chorus.models.Base.extend({
    constructorName: "SearchResult",

    urlTemplate: function() {
        if (this.get("myWorkspaces")) {
            return "search/workspaces";
        } else {
            return "search/global/";
        }
    },

    showUrlTemplate: function() {
        if (this.get("myWorkspaces") || this.hasSpecificEntityType()) {
            return "search/" + this.scopeUrlSegment() + "/" + this.get("entityType") + "/" + this.get("query");
        } else {
            return "search/" + this.get("query");
        }
    },

    scopeUrlSegment: function() {
        return (this.get("myWorkspaces") ? 'my_workspaces' : 'all')
    },

    hasSpecificEntityType: function() {
        return this.has("entityType") && (this.get("entityType") !== "all");
    },

    urlParams: function() {
        var params = {
            query: this.get("query"),
            rows: 3,
            page: 1
        };
        if (this.hasSpecificEntityType()) params.entityType = this.get("entityType");
        return params;
    },

    displayShortName: function(length) {
        length = length || 20;

        var name = this.get("query") || "";
        return (name.length < length) ? name : name.slice(0, length) + "...";
    },

    users: function() {
        if (!this._users && this.get("user")) {
            this._users = new chorus.collections.UserSet(this.get("user").docs, { total: this.get("user").numFound });
        }

        return this._users;
    },

    workfiles: function() {
        if (!this._workfiles && this.get("workfile")) {
            var workfiles = _.map(this.get("workfile").docs, function(workfileJson) {
                workfileJson.fileName = $.stripHtml(workfileJson.name);
                var workfile = new chorus.models.Workfile(workfileJson);
                workfile.comments = new chorus.collections.ActivitySet(workfileJson.comments);
                return workfile;
            });
            this._workfiles = new chorus.collections.WorkfileSet(workfiles, { total: this.get("workfile").numFound });
        }

        return this._workfiles;
    },

    tabularData: function() {
        if (!this._tabularData && this.get("dataset")) {
            this._tabularData = new chorus.collections.TabularDataSet(this.get("dataset").docs, {total: this.get("dataset").numFound});
        }

        return this._tabularData;
    },

    workspaces: function() {
        if (!this._workspaces && this.get("workspace")) {
            var workspaces = _.map(this.get("workspace").docs, function(workspaceJson) {
                workspaceJson.fileName = $.stripHtml(workspaceJson.name);
                var workspace = new chorus.models.Workspace(workspaceJson);
                workspace.comments = new chorus.collections.ActivitySet(workspaceJson.comments);
                return workspace;
            });
            this._workspaces = new chorus.collections.WorkspaceSet(workspaces, { total: this.get("workspace").numFound });
        }

        return this._workspaces;
    }
});
