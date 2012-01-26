;(function(ns) {
    ns.dialogs.InstanceUsage = ns.dialogs.Base.extend({
        className : "instance_usage",
        title : t("instances.usage.title"),
        useLoadingSection: true,

        setup : function() {
            this.usage = this.resource = new chorus.models.InstanceUsage({ instanceId: this.pageModel.get('id') })
            this.usage.fetch()
            this.requiredResources.push(this.usage);
            this.requiredResources.push(chorus.models.Config.instance());
        },

        additionalContext : function() {
            return {
                usage: this.usage.attributes
            }
        }
    });
})(chorus);
