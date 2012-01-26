;(function(ns){
    ns.models.InstanceUsage = ns.models.Base.extend({
        urlTemplate: "instance/{{instanceId}}/workspace",

        calculatePercentages: function() {
            _.each(this.get('workspaces'), function(workspace) {
                var config = chorus.models.Config.instance();
                workspace.percentageUsed = Math.round(parseInt(workspace.sizeInBytes) / config.get('sandboxRecommendSizeInBytes') * 100);
            })
        }
    });
})(chorus);