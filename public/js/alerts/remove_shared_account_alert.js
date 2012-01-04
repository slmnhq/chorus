;(function($, ns) {
    ns.alerts.RemoveSharedAccount = ns.alerts.Base.extend({
        text : t("instances.remove_shared_account.text"),
        title : t("instances.remove_shared_account.title"),
        ok : t("instances.remove_shared_account.remove"),

        confirmAlert : function() {
            this.trigger("removeSharedAccount");
            $(document).trigger("close.facebox");
        }
    });
})(jQuery, chorus);
