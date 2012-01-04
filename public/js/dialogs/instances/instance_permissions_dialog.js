;(function(ns){
    ns.dialogs.InstancePermissions = ns.dialogs.Base.extend({
        className : "instance_permissions",
        title : t("instances.permissions_dialog.title"),
        persistent : true,

        events : {
            "click a.edit" : "editCredentials",
            "click a.save" : "save",
            "click a.cancel" : "cancel"
        },

        makeModel : function() {
            this.model = ns.models.InstanceAccount.findByInstanceId(this.options.pageModel.get("id"))
            this.model.bind("saved", this.saved, this);
            this.model.bind("saveFailed", this.saveFailed, this);
            this.model.bind("validationFailed", this.saveFailed, this);

            this._super("makeModel")

            this.instance = this.options.pageModel;
            this.account = this.model;
        },

        context : function() {
            var ctx = new chorus.presenters.Base(this.account)
            return _.extend(ctx, this.instance.attributes, { ownerImageUrl : this.options.pageModel.owner().imageUrl() })
        },


        editCredentials : function(event) {
            event.preventDefault();
            $(event.target).closest("li").addClass("editing");
        },

        save : function(event) {
            event.preventDefault();
            this.$("a.save").startLoading("instances.permissions.saving")

            this.account.save({
                dbUserName : this.$("input[name=dbUserName]").val(),
                dbPassword : this.$("input[name=dbPassword]").val()
            });
        },

        cancel : function(event) {
            event.preventDefault();
            this.$("li").removeClass("editing");
        },

        saved : function() {
            this.$("a.save").stopLoading();
            this.$("li").removeClass("editing");
            this.instance.fetch();
        },

        saveFailed : function() {
            this.$("a.save").stopLoading();
        }
    });
})(chorus);
