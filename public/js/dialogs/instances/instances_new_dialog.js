(function($, ns) {
    ns.dialogs.InstancesNew = chorus.dialogs.Base.extend({
        className : "instances_new",
        title : t("instances.new_dialog.title"),

        persistent: true,

        events : {
            "change input[type='radio']" : "showFieldset",
            "click button.submit" : "createInstance"
        },

        makeModel : function() {
            this.model = this.model || new chorus.models.Instance();
        },

        showFieldset : function(e) {
            this.$("fieldset").addClass("collapsed");

            $(e.currentTarget).closest("fieldset").removeClass("collapsed");
        },

        createInstance : function(e) {
            e.preventDefault();

            var updates = {};
            var inputSource = this.$("input[name=instance_type]:checked").closest("fieldset");
            _.each(inputSource.find("input[type=text], input[type=hidden], textarea"), function(i) {
                var input = $(i);
                updates[input.attr("name")] = input.val().trim();
            });

            updates.shared = inputSource.find("input[name=shared]").prop("checked") ? "yes" : "no";

            this.model.save(updates);
        }
    });
})(jQuery, chorus);