chorus.dialogs.InstanceUsage = chorus.dialogs.Base.extend({
    className:"instance_usage",
    title:t("instances.usage.title"),
    useLoadingSection:true,
    additionalClass:'with_sub_header',

    setup:function () {
        this.usage = this.resource = this.options.launchElement.data("instance").usage();
        this.usage.fetchIfNotLoaded();
        this.requiredResources.push(this.usage);
        this.config = chorus.models.Config.instance();
        this.requiredResources.push(this.config);
    },

    additionalContext:function () {
        this.usage.calculatePercentages();
    }
});