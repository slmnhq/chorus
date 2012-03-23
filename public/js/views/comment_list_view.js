chorus.views.CommentList = chorus.views.Base.extend({
    constructorName: "CommentListView",
    className:"comment_list",

    setup:function () {
    },

    additionalContext:function () {
        return {
            initialLimit:this.options.initialLimit || 2,
            entityType: this.collection.attributes.entityType,
            entityId: this.collection.attributes.entityId
        };
    },

    collectionModelContext:function (comment) {
        if (comment.note()) {
            return new chorus.presenters.Activity(comment, {displayStyle:this.options.displayStyle})
        } else {
            var author = comment.author();
            return  {
                isOwner: (author.id == chorus.session.user().id) || this.options.currentUserOwnsWorkspace,
                iconSrc: author.imageUrl({ size:"icon" }),
                iconHref: author.showUrl(),
                displayName: author.displayName(),
                timestamp: comment.get("timestamp"),
                id: comment.get("id"),
                body: comment.get("text"),
                headerHtml: new Handlebars.SafeString(t('activity_stream.comments.commented_on_note', {authorLink:chorus.helpers.linkTo(author.showUrl(), author.displayName(), {'class':'author'}).toString()}))
            };
        }
    }
});
