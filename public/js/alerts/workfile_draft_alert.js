;(function($, ns) {
    ns.alerts.WorkfileDraft = ns.alerts.Base.extend({
        text : t("workfile.alert.text"),
        title : t("workfile.alert.title"),
        ok : t("workfile.alert.open_draft"),
        cancel : t("workfile.alert.latest_version"),

        postRender : function() {
            this.$("button.cancel").click(_.bind(function() {
                this.deleteDraft();
            }, this))
        },

        confirmAlert : function() {
            var draft = new chorus.models.Draft({workspaceId : this.model.get("workspaceId"), workfileId: this.model.get("id")});
            draft.bind("change", function(draft) {
                this.model.isDraft = true;
                this.model.set({"content" : draft.get("content")});
            }, this);

            draft.fetch();
            this.closeModal();
        },

        deleteDraft : function() {
            var draft = new chorus.models.Draft({workspaceId : this.model.get("workspaceId"), workfileId: this.model.get("id")});
            draft.bind("change", function(draft) {
                draft.destroy();
            }, this);

            draft.fetch();
        }
    });
})(jQuery, chorus);
