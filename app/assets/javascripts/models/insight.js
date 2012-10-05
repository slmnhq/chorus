chorus.models.Insight = chorus.models.Note.extend({
    constructorName: "Insight",
    parameterWrapper: "note",

    urlTemplate:function (options) {
        if (options && options.isFile) {
            return "notes/{{id}}/attachments"
        } else {
            return "notes/{{id}}";
        }
    },

    initialize: function() {
        this._super('initialize');
        this.set({ isInsight: true });
    },

    declareValidations:function (newAttrs) {
        this.require('body', newAttrs);
    }
});
