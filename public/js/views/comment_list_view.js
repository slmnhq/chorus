chorus.views.CommentList = chorus.views.Base.extend({
    className:"comment_list",

    setup:function () {
    },

    additionalContext:function () {
        return { initialLimit:this.options.initialLimit || 2 };
    },

    collectionModelContext:function (comment) {
        if (comment.note()) {
            return new chorus.presenters.Activity(comment, {displayStyle:this.options.displayStyle})
        } else {
            var user = comment.author();
            return  {
                iconSrc:user.imageUrl({ size:"icon" }),
                iconHref:user.showUrl(),
                displayName:user.displayName(),
                timestamp:comment.get("timestamp"),
                id:comment.get("id"),
                body:comment.get("text"),
                headerHtml:t('activity_stream.comments.commented_on_note', {authorLink:chorus.helpers.linkTo(user.showUrl(), user.displayName(), {'class':'author'})})
            };
        }
    }
});
