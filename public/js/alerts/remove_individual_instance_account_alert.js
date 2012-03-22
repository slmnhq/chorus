chorus.alerts.RemoveIndividualAccount = chorus.alerts.Base.extend({
    ok:t("instances.remove_individual_account.remove"),

    setup: function() {
        this.title = t("instances.remove_individual_account.title", {instanceName: this.options.instanceName, userName: this.options.name});
    },

    confirmAlert:function () {
        this.trigger("removeIndividualAccount");
        $(document).trigger("close.facebox");
    }
});

