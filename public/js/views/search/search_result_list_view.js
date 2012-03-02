chorus.views.SearchResultList = chorus.views.Base.extend({
    className: "search_result_list",

    subviews: {
        ".user_list": "userList",
        ".workfile_list": "workfileList",
        ".workspace_list": "workspaceList",
        ".tabular_data_list": "tabularDataList"
    },

    events: {
        "click li": "selectItem"
    },

    selectItem:function selectItem(e) {
        var $target = $(e.currentTarget);
        if ($target.hasClass("selected")) return;

        this.$("li").removeClass("selected");
        $target.addClass("selected");

        if ($target.closest(".workfile_list").length) {
            var workfileId = $target.data("id");
            var workfile = this.workfileList.collection.get(workfileId);

            this.trigger("workfile:selected", workfile);
        } else if ($target.closest(".workspace_list")) {
            var workspace = this.workspaceList.collection.get($target.data("id"));
            chorus.PageEvents.broadcast("workspace:selected", workspace);
        }
    },

    setup: function() {
        this.userList = new chorus.views.SearchUserList({collection: this.model.users(), total: this.model.get("user").numFound});
        this.workfileList = new chorus.views.SearchWorkfileList({ collection : this.model.workfiles(), total: this.model.get("workfile").numFound });
        this.workspaceList = new chorus.views.SearchWorkspaceList({ collection : this.model.workspaces(), total: this.model.get("workspace").numFound });
        this.tabularDataList = new chorus.views.SearchTabularDataList({ collection : this.model.tabularData(), total: this.model.get("dataset").numFound });
    }
})
