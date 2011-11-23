(function($, ns) {
    ns.WorkfilesSqlNew = chorus.dialogs.Base.extend({
        className : "workfiles_sql_new",
        title : t("workfiles.sql_dialog.title"),

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

            var fileName = this.$("input[name=fileName]").val();

            this.resource.set({
                fileName : fileName ? fileName + ".sql" : ""
            })

            this.resource.save({source : "empty"},{url : $(e.target).attr("action")});
        },

        saved : function () {
            $(document).trigger("close.facebox");
            chorus.router.navigate("/workspace/"+this.options.workspaceId+"/workfile/" + this.model.get("id"), true);
        }
    });
})(jQuery, chorus.dialogs);
