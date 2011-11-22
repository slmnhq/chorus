(function($, ns) {
    ns.WorkfilesNew = chorus.dialogs.Base.extend({
        className : "workfiles_new",
        title : t("workfiles.dialog.title"),

        persistent: true,

        events : {
            "submit form" : "create"
        },

        makeModel : function() {
            this.model = this.model || new chorus.models.Workfile({workspaceId : this.options.workspaceId})
        },

        setup : function(){
            this.resource.bind("saved", this.saved, this);
        },

        create: function create(e){
            e.preventDefault();

            this.resource.set({
                fileName : this.$("input[name=fileName]").val() + ".sql",
            })

            this.resource.save({source : "empty"},{url : $(e.target).attr("action")});
        },

        saved : function () {
            $(document).trigger("close.facebox");
            chorus.router.navigate("/workfiles/" + this.model.get("id"), true);
        }
    });
})(jQuery, chorus.dialogs);
