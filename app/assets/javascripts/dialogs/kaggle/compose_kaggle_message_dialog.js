chorus.dialogs.ComposeKaggleMessage = chorus.dialogs.Base.extend({
    constructorName: "ComposeKaggleMessage",
    templateName: "kaggle/compose_kaggle_message_dialog",
    title: t("kaggle.compose.title"),
    events: {
        "click button.submit": 'save',
        "click .showMore": 'showMore',
        "click .showLess": 'showLess'
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

    setup: function(options) {
        this.recipients = options.recipients;
        this.workspace = options.workspace;
        this.maxRecipientCharacters = options.maxRecipientCharacters || 70;
        this._super('setup', arguments);
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
        var combinedNames = this.combineNames(this.model.get("recipients").models);
        return {
            fromEmail: chorus.session.user().get('email'),
            recipientNames: combinedNames,
            hasMoreRecipients: (combinedNames.full.length != combinedNames.short.length)
        };
    },

    makeModel: function (options) {
        this.model = new chorus.models.KaggleMessage({
            recipients: options.recipients,
            workspace: options.workspace
        });
        this.bindings.add(this.model, "saved", this.saved);
    },

    combineNames: function(recipients){
       var maxChars = this.maxRecipientCharacters;
       var short = "";
       var moreCount = 0;
       var recipientNames = _.reduce(recipients, function(result, recipient) {
           var fullNamesList = result + recipient.get("fullName") + ", ";
           if(fullNamesList.length <= maxChars + 2) {
               short = fullNamesList
           }
           else {
               moreCount += 1;
           }
           return fullNamesList;
       }, "");
       return ( { short: short.substring(0, short.length - 2),
           full: recipientNames.substring(0, recipientNames.length - 2),
           moreCount: moreCount } );
    },

    saved: function () {
        this.closeModal();
        chorus.toast('kaggle.compose.success');
    },

    showMore: function(e) {
        this.$('.kaggle_recipient.full').removeClass("hidden");
        this.$('.kaggle_recipient.short').addClass("hidden");
        return false;
    },

    showLess: function(e) {
        this.$('.kaggle_recipient.short').removeClass("hidden");
        this.$('.kaggle_recipient.full').addClass("hidden");
        return false;
    }
});
