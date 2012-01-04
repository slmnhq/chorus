
(function($, ns) {
    ns.dialogs.InstancesEdit = chorus.dialogs.Base.extend({
        className : "instances_edit",
        title : t("instances.edit_dialog.title"),
        events : {
            "submit form" : "save"
        },
        makeModel : function() {
            this.model = this.options.pageModel;
        },

        setup: function() {
            this.model.bind("saved", this.saveSuccess, this);
        },

        additionalContext : function() {
            return {
               registeredInstance: this.options.pageModel.get("provisionType") =="register" ,
               provisionedInstance: this.options.pageModel.get("provisionType") == "create"
            }
        },

        save : function(e) {
            e.preventDefault();

            var attrs = {
                name: this.$("input[name=name]").val().trim(),
                description: this.$("textarea[name=description]").val().trim(),
                host : this.$("input[name=host]").val(),
                port : this.$("input[name=port]").val(),
                size : this.$("input[name=size]").val()
            };

            this.model.save(attrs);

        },

        saveSuccess : function() {
            this.closeModal();
        }

    });
})(jQuery, chorus);
