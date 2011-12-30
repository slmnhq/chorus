(function($, ns) {
    ns.dialogs.InstancesNew = chorus.dialogs.Base.extend({
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

            this.model.aurora().fetch(); // check if aurora is installed or not
            this.model.aurora().bind("change", this.render, this);
        },

        additionalContext : function() {
            return {
                auroraInstalled : this.model.aurora().get("installationStatus") == 'install_succeed' ? true : false
            }
        },

        showFieldset : function(e) {
            this.$("fieldset").addClass("collapsed");

            $(e.currentTarget).closest("fieldset").removeClass("collapsed");
            this.$("button.submit").removeAttr("disabled");

            this.clearErrors();
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

            this.$("button.submit").startLoading("instances.new_dialog.saving");
            this.$("button.cancel").attr("disabled", "disabled");
            this.model.save(updates);
        },

        saveSuccess : function() {
            chorus.page.trigger("instance:added", this.model.get("id"));
            this.closeModal();
        },

        saveFailed : function() {
            this.$("button.submit").stopLoading();
            this.$("button.cancel").removeAttr("disabled");
        },

        postRender : function() {
            var helpElements = this.$(".help");
            _.each(helpElements, function(element) {
                var backgroundColor = '#282828';
                $(element).qtip({
                    content: $(element).data("text"),
                    show: 'mouseover',
                    hide: 'mouseout',
                    style: {
                        width: 320,
                        background: backgroundColor,
                        color: "#FFF",
                        'font-size': 13,
                        border: { color: backgroundColor },
                        tip: {
                            corner: 'bottomMiddle',
                            color: backgroundColor,
                            size: {
                                x: 19,
                                y : 11
                            }
                        }
                    },
                    position : {
                        corner : {
                            target: "topMiddle",
                            tooltip: "bottomMiddle"
                        },
                        adjust : {
                            screen : true,
                            scroll : false,
                            mouse: false
                        }
                    }
                });
            });
        }
    });
})(jQuery, chorus);