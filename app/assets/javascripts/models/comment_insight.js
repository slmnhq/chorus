chorus.models.CommentInsight = chorus.models.Base.extend({
    parameterWrapper : 'insight',
    urlTemplate: function() {
        return "insights";
    }
}, {
    count: function(options) {
        options || (options = {});
        var count = new chorus.models.Base();
        count.urlTemplate = "insights/count";
        count.urlParams = options.urlParams;
        return count;
    }
});
