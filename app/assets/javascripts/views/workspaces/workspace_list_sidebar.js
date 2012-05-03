chorus.views.WorkspaceListSidebar = chorus.views.Sidebar.extend({
    constructorName: "WorkspaceListSidebar",
    templateName: "workspace_list_sidebar",

    subviews: {
        '.tab_control': 'tabs',
        ".workspace_member_list": "workspaceMemberList"
    },

    setup: function() {
        chorus.PageEvents.subscribe("workspace:selected", this.setWorkspace, this)
        this.tabs = new chorus.views.TabControl(["activity"]);
        this.workspaceMemberList = new chorus.views.WorkspaceMemberList()
    },

    additionalContext: function() {
        return this.model ? {
            imageSrc: this.model.fetchImageUrl(),
            hasImage: this.model.hasImage(),
            prettyName: $.stripHtml(this.model.get("name"))
        } : {};
    },

    setWorkspace: function(model) {
        this.resource = this.model = model;

        if (model) {
            var activities = model.activities();
            activities.fetch();

            this.bindings.add(activities, "changed", this.render);
            this.bindings.add(activities, "reset", this.render);

            this.tabs.activity = new chorus.views.ActivityList({
                collection: activities,
                additionalClass: "sidebar"
            });
        } else {
            delete this.tabs.activity;
        }

        this.render();
    }
});
