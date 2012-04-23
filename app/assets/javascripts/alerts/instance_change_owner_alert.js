chorus.alerts.InstanceChangeOwner = chorus.alerts.Base.extend({
    constructorName: "InstanceChangeOwner",

    text:t("instances.confirm_change_owner.text"),
    ok:t("instances.confirm_change_owner.change_owner"),

    setup:function () {
        this.title = t("instances.confirm_change_owner.title", { displayName:this.model.displayName() });
    },

    confirmAlert:function () {
        this.trigger("confirmChangeOwner", this.model);
        $(document).trigger("close.facebox");
    }
});

