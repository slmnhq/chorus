(function($, ns) {
    ns.dialogs.InstancesNew = chorus.dialogs.Base.extend(_.extend({}, chorus.Mixins.ViewUtils, {
        className : "instances_new",
        title : t("instances.new_dialog.title"),

        persistent: true,

        events : {
            "change input[type='radio']" : "showFieldset",
            "click button.submit" : "createInstance"
        },

        setup: function() {
            this.model.bind("saved", this.saveSuccess, this);
            this.model.bind("saveFailed", this.saveFailed, this);
            this.model.bind("validationFailed", this.saveFailed, this);
        },

        makeModel : function() {
            this.model = this.model || new chorus.models.Instance();
        },

        showFieldset : function(e) {
            this.$("fieldset").addClass("collapsed");

            $(e.currentTarget).closest("fieldset").removeClass("collapsed");
            this.$("button.submit").removeAttr("disabled");
        },

        createInstance : function(e) {
            e.preventDefault();

            var updates = {};
            var inputSource = this.$("input[name=instance_type]:checked").closest("fieldset");
            _.each(inputSource.find("input[type=text], input[type=hidden], input[type=password], textarea"), function(i) {
                var input = $(i);
                updates[input.attr("name")] = input.val().trim();
            });

            updates.shared = inputSource.find("input[name=shared]").prop("checked") ? "yes" : "no";

            this.model.save(updates);
            this.disableButtonWithSpinner("button.submit", "instances.new_dialog.saving");
            this.$("button.cancel").attr("disabled", "disabled");
        },

        saveSuccess : function() {
            this.trigger("instance:added");
            this.closeModal();
        },

        saveFailed : function() {
            this.restoreDisabledButton("button.submit", "instances.new_dialog.save");
            this.$("button.cancel").removeAttr("disabled");
        }
    }));
})(jQuery, chorus);