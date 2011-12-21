(function($, ns) {
    ns.DashboardWorkspaceList = chorus.views.Base.extend({
        className : "dashboard_workspace_list",
        tagName : "ul",
        additionalClass : "list",

        collectionModelContext: function(model) {
            return {
                imageUrl : model.defaultIconUrl(),
                showUrl : model.showUrl(),
                latestComment : model.get("latestCommentList")[0]
            }
        },

        setupSubviews: function() {
            this.commentLists = this.collection.map(function(workspace) {
                return new chorus.views.CommentList({ collection: workspace.comments() });
            });
        },

        postRender: function() {
            var self = this;
            this.$(".comment .count").each(function(i, el) {
                $(el).qtip({
                    content: $(self.commentLists[i].render().el).html(),
                    show: 'mouseover',
                    // hide: 'mouseout',
                    hide: 'click',
                    style: {
                        width: 300
                    },
                    position : {
                        corner : {
                            target: "rightMiddle",
                            tooltip: "leftMiddle"
                        },
                        adjust : {
                            screen : true
                        },
                        type : 'fixed',
                        container: self.el
                    },
                });
            });
        }
    });
})(jQuery, chorus.views);
