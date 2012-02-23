chorus.views.WorkspaceDetail = chorus.views.Base.extend({
    className:"workspace_detail",
    useLoadingSection: true,

    subviews: {
        ".activity_list_header": "activityListHeader",
        ".activity_list": "activityList"
    },

    setup:function () {
        this.collection = this.model.activities();
        this.collection.fetch();
        this.requiredResources.add(this.collection);

        this.activityList = new chorus.views.ActivityList({
            collection: this.collection,
            suppressHeading: true,
            additionalClass: "workspace_detail",
            displayStyle: "without_workspace"
        });

        this.activityListHeader = new chorus.views.ActivityListHeader({
            collection: this.collection,
            allTitle: t("workspace.activity"),
            insightsTitle: t("workspace.insights")
        });
    }
});
