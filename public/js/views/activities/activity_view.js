;(function($, ns) {
    ns.views.Activity = chorus.views.Base.extend({
        className : "activity",

        additionalContext : function() {
            var author = this.model.author();

            var comments = this.model.get("comments");
            var subComments = _.map(comments, function(comment) {
                comment = new chorus.models.Comment(comment)
                var user = comment.creator();
                var ctx = {
                    imageUrl : user.imageUrl({ size : "icon" }),
                    authorShowUrl : user.showUrl(),
                    displayName : user.displayName(),
                    timestamp : comment.get("timestamp"),
                    id : comment.get("id")
                };

                if (comment.get("text")) {
                    ctx.body = comment.get("text")
                }

                return ctx;
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