chorus.views.WorkspaceListSidebar = chorus.views.Sidebar.extend({
    constructorName: "WorkspaceListSidebar",
    className: "workspace_list_sidebar",

    subviews: {
        '.activity_list': 'activityList',
        '.tab_control': 'tabControl',
        ".workspace_member_list": "workspaceMemberList"
    },

    setup: function() {
        chorus.PageEvents.subscribe("workspace:selected", this.setWorkspace, this)
        this.tabControl = new chorus.views.TabControl([ {name: 'activity', selector: ".activity_list"} ])
        this.workspaceMemberList = new chorus.views.WorkspaceMemberList()
    },

    additionalContext: function() {
        return this.model ? {
            imageSrc: this.model.imageUrl(),
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

            this.activityList = new chorus.views.ActivityList({
                collection: activities,
                additionalClass: "sidebar"
            });

            this.activityList.bind("content:changed", this.recalculateScrolling, this)
        } else {
            delete this.activityList;
        }

        this.render();
    }
});