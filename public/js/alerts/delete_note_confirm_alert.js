chorus.alerts.DeleteNoteConfirmAlert = chorus.alerts.Base.extend({
    text:t("instances.remove_shared_account.text"),
    title:t("instances.remove_shared_account.title"),
    ok:t("instances.remove_shared_account.remove"),

    confirmAlert:function () {
        this.trigger("deleteNote");
        $(document).trigger("close.facebox");
    }
});
