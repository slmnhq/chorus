chorus.models.SearchResult = chorus.models.Base.extend({
    constructorName: "SearchResult",

    numResultsPerPage: 50,

    initialize: function(attributes) {
        if(!this._entityType) {
            this._entityType = this.get("entityType") || "all"
        }
        if (!this.get('searchIn')) {
            this.set({searchIn: 'all'})
        }
    },

    urlTemplate: function() {
        if (this.isScopedToUserWorkspaces()) {
            return "search/workspaces/";
        } else {
            return "search/global/";
        }
    },

    getNextPage: function(){
        if (this.hasNextPage()){
            this.set({page: this.currentPageNumber() + 1});
            this.fetch({success: _.bind(this.resetResults, this)});
        }

    },

    getPreviousPage: function(){
        if (this.hasPreviousPage()){
            this.set({page: this.currentPageNumber() - 1});
            this.fetch({success: _.bind(this.resetResults, this)});
        }
    },

    currentPageNumber: function() {
        return this.get("page") || 1;
    },

    totalPageNumber: function(){
        var total = this.getResults().attributes.total;
        return Math.ceil(total/this.numResultsPerPage);
    },

    showUrlTemplate: function() {
        var prefix = "",
            workspaceId = this.get("workspaceId");

        if (workspaceId) {
            prefix = "workspaces/" + workspaceId + "/";
        }

        if (this.isScopedToUserWorkspaces() || this.hasSpecificEntityType()) {
            return prefix + "search/" + this.get("searchIn") + "/" + this.entityType() + "/" + this.get("query");
        } else {
            return prefix + "search/" + this.get("query");
        }
    },

    isScopedToUserWorkspaces: function() {
        return this.get("searchIn") === "my_workspaces";
    },

    hasNextPage: function(){
        if (this.hasSpecificEntityType()) {
            var total = this.getResults().attributes.total;
            var page = this.currentPageNumber();
            return total > (this.numResultsPerPage * page);
        }
    },

    hasPreviousPage: function(){
        if (this.hasSpecificEntityType()) {
            var page = this.currentPageNumber();
            return page > 1;
        }
    },

    hasSpecificEntityType: function() {
        return this.entityType() && (this.entityType() !== "all");
    },

    entityType: function() {
        if(this.has("entityType"))this._entityType = this.get("entityType");
        return this._entityType;
    },

    urlParams: function() {
        var params = {
            query: this.get("query"),
            rows: 3,
            page: 1
        };
        if (this.hasSpecificEntityType()) {
            params.entityType = this.entityType();
            params.rows = this.numResultsPerPage;
            params.page = this.currentPageNumber();
        }
        if (this.has("workspaceId")) params.workspaceId = this.get("workspaceId");
        return params;
    },

    displayShortName: function(length) {
        length = length || 20;

        var name = this.get("query") || "";
        return (name.length < length) ? name : name.slice(0, length) + "...";
    },

    hdfs: function() {
        if (!this._hdfs && this.get("hdfs")) {
            this._hdfs = new chorus.collections.HdfsEntrySet(null, {total: this.get("hdfs").numFound});
            this._hdfs.reset(this.get("hdfs").docs);
        }
        return this._hdfs;
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
    },

    instances: function() {
        if (!this._instances && this.get("instance")) {
            var instances = _.map(this.get("instance").docs, function(instanceJson) {
                var instance = new chorus.models.Instance(instanceJson);
                instance.comments = new chorus.collections.ActivitySet(instanceJson.comments);
                return instance;
            });
            this._instances = new chorus.collections.InstanceSet(instances, { total: this.get("instance").numFound });
        }

        return this._instances;
    },

    getResults: function() {
        switch(this.entityType()) {
            case "user":
                return this.users()
                break;
            case "workspace":
                return this.workspaces()
                break;
            case "workfile":
                return this.workfiles()
                break;
            case "dataset":
                return this.tabularData();
                break;
            case "instance":
                return this.instances();
                break;
            case "hdfs":
                return this.hdfs();
        }
    },

    resetResults: function() {
        if(this.hasSpecificEntityType()) {
            this.getResults().reset(this.get(this.entityType()).docs);
        }
    }
});
