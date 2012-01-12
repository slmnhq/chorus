;(function($, ns) {
    ns.alerts.InstanceChangeOwner = ns.alerts.Base.extend({
        text : t("instances.confirm_change_owner.text"),
        ok : t("instances.confirm_change_owner.change_owner"),

        setup: function() {
            var displayName = this.options.displayName;
            this.title = t("instances.confirm_change_owner.title", { displayName: displayName});
        },

        confirmAlert : function() {
            this.trigger("confirmChangeOwner");
            $(document).trigger("close.facebox");
        }
    });
})(jQuery, chorus);
