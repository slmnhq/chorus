chorus.models.CommentInsight = chorus.models.Base.extend({
    urlTemplate: function() {
        return "commentinsight/{{id}}/{{action}}";
    }
}, {
    count: function() {
        var count = new chorus.models.Base();
        count.urlTemplate = "commentinsight/count";
        return count;
    }
});
