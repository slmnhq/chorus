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
            this.model = ns.models.Accountmap.findByInstanceId(this.options.pageModel.get("id"))
            this.model.bind("saved", this.saved, this);

            this._super("makeModel")

            this.instance = this.options.pageModel;
            this.accountMap = this.model;
        },

        context : function() {
            var ctx = new chorus.presenters.Base(this.accountMap)
            return _.extend(ctx, this.instance.attributes, { ownerImageUrl : this.options.pageModel.owner().imageUrl() })
        },


        editCredentials : function(event) {
            event.preventDefault();
            $(event.target).closest("li").addClass("editing");
        },

        save : function(event) {
            event.preventDefault();
            this.accountMap.save({
                dbUserName : this.$("input[name=dbUserName]").val(),
                dbPassword : this.$("input[name=dbPassword]").val()
            });
        },

        cancel : function(event) {
            event.preventDefault();
            this.$("li").removeClass("editing");
        },

        saved : function() {
            this.$("li").removeClass("editing")
        }
    });
})(chorus);