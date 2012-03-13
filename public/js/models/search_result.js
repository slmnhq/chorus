;(function() {
    var collectionMap = {
        hdfs: { name: "hdfs", constructorName: "HdfsEntrySet" },
        dataset: { name: "tabularData", constructorName: "TabularDataSet" },
        workfile: { name: "workfiles", constructorName: "WorkfileSet" },
        workspace: { name: "workspaces", constructorName: "WorkspaceSet" },
        thisWorkspace: { name: "workspaceItems", constructorName: "WorkspaceSearchItemSet" },
        instance: { name: "instances", constructorName: "InstanceSet" },
        user: { name: "users", constructorName: "UserSet" }
    };

    var NUM_RESULTS_PER_PAGE = 50;

    chorus.models.SearchResult = chorus.models.Base.extend({
        constructorName: "SearchResult",

        urlTemplate: function() {
            if (this.isScopedToSingleWorkspace()) {
                return "search/workspace/{{workspaceId}}";
            } else if (this.isScopedToUserWorkspaces()) {
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
            return numPages(this.getResults().pagination.records);
        },

        showUrlTemplate: function() {
            var prefix = "",
                workspaceId = this.get("workspaceId");

            if (workspaceId) {
                prefix = "workspaces/" + workspaceId + "/";
            }

            if (this.isScoped() || this.hasSpecificEntityType()) {
                return prefix + "search/" + this.searchIn() + "/" + this.entityType() + "/" + this.get("query");
            } else {
                return prefix + "search/" + this.get("query");
            }
        },

        isScoped: function() {
            return this.isScopedToSingleWorkspace() || this.isScopedToUserWorkspaces();
        },

        isScopedToSingleWorkspace: function() {
            return this.searchIn() === "this_workspace";
        },

        isScopedToUserWorkspaces: function() {
            return this.searchIn() === "my_workspaces";
        },

        hasNextPage: function(){
            if (this.hasSpecificEntityType()) {
                var total = this.getResults().pagination.records;
                var page = this.currentPageNumber();
                return total > (NUM_RESULTS_PER_PAGE * page);
            }
        },

        hasPreviousPage: function(){
            if (this.hasSpecificEntityType()) {
                var page = this.currentPageNumber();
                return page > 1;
            }
        },

        isPaginated: function() {
            return this.hasSpecificEntityType() || this.isScopedToSingleWorkspace();
        },

        hasSpecificEntityType: function() {
            return this.entityType() && (this.entityType() !== "all");
        },

        entityType: function() {
            return this.get("entityType") || "all";
        },

        searchIn: function() {
            return this.get("searchIn") || "all";
        },

        urlParams: function() {
            var params = { query: this.get("query") };
            if (this.hasSpecificEntityType()) {
                params.entityType = this.entityType();
            }
            if (this.has("workspaceId") && !this.isScopedToSingleWorkspace()) {
                params.workspaceId = this.get("workspaceId");
            }
            if (this.isPaginated()) {
                params.rows = NUM_RESULTS_PER_PAGE;
                params.page = this.currentPageNumber();
            } else {
                params.rows = 3;
                params.page = 1;
            }
            return params;
        },

        displayShortName: function(length) {
            length = length || 20;

            var name = this.get("query") || "";
            return (name.length < length) ? name : name.slice(0, length) + "...";
        },

        workspace: function() {
            var workspaceId = this.get("workspaceId");
            if (!this._workspace && workspaceId) {
                this._workspace = new chorus.models.Workspace({ id: workspaceId });
            }
            return this._workspace;
        },

        workspaceItems: function() {
            if (!this._workspaceItems && this.get("thisWorkspace")) {
                var entityJson = this.get("thisWorkspace");
                this._workspaceItems = new chorus.collections.WorkspaceSearchItemSet(entityJson.docs);
                this._workspaceItems.pagination = {
                    total: null,
                    page:  2,
                    records: entityJson.numFound,
                }
            }
            return this._workspaceItems;
        },

        workspaceItems: makeCollectionMethod("thisWorkspace"),

        fetchPage: function(pageNum) {
            this.set({ page: pageNum });
            this.fetch({ success: function() {
                //
            }});
        },

        workfiles: function() {
            if (!this._workfiles && this.get("workfile")) {
                var entityJson = this.get("workfile");
                var workfiles = _.map(entityJson.docs, function(workfileJson) {
                    workfileJson.fileName = $.stripHtml(workfileJson.name);
                    var workfile = new chorus.models.Workfile(workfileJson);
                    workfile.comments = new chorus.collections.ActivitySet(workfileJson.comments);
                    return workfile;
                });
                this._workfiles = new chorus.collections.WorkfileSet(workfiles, { total: this.get("workfile").numFound });
                this._workfiles.pagination = {
                    page: 1,
                    total: numPages(entityJson.numFound),
                    records: entityJson.numFound,
                }
            }

            return this._workfiles;
        },

        tabularData: makeCollectionMethod("dataset"),
        workspaces: makeCollectionMethod("workspace"),
        instances: makeCollectionMethod("instance"),
        users: makeCollectionMethod("user"),
        hdfs: makeCollectionMethod("hdfs"),

        getResults: function() {
            if (this.isScopedToSingleWorkspace()) {
                return this.workspaceItems();
            }

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

    function numPages(totalFound) {
        return Math.ceil(totalFound / NUM_RESULTS_PER_PAGE);
    }

    function makeCollectionMethod(entityType) {
        var collectionName  = collectionMap[entityType].name;
        var constructorName = collectionMap[entityType].constructorName;
        var memoizedName    = "_" + collectionName;

        return function() {
            var ctor = chorus.collections[constructorName];

            if (!this[memoizedName] && this.get(entityType)) {
                var entityJson = this.get(entityType);
                this[memoizedName] = new ctor(entityJson.docs);
                this[memoizedName].pagination = {
                    page: 1,
                    total: numPages(entityJson.numFound),
                    records: entityJson.numFound,
                }
                if (entityJson.comments) {
                    this[memoizedName].comments = new chorus.collections.ActivitySet(entityJson.comments);
                }
            }
            return this[memoizedName];
        };
    }
})();
