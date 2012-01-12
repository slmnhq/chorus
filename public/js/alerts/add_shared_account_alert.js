;(function($, ns) {
    ns.alerts.AddSharedAccount = ns.alerts.Base.extend({
        text : t("instances.add_shared_account.text"),
        title : t("instances.add_shared_account.title"),
        ok : t("instances.add_shared_account.enable"),

        confirmAlert : function() {
            this.trigger("addSharedAccount");
            $(document).trigger("close.facebox");
        }
    });
})(jQuery, chorus);
