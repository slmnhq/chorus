chorus.models.SearchResult = chorus.models.Base.extend({
    urlTemplate: "search/global/",

    urlParams: function() {
        return {query: this.get("query")}
    },

    displayShortName:function (length) {
        length = length || 20;

        var name = this.get("query") || "";
        return (name.length < length) ? name : name.slice(0, length) + "...";
    },

    workfiles: function() {
        var workfiles = _.map(this.get("workfile").docs, function(workfileJson) {
            workfileJson.fileName = $.stripHtml(workfileJson.name);
            var workfile = new chorus.models.Workfile(workfileJson);
            workfile.comments = new chorus.collections.ActivitySet(workfileJson.comments);
            return workfile;
        });
        return new chorus.collections.WorkfileSet(workfiles);
    },

    tabularData: function() {
        return new chorus.collections.TabularDataSet(this.get("dataset").docs, {total: this.get("dataset").numFound});
    },

    workspaces: function() {
        var workspaces = _.map(this.get("workspace").docs, function(workspaceJson) {
            workspaceJson.fileName = $.stripHtml(workspaceJson.name);
            var workspace = new chorus.models.Workspace(workspaceJson);
            workspace.comments = new chorus.collections.ActivitySet(workspaceJson.comments);
            return workspace;
        });
        return new chorus.collections.WorkspaceSet(workspaces);
    }
});
