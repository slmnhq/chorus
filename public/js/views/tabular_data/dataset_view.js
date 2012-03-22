chorus.views.Dataset = chorus.views.Base.extend({
    className: "dataset",
    tagName: "li",

    subviews: {
        ".comment .body": "commentBody"
    },

    setupSubviews: function() {
        this.commentBody = new chorus.views.TruncatedText({
            model: this.model.lastComment(),
            attribute: "body",
            attributeIsHtmlSafe: true
        });
    },

    postRender: function() {
        this.$("a.instance, a.database").data("instance", this.model.get("instance"));
        var $menu = this.$('.found_in .open_other_menu');
        chorus.menu($menu, {
            content: $menu.parent().find('.other_menu'),
            classes: "found_in_other_workspaces_menu"
        });

        if (!this.model.hasCredentials()) {
            $(this.el).addClass("no_credentials");
        }
    },

    additionalContext: function() {
        var recentComment = this.model.lastComment();
        var ctx = {
            dataset: this.model.asDataset(),
            showUrl: this.model.showUrl(),
            hasCredentials: this.model.hasCredentials(),
            iconImgUrl: this.model.iconUrl(),
            importFrequency: chorus.helpers.importFrequencyForModel(this.model),
            workspaces: this.model.get("workspaceUsed") && this.model.get("workspaceUsed").workspaceList,
            activeWorkspace: !!this.options.activeWorkspace
        };

        if (recentComment) {
            var date = Date.parseFromApi(recentComment.get("commentCreatedStamp"));
            ctx.lastComment = {
                body: recentComment.get("body"),
                creator: recentComment.author(),
                on: date && date.toString("MMM d")
            }
            ctx.otherCommentCount = parseInt(this.model.get("commentCount"), 10) - 1;
        }

        return ctx;
    }
});
