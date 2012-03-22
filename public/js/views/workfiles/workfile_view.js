chorus.views.Workfile = chorus.views.Base.extend({
    className:"workfile",
    tagName: "li",

    postRender: function() {
        $(this.el).attr('data-id', this.model.id);
    },

    additionalContext: function() {
        var ctx = new chorus.presenters.Artifact(this.model, {iconSize:'large'});

        ctx.activeWorkspace = this.options.activeWorkspace;

        var lastComment = this.model.lastComment();
        if (lastComment) {
            var date = Date.parseFromApi(lastComment.get("commentCreatedStamp"))

            ctx.lastComment = {
                body:lastComment.get("body"),
                creator:lastComment.author(),
                on:date && date.toString("MMM d")
            }

            ctx.otherCommentCount = parseInt(this.model.get("commentCount"), 10) - 1;
        }

        return ctx;
    }
});
