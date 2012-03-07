chorus.views.SearchResultList = chorus.views.Base.extend({
    constructorName: "SearchResultListView",
    className: "search_result_list",

    subviews: {
        ".hdfs_list": "hdfsList",
        ".user_list": "userList",
        ".workfile_list": "workfileList",
        ".workspace_list": "workspaceList",
        ".dataset_list": "tabularDataList"
    },

    events: {
        "click li": "selectItem"
    },

    setup: function() {
        if (this.model.hdfs()) {
            this.hdfsList = new chorus.views.SearchHdfsList({
                collection: this.model.hdfs(),
                total: this.model.get("hdfs").numFound,
                query: this.model
            });
        }
        if (this.model.users()) {
            this.userList = new chorus.views.SearchUserList({
                collection: this.model.users(),
                total: this.model.get("user").numFound,
                query: this.model
            });
        }
        if (this.model.workfiles()) {
            this.workfileList = new chorus.views.SearchWorkfileList({
                collection: this.model.workfiles(),
                total: this.model.get("workfile").numFound,
                query: this.model
            });
        }
        if (this.model.workspaces()) {
            this.workspaceList = new chorus.views.SearchWorkspaceList({
                collection: this.model.workspaces(),
                total: this.model.get("workspace").numFound,
                query: this.model
            });
        }
        if (this.model.tabularData()) {
            this.tabularDataList = new chorus.views.SearchTabularDataList({
                collection: this.model.tabularData(),
                total: this.model.get("dataset").numFound,
                query: this.model
            });
        }
    },

    selectItem:function selectItem(e) {
        var $target = $(e.currentTarget);
        if ($target.hasClass("selected")) return;

        this.$("li").removeClass("selected");
        $target.addClass("selected");
        var id = $target.data("id");
        var containingView = $target.parent().parent();

        if (containingView.hasClass("workfile_list")) {
            var workfile = this.workfileList.collection.get(id);
            chorus.PageEvents.broadcast("workfile:selected", workfile);

        } else if (containingView.hasClass("workspace_list")) {
            var workspace = this.workspaceList.collection.get(id);
            chorus.PageEvents.broadcast("workspace:selected", workspace);

        } else if (containingView.hasClass("dataset_list")) {
            var tabularData = this.tabularDataList.collection.get(id);
            chorus.PageEvents.broadcast("tabularData:selected", tabularData);

        } else if (containingView.hasClass("user_list")) {
            var user = this.userList.collection.get($target.data("id"));
            chorus.PageEvents.broadcast("user:selected", user);
        }
    },

    additionalContext: function() {
        return {
            hasHdfs: this.shouldShowSection("hdfs"),
            hasWorkspace : this.shouldShowSection("workspace"),
            hasWorkfile : this.shouldShowSection("workfile"),
            hasDataset : this.shouldShowSection("dataset"),
            hasUser : this.shouldShowSection("user")
        }
    },

    shouldShowSection: function(sectionName) {
        return _.include([sectionName, "all"], this.model.get("entityType"));
    }
})
