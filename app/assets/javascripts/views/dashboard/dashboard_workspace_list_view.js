chorus.views.DashboardWorkspaceList = chorus.views.Base.extend({
    constructorName: "DashboardWorkspaceListView",
    templateName: "dashboard/workspace_list",
    tagName: "ul",
    additionalClass: "list",
    useLoadingSection: true,

    setup: function() {
        chorus.PageEvents.subscribe("insight:promoted", this.fetchWorkspaces, this);
    },

    fetchWorkspaces: function() {
        this.collection.attributes.active = true;
        this.collection.fetch();
    },

    collectionModelContext: function(model) {
        var comments = model.comments().models;
        var numComments = model.get("numberOfComments");
        var numInsights = model.get("numberOfInsights");
        var insightCountString;
        if (numComments > 0) {
            if (numInsights > 0) {
                insightCountString = t("dashboard.workspaces.recent_comments_and_insights", {
                    recent_comments: t("dashboard.workspaces.recent_comments", {count: numComments}),
                    recent_insights: t("dashboard.workspaces.recent_insights", {count: numInsights})
                })
            } else {
                insightCountString = t("dashboard.workspaces.recent_comments", {count: numComments})
            }
        } else if (numInsights > 0) {
            insightCountString = t("dashboard.workspaces.recent_insights", {count: numInsights})
        } else {
            insightCountString = t("dashboard.workspaces.no_recent_comments_or_insights")
        }

        return {
            imageUrl: model.defaultIconUrl(),
            showUrl: model.showUrl(),
            insightCountString: insightCountString,
            insightCount: numInsights,
            latestComment: comments[0] && {
                timestamp: comments[0].get("timestamp"),
                author: comments[0].author().displayName()
            }
        }
    },

    cleanupCommentLists: function() {
        _.each(this.commentLists, function(commentList) {
            commentList.teardown();
        });
    },

    removeOldLis: function() {
        _.each(this.lis, function(li) {
            $(li).remove();
        });
    },

    postRender: function() {
        this.cleanupCommentLists();
        this.commentLists = [];
        this.removeOldLis();
        this.lis = [];

        this.collection.each(function(workspace) {
            var comments = workspace.comments();
            comments.comparator = function(comment) {
                return -(new Date(comment.get('timestamp')).valueOf());
            };
            comments.sort();
            comments.loaded = true;
            var commentList = new chorus.views.ActivityList({
                collection: comments,
                initialLimit: 5,
                displayStyle: 'without_workspace',
                isReadOnly: true
            });
            this.registerSubView(commentList);
            this.commentLists.push(commentList);

            var el = $(commentList.render().el);
            el.find("ul").addClass("tooltip activity");

            // reassign the offset function so that when qtip calls it, qtip correctly positions the tooltips
            // with regard to the fixed-height header.
            var viewport = $(window);
            var top = $("#header").height();
            viewport.offset = function() {
                return { left: 0, top: top };
            };

            var li = this.$("li[data-id=" + workspace.get("id") + "]");
            this.lis.push(li);
            li.find(".comment .count").qtip({
                content: el,
                show: {
                    event: 'mouseover',
                    solo: true
                },
                hide: {
                    delay: 500,
                    fixed: true,
                    event: 'mouseout'
                },
                position: {
                    viewport: viewport,
                    my: "right center",
                    at: "left center"
                },
                style: {
                    classes: "tooltip-white recent_comments_list",
                    tip: {
                        width: 15,
                        height: 20
                    }
                },
                events: {
                    show: function(e) {
                        commentList.render();
                        commentList.show();
                    }
                }
            });
        }, this);
    }
});