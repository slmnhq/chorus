chorus.alerts.WorkfileConflict = chorus.alerts.Base.extend({
    constructorName: "WorkfileConflict",

    text:t("workfile.conflict.alert.text"),
    ok:t("workfile.conflict.alert.submit"),
    cancel:t("workfile.conflict.alert.cancel"),
    additionalClass:"error",

    setup:function () {
        this.title = this.model.serverErrorMessage();
        this.model.serverErrors = {};
    },

    postRender:function () {
        this.$("button.cancel").click(_.bind(function () {
            this.discardChanges();
        }, this))

        _.delay(_.bind(function () {
            this.$("button.submit").focus()
        }, this), 250);
    },

    confirmAlert:function () {
        this.dialog = new chorus.dialogs.WorkfileNewVersion({ launchElement:this, pageModel:this.model });
        this.dialog.launchModal();
    },

    discardChanges:function () {
        var draft = new chorus.models.Draft({workspaceId:this.model.workspace().id, workfileId:this.model.get("id")});
        this.bindings.add(draft, "change", function (draft) {
            draft.destroy();
        });

        draft.fetch();
        this.model.fetch();
        this.closeModal();
    }
});

