;(function() {
    var NUM_RESULTS_PER_PAGE = 50;

    var collectionMap = {
        hdfs: "HdfsEntrySet",
        tabularData: "TabularDataSet",
        workfiles: "WorkfileSet",
        workspaces: "WorkspaceSet",
        workspaceItems: "WorkspaceItemSet",
        instances: "InstanceSet",
        users: "UserSet",
        attachments: "ArtifactSet"
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
                return "search/workspace/";
            } else if (this.isScopedToUserWorkspaces()) {
                return "search/workspaces/";
            } else {
                return "search/global/";
            }
        },

        currentPageNumber: function() {
            return this.get("page") || 1;
        },

        showUrlTemplate: function() {
            var prefix = "",
                workspaceId = this.get("workspaceId");

            if (workspaceId) {
                prefix = "workspaces/" + workspaceId + "/";
            }

            if (this.isConstrained()) {
                return prefix + "search/" + this.searchIn() + "/" + this.entityType() + "/" + encodeURIComponent(this.get("query"));
            } else {
                return prefix + "search/" + encodeURIComponent(this.get("query"));
            }
        },

        isScoped: function() {
            return this.isScopedToSingleWorkspace() || this.isScopedToUserWorkspaces();
        },

        isConstrained: function() {
            return this.isScoped() || this.hasSpecificEntityType();
        },

        isScopedToSingleWorkspace: function() {
            return this.searchIn() === "this_workspace";
        },

        isScopedToUserWorkspaces: function() {
            return this.searchIn() === "my_workspaces";
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
            if (this.has("workspaceId")) {
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
        attachments: makeCollectionMethod("attachments"),

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
                case "attachment":
                    return this.attachments();
            }

            if (this.isScopedToSingleWorkspace()) {
                return this.workspaceItems();
            }
        },

        numPages: function(totalFound) {
            return Math.ceil(totalFound / NUM_RESULTS_PER_PAGE);
        },

        total: function() {
            return _.reduce(_.values(this.attributes), function(sum, results) {
                if (results && results.numFound) {
                    return sum + results.numFound
                } else {
                    return sum;
                }
            }, 0)
        }
    });

    function makeCollectionMethod(methodName) {
        var constructorName = collectionMap[methodName];
        var collection, memoizedName = "_" + methodName;

        return function() {
            var ctor = chorus.collections.Search[constructorName];
            var searchKey = ctor.prototype.searchKey;

            if (!this[memoizedName]) {
                collection = this[memoizedName] = new ctor([], { search: this });
                collection.loaded = true;
                if (this.get(searchKey)){
                    collection.refreshFromSearch();
                }
            }

            return this[memoizedName];
        };
    }
})();
