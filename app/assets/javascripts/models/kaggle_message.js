chorus.models.KaggleMessage = chorus.models.Base.extend({
    urlTemplate: "workspaces/{{workspace.id}}/kaggle/messages",

    paramsToSave: ['replyTo', 'subject', 'htmlBody', 'recipientIds'],

    declareValidations: function(newAttrs) {
        this.requireValidEmailAddress('replyTo', newAttrs);
        this.require('subject', newAttrs);
        this.require('htmlBody', newAttrs);
    },

    recipientIds: function() {
        var ids = _.pluck(this.get('recipients').models, 'id');
        return (ids);
    }
});