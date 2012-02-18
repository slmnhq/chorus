chorus.models.CommentInsight = chorus.models.Base.extend({
    urlTemplate: function() {
        if (this.attributes.action && this.attributes.action == "count") {
            return "commentinsight/count";

        } else if (this.attributes.action) {
            return "commentinsight/{{id}}/{{action}}";
        }

        return "commentinsight";
    }
});
