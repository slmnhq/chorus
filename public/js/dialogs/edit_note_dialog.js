chorus.dialogs.EditNote = chorus.dialogs.Base.include(
    chorus.Mixins.ClEditor
).extend({
    className: "edit_note",

    events: {
        "submit form": "submit"
    },

    setup: function(options) {
        this.activity = this.options.launchElement.data('activity');
        this.title = this.activity.isInsight() ? t("notes.edit_dialog.insight_title") : t("notes.edit_dialog.note_title");
        this.model = this.activity.toComment();
    },

    postRender: function() {
        this.$("textarea").val(this.activity.get("text"));
        var self = this;
        _.defer(function() {
            self.makeEditor(self.$("form"), ".toolbar", "body", { width: 350 });
        });
    },

    submit: function(e) {
        e && e.preventDefault()
        var newText = this.$("textarea").val();
        this.model.save({ body: newText }, { success: _.bind(this.submitSucceeds, this) })
    },

    submitSucceeds: function() {
        this.closeModal();
    }
});
