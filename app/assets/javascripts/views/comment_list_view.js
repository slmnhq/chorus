chorus.views.CommentList = chorus.views.Base.extend({
    constructorName: "CommentListView",
    templateName:"comment_list",

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
                iconSrc: author.fetchImageUrl({ size:"icon" }),
                iconHref: author.showUrl(),
                displayName: author.displayName(),
                timestamp: comment.get("timestamp"),
                id: comment.get("id"),
                headerHtml: new Handlebars.SafeString(t('activity.comments.commented_on_note', {authorLink:chorus.helpers.linkTo(author.showUrl(), author.displayName(), {'class':'author'}).toString()}))
            };
        }
    },

    postRender: function() {
        var $lis = this.$("li .comment_content .body");
        this.collection.each(function(comment, index) {
            comment.loaded = true;
            var view = new chorus.views.TruncatedText({model: comment, attribute: "text", attributeIsHtmlSafe: true});
            $lis.eq(index).append(view.render().el);
        });
    }
});
