chorus.models.Insight = chorus.models.Comment.extend({
    constructorName: "Insight",
    urlParams: function() {
        return _.extend(this._super('urlParams') || {}, { isInsight: true });
    }
});