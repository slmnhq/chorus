chorus.views.SearchResultList = chorus.views.Base.extend({
    className: "search_result_list",

    subviews: {
        ".workfile_list": "workfileList",
        ".workspace_list": "workspaceList"
    },

    events: {
        "click li": "selectItem"
    },

    selectItem:function selectItem(e) {
        if ($(e.currentTarget).hasClass("selected")) return;

        this.$("li").removeClass("selected");
        $(e.currentTarget).addClass("selected");

        var workfileId = $(e.currentTarget).data("id");
        var workfile = this.workfileList.collection.get(workfileId);

        this.trigger("workfile:selected", workfile);
    },

    setup: function() {
        this.workfileList = new chorus.views.SearchWorkfileList({ collection : this.model.workfiles(), total: this.model.get("workfile").numFound });
        this.workspaceList = new chorus.views.SearchWorkspaceList({ collection : this.model.workspaces(), total: this.model.get("workspace").numFound });
    }
})
