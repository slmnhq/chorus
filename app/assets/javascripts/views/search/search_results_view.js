chorus.views.SearchResults = chorus.views.Base.extend({
    constructorName: "SearchResults",
    templateName: "search_results",

    subviews: {
        ".this_workspace":     "thisWorkspaceList",
        ".hdfs_list":          "hdfsList",
        ".user_list":          "userList",
        ".workfile_list":      "workfileList",
        ".workspace_list":     "workspaceList",
        ".dataset_list":       "tabularDataList",
        ".instance_list":      "instanceList",
        ".attachment_list":    "attachmentList"
    },

    events: {
        "click li.result_item": "selectItem"
    },

    setup: function() {
        if (this.model.hdfs().length) {
            this.hdfsList = this.buildListView('hdfs', this.model.hdfs());
        }
        if (this.model.users().length) {
            this.userList = this.buildListView('user', this.model.users());
        }
        if (this.model.workfiles().length) {
            this.workfileList = this.buildListView('workfile', this.model.workfiles());
        }
        if (this.model.workspaces().length) {
            this.workspaceList = this.buildListView('workspace', this.model.workspaces());
        }
        if (this.model.tabularData().length) {
            this.tabularDataList = this.buildListView('dataset', this.model.tabularData());
        }
        if (this.model.instances().length) {
            this.instanceList = this.buildListView('instance', this.model.instances());
        }
        if (this.model.attachments().length) {
            this.attachmentList = this.buildListView('attachment', this.model.attachments());
        }
        if (!this.model.hasSpecificEntityType() && this.model.workspaceItems().length) {
            this.thisWorkspaceList = new chorus.views.WorkspaceSearchResultList({
                collection: this.model.workspaceItems(),
                search: this.model
            });
        }
    },

    additionalContext: function() {
        return {
            hasResults: this.model.total() > 0,
            isConstrained: this.model.isConstrained(),
            expandHref: new chorus.models.SearchResult({ query: this.model.get("query") }).showUrl()
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
