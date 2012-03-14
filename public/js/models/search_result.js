;(function() {
    var NUM_RESULTS_PER_PAGE = 50;

    var collectionMap = {
        hdfs: "HdfsEntrySet",
        tabularData: "TabularDataSet",
        workfiles: "WorkfileSet",
        workspaces: "WorkspaceSet",
        workspaceItems: "WorkspaceItemSet",
        instances: "InstanceSet",
        users: "UserSet"
    };

    chorus.models.SearchResult = chorus.models.Base.extend({
        constructorName: "SearchResult",

        initialize: function() {
            this.bind('invalidated', function() {
                this.selectedItem.trigger('invalidated');
            });
        },

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
            return this.numPages(this.getResults().pagination.records);
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


        workfiles: makeCollectionMethod("workfiles"),
        tabularData: makeCollectionMethod("tabularData"),
        workspaces: makeCollectionMethod("workspaces"),
        instances: makeCollectionMethod("instances"),
        users: makeCollectionMethod("users"),
        hdfs: makeCollectionMethod("hdfs"),
        workspaceItems: makeCollectionMethod("workspaceItems"),

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
        },

        numPages: function(totalFound) {
            return Math.ceil(totalFound / NUM_RESULTS_PER_PAGE);
        }
    });

    function makeCollectionMethod(methodName) {
        var constructorName = collectionMap[methodName];
        var collection, memoizedName = "_" + methodName;

        return function() {
            var ctor = chorus.collections.Search[constructorName];
            var searchKey = ctor.prototype.searchKey;
            if (!this[memoizedName] && this.get(searchKey)) {
                collection = this[memoizedName] = new ctor([], { search: this });
                collection.refreshFromSearch();
            }
            return this[memoizedName];
        };
    }
})();
