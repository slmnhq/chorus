chorus.models.InstanceUsage = chorus.models.Base.extend({
    constructorName: "InstanceUsage",
    urlTemplate:"instance/{{instance_id}}/workspace",

    calculatePercentages:function () {
        _.each(this.get('workspaces'), function (workspace) {
            var config = chorus.models.Config.instance();
            workspace.percentageUsed = Math.round(parseInt(workspace.sizeInBytes, 10) / config.get('sandboxRecommendSizeInBytes') * 100);
        })
    },

    workspaceCount: function() {
        return this.get("workspaces") && this.get("workspaces").length;
    }
});
