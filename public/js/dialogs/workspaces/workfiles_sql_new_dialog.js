chorus.dialogs.WorkfilesSqlNew = chorus.dialogs.Base.extend({
    className:"workfiles_sql_new",
    title:t("workfiles.sql_dialog.title"),

    persistent:true,

    events:{
        "submit form":"create"
    },

    makeModel:function () {
        this.model = this.model || new chorus.models.Workfile({
            workspaceId:this.options.launchElement.data("workspace-id")
        })
    },

    setup:function () {
        this.resource.bind("saved", this.saved, this);
    },

    create:function create(e) {
        e.preventDefault();

        var fileName = this.$("input[name=fileName]").val().trim();

        this.resource.set({
            fileName:fileName ? fileName + ".sql" : ""
        })

        this.resource.save({source:"empty"}, {url:$(e.target).attr("action")});
    },

    saved:function () {
        $(document).trigger("close.facebox");
        chorus.router.navigate(this.model.showUrl(), true);
    }
});