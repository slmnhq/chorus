chorus.views.SearchResultList = chorus.views.Base.extend({
    constructorName: "SearchResultListView",
    className: "search_result_list",

    subviews: {
        ".hdfs_list": "hdfsList",
        ".user_list": "userList",
        ".workfile_list": "workfileList",
        ".workspace_list": "workspaceList",
        ".dataset_list": "tabularDataList",
        ".instance_list": "instanceList"
    },

    events: {
        "click li.result_item": "selectItem"
    },

    setup: function() {
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
        return new chorus.views.SearchResultListBase({
            entityType: entityType,
            collection: collection,
            total: this.model.get(entityType).numFound,
            query: this.model
        });
    },

    selectItem:function selectItem(e) {
        var $target = $(e.currentTarget);
        if ($target.hasClass("selected")) return;

        this.$("li.result_item").removeClass("selected");
        $target.addClass("selected");
        var cid = $target.data("cid");
        var containingView = $target.parent().parent();

        if (containingView.hasClass("workfile_list")) {
            var workfile = this.workfileList.collection.getByCid(cid);
            chorus.PageEvents.broadcast("workfile:selected", workfile);

        } else if (containingView.hasClass("workspace_list")) {
            var workspace = this.workspaceList.collection.getByCid(cid);
            chorus.PageEvents.broadcast("workspace:selected", workspace);

        } else if (containingView.hasClass("dataset_list")) {
            var tabularData = this.tabularDataList.collection.getByCid(cid);
            chorus.PageEvents.broadcast("tabularData:selected", tabularData);

        } else if (containingView.hasClass("user_list")) {
            var user = this.userList.collection.getByCid(cid);
            chorus.PageEvents.broadcast("user:selected", user);

        } else if (containingView.hasClass("hdfs_list")) {
            var hdfs = this.hdfsList.collection.getByCid(cid);
            chorus.PageEvents.broadcast("hdfs_entry:selected", hdfs);
        } else if (containingView.hasClass("instance_list")) {
            var instance = this.instanceList.collection.getByCid(cid);
            chorus.PageEvents.broadcast("instance:selected", instance);
        }
    },

    additionalContext: function() {
        return {
            hasHdfs: this.shouldShowSection("hdfs"),
            hasWorkspace : this.shouldShowSection("workspace"),
            hasWorkfile : this.shouldShowSection("workfile"),
            hasDataset : this.shouldShowSection("dataset"),
            hasUser : this.shouldShowSection("user"),
            hasInstance: this.shouldShowSection("instance")
        }
    },

    shouldShowSection: function(sectionName) {
        return _.include([sectionName, "all"], this.model.entityType());
    }
})
