chorus.alerts.RemoveSharedAccount = chorus.alerts.Base.extend({
    constructorName: "RemoveSharedAccount",

    text:t("instances.remove_shared_account.text"),
    title:t("instances.remove_shared_account.title"),
    ok:t("instances.remove_shared_account.remove"),

    confirmAlert:function () {
        this.trigger("removeSharedAccount");
        $(document).trigger("close.facebox");
    }
});

