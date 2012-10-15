chorus.dialogs.ComposeKaggleMessage = chorus.dialogs.Base.extend({
    constructorName: "ComposeKaggleMessage",
    templateName: "kaggle/compose_kaggle_message_dialog",
    title: t("kaggle.compose.title"),
    events: {
        "click button.submit": 'save'
    },

    postRender: function() {
        this.$(".more-info").qtip({
            content: "<h1>" + t('kaggle.compose.tooltip.title') + "</h1>\
                <dl>\
                    <dt>" + t('kaggle.compose.tooltip.callToAction.title') + "</dt><dd>" + t('kaggle.compose.tooltip.callToAction.description') + "</dd> \
                    <dt>" + t('kaggle.compose.tooltip.bePositive.title') + "</dt><dd>" + t('kaggle.compose.tooltip.bePositive.description') + "</dd>\
                    <dt>" + t('kaggle.compose.tooltip.support.title') + "</dt><dd>" + t('kaggle.compose.tooltip.support.description') + "</dd>\
                    <dt>" + t('kaggle.compose.tooltip.characterCount.title') + "</dt><dd>" + t('kaggle.compose.tooltip.characterCount.description') + "</dd>\
                 </dl>",
            style: {
                classes: "tooltip-tips tooltip-modal",
                tip: {
                    def: false,
                    height: 5,
                    classes: 'hidden'
                }
            }
        });
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
        this.bindings.add(this.model, "saved", this.saved);
    },

    saved: function () {
        this.closeModal();
        chorus.toast('kaggle.compose.success');
    }
});
