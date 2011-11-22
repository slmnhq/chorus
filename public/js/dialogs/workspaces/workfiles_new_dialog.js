(function($, ns) {
    ns.WorkfilesNew = chorus.dialogs.Base.extend({
        className : "workfiles_new",
        title : t("workfiles.dialog.title"),

        persistent: true,

        events : {
            "submit" : "create"
        },

        makeModel : function() {
            this.model = this.model || new chorus.models.Workfile({workspaceId : 4})
        },

        setup : function(){
            this.resource.bind("saved", this.saved, this);
        },

        create: function create(e){
            e.preventDefault();

            this.resource.set({
                name : this.$("input[name=name]").val(),
                type : "sql"
            })

            this.resource.save();
        },

        saved : function () {
            $(document).trigger("close.facebox");
            chorus.router.navigate("/workfiles/" + this.model.get("id"), true);
        }
    });
})(jQuery, chorus.dialogs);
