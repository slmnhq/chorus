;(function(ns) {
    ns.dialogs.InstanceUsage = ns.dialogs.Base.extend({
        className : "instance_usage",
        title : t("instances.usage.title"),
        useLoadingSection: true,
        additionalClass: 'with_sub_header',

        setup : function() {
            this.usage = this.resource = new chorus.models.InstanceUsage({ instanceId: this.pageModel.get('id') })
            this.usage.fetch()
            this.requiredResources.push(this.usage);
            this.config = chorus.models.Config.instance();
            this.requiredResources.push(this.config);
        },

        additionalContext : function() {
            this.usage.calculatePercentages();
            return {
                usage: this.usage.attributes
            }
        }
    });
})(chorus);
