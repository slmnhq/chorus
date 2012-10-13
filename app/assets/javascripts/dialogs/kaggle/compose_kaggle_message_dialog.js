chorus.dialogs.ComposeKaggleMessage = chorus.dialogs.Base.extend({
    constructorName: "ComposeKaggleMessage",
    templateName: "kaggle/compose_kaggle_message_dialog",
    title: t("kaggle.compose.title"),
    events: {
        "click button.submit": 'save'
    },

    save: function (e) {
        e.preventDefault();
        this.model.save({
            from: this.$('input[name=from]').val(),
            message: this.$('textarea[name=message]').val(),
            subject: this.$('input[name=subject]').val()
        });
        this.$("button.submit").startLoading("kaggle.compose.saving");
    },

    additionalContext: function () {
        return {
            fromEmail: chorus.session.user().get('email'),
            recipientName: this.model.get('recipient').get('fullName')
        };
    },

    makeModel: function (options) {
        this.model = new chorus.models.KaggleMessage({
            recipient: options.recipient,
            workspace: options.workspace
        });
    }
});
