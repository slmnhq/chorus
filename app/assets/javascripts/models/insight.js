chorus.models.Insight = chorus.models.Comment.extend({
    constructorName: "Insight",
    urlTemplate: "notes",
    parameterWrapper: "note",

    initialize: function() {
        this._super('initialize');
        this.set({ isInsight: true });
    },

    declareValidations:function (newAttrs) {
        this.require('body', newAttrs);
    },
});
