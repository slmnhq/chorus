chorus.dialogs.WorkfilesSqlNew = chorus.dialogs.Base.extend({
    className:"workfiles_sql_new",
    title:t("workfiles.sql_dialog.title"),

    persistent:true,

    events:{
        "keyup input[name=fileName]": "checkInput",
        "paste input[name=fileName]": "checkInput",
        "submit form":"create"
    },

    makeModel:function () {
        this.model = this.model || new chorus.models.Workfile({
            workspaceId:this.options.launchElement.data("workspace-id")
        })
    },

    setup:function () {
        this.bindings.add(this.resource, "saved", this.saved);
        this.bindings.add(this.resource, "saveFailed", this.saveFailed);
    },

    create:function create(e) {
        e.preventDefault();

        var fileName = this.$("input[name=fileName]").val().trim();

        this.resource.set({
            fileName:fileName ? fileName + ".sql" : ""
        })

        this.$("button.submit").startLoading("actions.adding")
        this.resource.save({source:"empty"});
    },

    saved:function () {
        $(document).trigger("close.facebox");
        chorus.router.navigate(this.model.showUrl(), true);
    },

    saveFailed: function() {
        this.$("button.submit").stopLoading();
    },

    checkInput: function() {
        var hasText = this.$("input[name=fileName]").val().trim().length > 0;
        this.$("button.submit").prop("disabled", hasText ? false : "disabled");
    }
});
