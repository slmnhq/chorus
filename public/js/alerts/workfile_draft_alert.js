chorus.alerts.WorkfileDraft = chorus.alerts.Base.extend({
    text:t("workfile.alert.text"),
    title:t("workfile.alert.title"),
    ok:t("workfile.alert.open_draft"),
    cancel:t("workfile.alert.latest_version"),
    additionalClass:"info",

    postRender:function () {
        this.$("button.cancel").click(_.bind(function () {
            this.deleteDraft();
        }, this))

        _.delay(_.bind(function () {
            this.$("button.submit").focus()
        }, this), 250);
    },

    confirmAlert:function () {
        var draft = new chorus.models.Draft({workspaceId:this.model.get("workspaceId"), workfileId:this.model.get("id")});
        this.bindings.add(draft, "change", function (draft) {
            this.model.isDraft = true;
            this.model.content(draft.get("draftInfo").content);
        });

        draft.fetch();
        this.closeModal();
    },

    deleteDraft:function () {
        var draft = new chorus.models.Draft({workspaceId:this.model.get("workspaceId"), workfileId:this.model.get("id"), id:"Dummy"});

        this.bindings.add(draft, "change", function () {
            draft.destroy();
        });

        this.bindings.add(draft, "destroy", function () {
            this.model.set({ hasDraft:false })
        });

        draft.fetch();
    }
});

