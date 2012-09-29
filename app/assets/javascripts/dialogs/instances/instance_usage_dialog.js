chorus.dialogs.InstanceUsage = chorus.dialogs.Base.extend({
    constructorName: "InstanceUsage",

    templateName:"instance_usage",
    title:t("instances.usage.title"),
    useLoadingSection:true,
    additionalClass:'with_sub_header',

    setup:function () {
        this.usage = this.resource = this.options.instance.usage();
    }
});
