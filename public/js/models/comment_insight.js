chorus.models.CommentInsight = chorus.models.Base.extend({
    urlTemplate: function() {
        return "commentinsight/{{id}}/{{action}}";
    }
}, {
    count: function(options) {
        options || (options = {});
        var count = new chorus.models.Base();
        count.urlTemplate = "commentinsight/count";
        count.urlParams = options.urlParams;
        return count;
    }
});
