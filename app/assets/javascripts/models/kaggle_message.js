chorus.models.KaggleMessage = chorus.models.Base.extend({
    urlTemplate: "workspaces/{{workspace.id}}/kaggle/messages",

    paramsToSave: ['replyTo', 'subject', 'htmlBody', 'recipientIds'],

    declareValidations: function(newAttrs) {
        this.requireValidEmailAddress('replyTo', newAttrs, 'validation.required_email');
        this.require('subject', newAttrs, 'validation.required_field');
        this.require('htmlBody', newAttrs, 'validation.required_field');
    },

    recipientIds: function() {
        var ids = _.pluck(this.get('recipients').models, 'id');
        return (ids);
    }
});