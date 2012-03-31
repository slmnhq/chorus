chorus.dialogs.EditNote = chorus.dialogs.Base.include(
    chorus.Mixins.ClEditor
).extend({
    className: "edit_note",
    persistent: true,

    events: {
        "submit form": "submit"
    },

    setup: function(options) {
        this.activity = this.options.launchElement.data('activity');
        this.title = this.activity.isInsight() ? t("notes.edit_dialog.insight_title") : t("notes.edit_dialog.note_title");
        this.resource = this.model = this.activity.toComment();

        this.bindings.add(this.resource, "validationFailed", this.showErrors);
        this.bindings.add(this.resource, "saved", this.submitSucceeds);
    },

    showErrors: function(model) {
        this.$("button.submit").stopLoading();
        this._super("showErrors");

        if (!model) {
            model = this.resource
        }

        if (model.errors && model.errors.body) {
            var $input = this.$(".cleditorMain");
            this.markInputAsInvalid($input, model.errors.body, true);

            this.$("iframe").contents().find("body").css("margin-right", "20px")
            this.$(".cleditorMain").css("width", "330px")
        }
    },

    postRender: function() {
        this.$("textarea").val(this.activity.get("text"));

        _.defer(_.bind(function() {
            this.makeEditor($(this.el), ".toolbar", "body", { width: 350 });
        }, this));
    },

    submit: function(e) {
        e && e.preventDefault()
        this.$("button.submit").startLoading("actions.saving");

        var newText = this.getNormalizedText(this.$("textarea"));
        var cleanText = _.trim($.stripHtml(newText));

        if (cleanText === "") {
            // if the user only has whitespace, force validation failure on the model
            newText = "";
        }

        this.model.save({ body: newText })
    },

    submitSucceeds: function() {
        this.$("button.submit").stopLoading();
        this.closeModal();
    }
});
