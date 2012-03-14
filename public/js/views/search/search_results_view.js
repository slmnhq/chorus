chorus.views.SearchResults = chorus.views.Base.extend({
    constructorName: "SearchResults",
    className: "search_results",

    subviews: {
        ".this_workspace":     "thisWorkspaceList",
        ".hdfs_list":          "hdfsList",
        ".user_list":          "userList",
        ".workfile_list":      "workfileList",
        ".workspace_list":     "workspaceList",
        ".dataset_list":       "tabularDataList",
        ".instance_list":      "instanceList"
    },

    events: {
        "click li.result_item": "selectItem"
    },

    setup: function() {
        if (this.model.workspaceItems()) {
            this.thisWorkspaceList = new chorus.views.WorkspaceSearchResultList({
                collection: this.model.workspaceItems(),
                search: this.model
            });
        }
        if (this.model.hdfs()) {
            this.hdfsList = this.buildListView('hdfs', this.model.hdfs());
        }
        if (this.model.users()) {
            this.userList = this.buildListView('user', this.model.users());
        }
        if (this.model.workfiles()) {
            this.workfileList = this.buildListView('workfile', this.model.workfiles());
        }
        if (this.model.workspaces()) {
            this.workspaceList = this.buildListView('workspace', this.model.workspaces());
        }
        if (this.model.tabularData()) {
            this.tabularDataList = this.buildListView('dataset', this.model.tabularData());
        }
        if (this.model.instances()) {
            this.instanceList = this.buildListView('instance', this.model.instances());
        }
    },

    buildListView: function(entityType, collection) {
        return new chorus.views.SearchResultList({
            entityType: entityType,
            collection: collection,
            search: this.model
        });
    },

    selectItem:function selectItem(e) {
        var $target = $(e.currentTarget);
        if ($target.hasClass("selected")) return;

        this.$("li.result_item").removeClass("selected");
        $target.addClass("selected");
    }
})
