chorus.views.DashboardWorkspaceList = chorus.views.Base.extend({
    className: "dashboard_workspace_list",
    tagName: "ul",
    additionalClass: "list",
    useLoadingSection: true,

    setup: function() {
        chorus.PageEvents.subscribe("insight:promoted", this.fetchWorkspaces, this);
    },

    fetchWorkspaces: function() {
        this.collection.fetch();
    },

    collectionModelContext: function(model) {
        var comments = model.comments().models;
        var numComments = model.get("numberOfComment");
        var numInsights = model.get("numberOfInsight");
        var commentInsightCountString;
        if (numComments > 0) {
            if (numInsights > 0) {
                commentInsightCountString = t("dashboard.workspaces.recent_comments_and_insights", {
                    recent_comments: t("dashboard.workspaces.recent_comments", {count: numComments}),
                    recent_insights: t("dashboard.workspaces.recent_insights", {count: numInsights})
                })
            } else {
                commentInsightCountString = t("dashboard.workspaces.recent_comments", {count: numComments})
            }
        } else if (numInsights > 0) {
            commentInsightCountString = t("dashboard.workspaces.recent_insights", {count: numInsights})
        } else {
            commentInsightCountString = t("dashboard.workspaces.no_recent_comments_or_insights")
        }

        return {
            imageUrl: model.defaultIconUrl(),
            showUrl: model.showUrl(),
            commentInsightCountString: commentInsightCountString,
            insightCount: numInsights,
            latestComment: comments[0] && {
                timestamp: comments[0].get("timestamp"),
                author: comments[0].author().displayName()
            }
        }
    },

    postRender: function() {
        this.collection.each(function(workspace) {
            var li = this.$("li[data-id=" + workspace.get("id") + "]");
            var commentList = new chorus.views.CommentList({
                collection: workspace.comments(),
                initialLimit: 5,
                displayStyle: 'without_workspace'
            });
            var el = $(commentList.render().el);
            el.find("ul").addClass("tooltip");

            // reassign the offset function so that when qtip calls it, qtip correctly positions the tooltips
            // with regard to the fixed-height header.
            var viewport = $(window);
            var top = $("#header").height();
            viewport.offset = function() {
                return { left: 0, top: top };
            }

            li.find(".comment .count").qtip({
                content: el.html(),
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
                    classes: "tooltip-white",
                    tip: {
                        width: 15,
                        height: 20
                    }
                }
            });
        }, this);
    }
});