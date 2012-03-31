chorus.views.WorkspaceShowSidebar = chorus.views.Sidebar.extend({
    constructorName: "WorkspaceShowSidebarView",
    className:"workspace_show_sidebar",

    subviews: {
        ".workspace_member_list": "workspaceMemberList"
    },

    setup:function () {
        this.bindings.add(this.model, "image:change", this.render);
        this.model.members().fetch();
        this.bindings.add(this.model.members(), "reset", this.render);
        this.workspaceMemberList = new chorus.views.WorkspaceMemberList();
        this.workspaceMemberList.setWorkspace(this.model);
    },

    additionalContext:function () {
        return {
            workspaceAdmin:this.model.workspaceAdmin(),
            imageUrl:this.model.imageUrl() + "&buster=" + chorus.cachebuster,
            hasImage:this.model.hasImage(),
            hasSandbox:!!this.model.sandbox(),
            currentUserIsMember: this.model.currentUserIsMember()
        };
    },

    postRender:function () {
        var self = this;
        this.$(".workspace_image").load(function () {
            self.$(".after_image").removeClass("hidden");
        });
        this.$('.workspace_image').load(_.bind(this.recalculateScrolling, this));
        this._super('postRender');
    }
});
