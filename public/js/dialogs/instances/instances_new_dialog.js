(function($, ns) {
    ns.dialogs.InstancesNew = chorus.dialogs.Base.extend({
        className : "instances_new",
        title : t("instances.new_dialog.title"),

        persistent: true,

        events : {
            "change input[type='radio']" : "showFieldset"
        },

        showFieldset : function(e) {
            this.$("fieldset").addClass("collapsed");

            $(e.currentTarget).closest("fieldset").removeClass("collapsed");
        }
    });
})(jQuery, chorus);