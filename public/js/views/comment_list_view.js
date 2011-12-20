(function($, ns) {
    ns.views.CommentList = ns.views.Base.extend({
        className : "comment_list",

        setup : function() {
            this.collection.fetch();
            this.collection.bind("changed", this.render, this);
        },

        additionalContext: function() {
            return { initialLimit: this.options.initialLimit || 2 };
        },

        collectionModelContext : function(comment) {
            var user = comment.creator();
            return  {
                imageUrl : user.imageUrl({ size : "icon" }),
                authorShowUrl : user.showUrl(),
                displayName : user.displayName(),
                timestamp : comment.get("timestamp"),
                id : comment.get("id"),
                body : comment.get("text")
            };
        }
    });
})(jQuery, chorus);

