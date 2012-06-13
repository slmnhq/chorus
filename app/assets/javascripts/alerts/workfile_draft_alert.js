chorus.alerts.WorkfileDraft = chorus.alerts.Base.extend({
    constructorName: "WorkfileDraft",

    text:t("workfile.alert.text"),
    title:t("workfile.alert.title"),
    ok:t("workfile.alert.open_draft"),
    cancel:t("workfile.alert.latest_version"),
    additionalClass:"info",

    postRender:function () {
        _.delay(_.bind(function () {
            this.$("button.submit").focus()
        }, this), 250);
    },

    confirmAlert:function () {
        var draft = new chorus.models.Draft({workspaceId:this.model.workspace().id, workfileId:this.model.get("id")});
        this.bindings.add(draft, "change", function (draft) {
            this.closeModal();
            this.model.isDraft = true;
            this.model.content(draft.get("content"));
        });

        draft.fetch();
    },

    cancelAlert:function () {
        var draft = new chorus.models.Draft({workspaceId:this.model.workspace().id, workfileId:this.model.get("id"), id:"Dummy"});

        this.bindings.add(draft, "change", function () {
            draft.destroy();
        });

        this.bindings.add(draft, "destroy", function () {
            this.closeModal();
            this.model.set({ hasDraft:false })

        });

        draft.fetch();
    }
});

