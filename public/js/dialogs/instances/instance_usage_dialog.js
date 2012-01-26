;(function(ns) {
    ns.dialogs.InstanceUsage = ns.dialogs.Base.extend({
        className : "instance_usage",
        title : t("instances.usage.title"),

        setup : function() {
            this.usage = new chorus.models.InstanceUsage({ instanceId: this.pageModel.get('id') })
            this.usage.bindOnce("change", this.render, this);
            this.usage.fetch()
        },

        additionalContext : function() {
            return {
                usage: this.usage.attributes
            }
        }
    });
})(chorus);
