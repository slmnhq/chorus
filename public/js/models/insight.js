chorus.models.Insight = chorus.models.Comment.extend({
    urlParams: function() {
        return _.extend(this._super('urlParams') || {}, { isInsight: true });
    }
});