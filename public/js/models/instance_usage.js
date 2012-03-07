chorus.models.InstanceUsage = chorus.models.Base.extend({
    urlTemplate:"instance/{{instanceId}}/workspace",

    calculatePercentages:function () {
        _.each(this.get('workspaces'), function (workspace) {
            var config = chorus.models.Config.instance();
            workspace.percentageUsed = Math.round(parseInt(workspace.sizeInBytes, 10) / config.get('sandboxRecommendSizeInBytes') * 100);
        })
    }
});