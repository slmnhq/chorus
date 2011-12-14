;(function($, ns) {
    ns.views.Activity = chorus.views.Base.extend({
        className : "activity",

        additionalContext : function() {
            var author = this.model.author();

            var comments = this.model.get("comments");
            var subComments = _.map(comments, function(comment) {
                comment = new chorus.models.Comment(comment)
                var user = comment.creator();
                return {
                    imageUrl : user.imageUrl(),
                    authorShowUrl : user.showUrl(),
                    displayName : user.displayName(),
                    timestamp : comment.get("timestamp"),
                    body : comment.get("text")
                };
            });

            return {
                imageUrl : author.imageUrl(),
                headerHtml : this.model.headerHtml(),
                body : this.model.get("text"),
                timestamp : this.model.get("timestamp"),
                subComments : subComments
            }
        }
    });
})(jQuery, chorus);